import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { computeRosePetalPlacement } from '../utils/loveLogic';
import {
  afterDraw,
  createContactShadowTexture,
  createGlowSpriteTexture,
  createVelvetMicroBumpTexture,
  detectSoftwareWebGL,
} from './webglUtils';

export type GardenCameraPreset = 'vista' | 'macro' | 'starlight';

interface GardenOptions {
  container: HTMLElement;
  onContextError?: () => void;
}

const _dummy = new THREE.Object3D();
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 1.4, 0);

function createCurvedPetalGeometry(): THREE.BufferGeometry {
  const geom = new THREE.PlaneGeometry(0.46, 0.62, 10, 12);
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i) + 0.31; // shift pivot to bottom of petal
    const ny = y / 0.62;
    const nx = x / 0.23;

    // Taper base and round upper tip into organic rose petal silhouette
    const clampedNy = THREE.MathUtils.clamp(ny, 0, 1);
    const widthProfile = Math.sin(Math.pow(clampedNy, 0.72) * Math.PI * 0.92);
    const shapedX = x * (0.28 + 0.85 * widthProfile);

    // Cupped inward curvature + subtle outward lip curl at top
    const cupZ =
      -0.14 * Math.sin(clampedNy * Math.PI) +
      0.065 * (nx * nx) +
      (clampedNy > 0.78 ? Math.pow((clampedNy - 0.78) / 0.22, 2) * 0.08 : 0);

    pos.setXYZ(i, shapedX, y, cupZ);
  }
  geom.computeVertexNormals();
  return geom;
}

function createLeafGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.18, 0.14, 0.22, 0.42, 0, 0.66);
  shape.bezierCurveTo(-0.22, 0.42, -0.18, 0.14, 0, 0);

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: 0.018,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.008,
    bevelSegments: 2,
    curveSegments: 10,
  });
  return geom;
}

export class RoseGardenController {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;
  private isSoftwareGl: boolean;
  private frameId = 0;
  private timerId = 0;
  private isDisposed = false;
  private isVisible = true;
  private isPaused = false;
  private preset: GardenCameraPreset = 'vista';
  private pointerX = 0;
  private pointerY = 0;
  private startTimeMs = performance.now();
  private lastTimeMs = performance.now();

  private roseGroups: THREE.Group[] = [];
  private petalsMesh!: THREE.InstancedMesh;
  private petalMeta: Array<{
    x: number;
    y: number;
    z: number;
    speed: number;
    swayFreq: number;
    swayAmp: number;
    rotSpeed: number;
    phase: number;
    scale: number;
  }> = [];
  private fireflies!: THREE.Points;
  private heartParticles!: THREE.Points;
  private disposables: Array<{ dispose: () => void }> = [];
  private observer: IntersectionObserver | null = null;

  constructor(options: GardenOptions) {
    this.container = options.container;
    this.isSoftwareGl = detectSoftwareWebGL();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(width, height);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    const bgColor = new THREE.Color('#14060B');
    this.scene.background = bgColor;
    this.scene.fog = new THREE.FogExp2('#14060B', 0.09);

    this.camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 60);
    this.camera.position.set(0, 3.1, 7.6);
    this.camera.lookAt(_currentLookAt);

    // Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = envTex;
    this.disposables.push(envTex);
    pmremGenerator.dispose();

    this.setupLighting();
    this.buildGardenStage();
    this.buildFloatingPetals();
    this.buildFirefliesAndHearts();

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      options.onContextError?.();
    });

    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    window.addEventListener('resize', this.handleResize);

    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const nextVisible = Boolean(entry?.isIntersecting);
          if (nextVisible && !this.isVisible) {
            this.isVisible = true;
            this.lastTimeMs = performance.now();
            this.scheduleNextFrame();
          } else {
            this.isVisible = nextVisible;
          }
        },
        { threshold: 0.02 },
      );
      this.observer.observe(this.container);
    }

    // Schedule first frame on next microtask/rAF rather than blocking mount
    this.scheduleNextFrame();
  }

  private setupLighting(): void {
    const hemi = new THREE.HemisphereLight('#F4A6B8', '#1C050C', 0.72);
    this.scene.add(hemi);

    const keyLight = new THREE.DirectionalLight('#FFE4C4', 2.1);
    keyLight.position.set(4.5, 8.5, 5.2);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 22;
    const d = 5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#A31336', 1.45);
    rimLight.position.set(-5.0, 4.2, -5.5);
    this.scene.add(rimLight);

    const warmGlow = new THREE.PointLight('#D8B46A', 2.4, 12, 1.8);
    warmGlow.position.set(0, 2.5, 1.2);
    this.scene.add(warmGlow);
  }

  private buildGardenStage(): void {
    const bumpTex = createVelvetMicroBumpTexture(this.renderer);
    const contactTex = createContactShadowTexture();
    this.disposables.push(bumpTex, contactTex);

    // Grounded dark marble/obsidian garden floor
    const floorGeom = new THREE.CircleGeometry(16, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#17060D',
      roughness: 0.76,
      metalness: 0.04,
      bumpMap: bumpTex,
      bumpScale: 0.015,
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Subtle champagne gold inlay ring on the dais (offset >= 0.02 on Y)
    const daisGeom = new THREE.RingGeometry(2.85, 2.92, 64);
    const daisMat = new THREE.MeshStandardMaterial({
      color: '#D8B46A',
      roughness: 0.22,
      metalness: 0.88,
      side: THREE.DoubleSide,
    });
    const daisRing = new THREE.Mesh(daisGeom, daisMat);
    daisRing.rotation.x = -Math.PI / 2;
    daisRing.position.y = 0.022;
    this.scene.add(daisRing);

    this.disposables.push(floorGeom, floorMat, daisGeom, daisMat);

    // Shared geometries and materials for composite multi-part roses
    const petalGeom = createCurvedPetalGeometry();
    const leafGeom = createLeafGeometry();
    const stamenGeom = new THREE.SphereGeometry(0.09, 12, 10);
    const sepalGeom = new THREE.ConeGeometry(0.08, 0.28, 5);
    const shadowGeom = new THREE.CircleGeometry(0.75, 24);

    const innerPetalMat = new THREE.MeshPhysicalMaterial({
      color: '#5A0519',
      roughness: 0.78,
      metalness: 0.02,
      sheen: 0.36,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color('#D64568'),
      bumpMap: bumpTex,
      bumpScale: 0.012,
      side: THREE.DoubleSide,
    });

    const outerPetalMat = new THREE.MeshPhysicalMaterial({
      color: '#8B0D2B',
      roughness: 0.72,
      metalness: 0.02,
      sheen: 0.42,
      sheenRoughness: 0.55,
      sheenColor: new THREE.Color('#E36D8B'),
      bumpMap: bumpTex,
      bumpScale: 0.01,
      side: THREE.DoubleSide,
    });

    const stemMat = new THREE.MeshStandardMaterial({
      color: '#1E3D28',
      roughness: 0.58,
      metalness: 0.05,
    });

    const leafMat = new THREE.MeshStandardMaterial({
      color: '#254C32',
      roughness: 0.34,
      metalness: 0.08,
    });

    const goldStamenMat = new THREE.MeshStandardMaterial({
      color: '#D8B46A',
      roughness: 0.24,
      metalness: 0.92,
      emissive: '#6E4C14',
      emissiveIntensity: 0.35,
    });

    const shadowMat = new THREE.MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    });

    this.disposables.push(
      petalGeom,
      leafGeom,
      stamenGeom,
      sepalGeom,
      shadowGeom,
      innerPetalMat,
      outerPetalMat,
      stemMat,
      leafMat,
      goldStamenMat,
      shadowMat,
    );

    const roseConfigs = [
      { x: 0, z: 0, height: 2.05, scale: 1.18, tiltX: 0.04, tiltZ: -0.02 },
      { x: -1.45, z: 0.55, height: 1.58, scale: 0.92, tiltX: 0.12, tiltZ: 0.15 },
      { x: 1.48, z: 0.42, height: 1.66, scale: 0.96, tiltX: 0.08, tiltZ: -0.16 },
      { x: -0.92, z: -1.25, height: 1.78, scale: 0.9, tiltX: -0.1, tiltZ: 0.09 },
      { x: 1.05, z: -1.18, height: 1.72, scale: 0.88, tiltX: -0.08, tiltZ: -0.11 },
    ];

    roseConfigs.forEach((cfg, idx) => {
      const roseRoot = new THREE.Group();
      roseRoot.position.set(cfg.x, 0, cfg.z);

      // Ground contact shadow disc
      const shadow = new THREE.Mesh(shadowGeom, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.015;
      shadow.scale.setScalar(cfg.scale);
      roseRoot.add(shadow);

      // Curved stem (TubeGeometry) grounded at y=0
      const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(cfg.tiltZ * 0.4, cfg.height * 0.45, cfg.tiltX * 0.35),
        new THREE.Vector3(cfg.tiltZ * 0.15, cfg.height, cfg.tiltX * 0.15),
      ]);
      const stemGeom = new THREE.TubeGeometry(stemCurve, 16, 0.042, 8, false);
      this.disposables.push(stemGeom);
      const stemMesh = new THREE.Mesh(stemGeom, stemMat);
      stemMesh.castShadow = !this.isSoftwareGl;
      roseRoot.add(stemMesh);

      // Two sculpted leaves along stem
      for (let l = 0; l < 2; l++) {
        const leaf = new THREE.Mesh(leafGeom, leafMat);
        const hFrac = l === 0 ? 0.42 : 0.64;
        leaf.position.set(0, cfg.height * hFrac, 0);
        leaf.rotation.set(0.75, l === 0 ? 0.5 : -2.5, l === 0 ? 0.4 : -0.4);
        leaf.scale.setScalar(0.68 * cfg.scale);
        leaf.castShadow = !this.isSoftwareGl;
        roseRoot.add(leaf);
      }

      // Bloom head group at top of stem
      const headGroup = new THREE.Group();
      headGroup.position.set(cfg.tiltZ * 0.15, cfg.height, cfg.tiltX * 0.15);
      headGroup.rotation.set(cfg.tiltX, idx * 0.9, cfg.tiltZ);
      headGroup.scale.setScalar(cfg.scale);

      // Golden stamen heart core
      const stamen = new THREE.Mesh(stamenGeom, goldStamenMat);
      stamen.position.y = 0.18;
      headGroup.add(stamen);

      // 5 green calyx sepals underneath bloom
      for (let s = 0; s < 5; s++) {
        const sepal = new THREE.Mesh(sepalGeom, leafMat);
        const a = (s / 5) * Math.PI * 2;
        sepal.position.set(Math.cos(a) * 0.16, 0.02, Math.sin(a) * 0.16);
        sepal.rotation.set(Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1);
        headGroup.add(sepal);
      }

      // 22 golden-angle phyllotaxis sculpted petals
      const petalCount = 22;
      for (let p = 0; p < petalCount; p++) {
        const placement = computeRosePetalPlacement(p, petalCount);
        const petal = new THREE.Mesh(
          petalGeom,
          p < 10 ? innerPetalMat : outerPetalMat,
        );
        const pivot = new THREE.Group();
        pivot.rotation.y = placement.angle;
        petal.position.set(0, placement.heightOffset, placement.radius * 0.42);
        petal.rotation.x = placement.tilt;
        petal.scale.setScalar(placement.scale);
        petal.castShadow = !this.isSoftwareGl;
        pivot.add(petal);
        headGroup.add(pivot);
      }

      roseRoot.add(headGroup);
      roseRoot.userData = {
        baseRotZ: 0,
        phase: idx * 1.3,
        headGroup,
      };
      this.roseGroups.push(roseRoot);
      this.scene.add(roseRoot);
    });
  }

  private buildFloatingPetals(): void {
    const petalCount = 110;
    const petalGeom = createCurvedPetalGeometry();
    petalGeom.scale(0.32, 0.32, 0.32);

    const petalMat = new THREE.MeshPhysicalMaterial({
      color: '#C8224A',
      roughness: 0.62,
      metalness: 0.05,
      sheen: 0.8,
      sheenColor: new THREE.Color('#F4A6B8'),
      side: THREE.DoubleSide,
    });

    this.petalsMesh = new THREE.InstancedMesh(petalGeom, petalMat, petalCount);
    this.petalsMesh.frustumCulled = false;

    const tint = new THREE.Color();
    for (let i = 0; i < petalCount; i++) {
      const meta = {
        x: (Math.random() - 0.5) * 11,
        y: 0.4 + Math.random() * 5.8,
        z: (Math.random() - 0.5) * 9,
        speed: 0.22 + Math.random() * 0.28,
        swayFreq: 0.6 + Math.random() * 1.1,
        swayAmp: 0.25 + Math.random() * 0.45,
        rotSpeed: 0.5 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        scale: 0.72 + Math.random() * 0.65,
      };
      this.petalMeta.push(meta);

      tint.setHSL(0.955 + (Math.random() - 0.5) * 0.03, 0.78, 0.34 + Math.random() * 0.18);
      this.petalsMesh.setColorAt(i, tint);
    }
    if (this.petalsMesh.instanceColor) {
      this.petalsMesh.instanceColor.needsUpdate = true;
    }

    this.disposables.push(petalGeom, petalMat);
    this.scene.add(this.petalsMesh);
  }

  private buildFirefliesAndHearts(): void {
    const fireflyCount = 90;
    const ffPos = new Float32Array(fireflyCount * 3);
    for (let i = 0; i < fireflyCount; i++) {
      ffPos[i * 3] = (Math.random() - 0.5) * 10;
      ffPos[i * 3 + 1] = 0.35 + Math.random() * 4.8;
      ffPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const ffGeom = new THREE.BufferGeometry();
    ffGeom.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));

    const goldTex = createGlowSpriteTexture(
      'rgba(255, 248, 224, 1)',
      'rgba(216, 180, 106, 0.6)',
      'rgba(216, 180, 106, 0)',
    );
    const ffMat = new THREE.PointsMaterial({
      size: 0.22,
      map: goldTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.fireflies = new THREE.Points(ffGeom, ffMat);
    this.scene.add(this.fireflies);

    // Rose-pink glowing heart motes rising slowly
    const heartCount = 45;
    const hPos = new Float32Array(heartCount * 3);
    for (let i = 0; i < heartCount; i++) {
      hPos[i * 3] = (Math.random() - 0.5) * 8;
      hPos[i * 3 + 1] = 0.5 + Math.random() * 4.5;
      hPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    const hGeom = new THREE.BufferGeometry();
    hGeom.setAttribute('position', new THREE.BufferAttribute(hPos, 3));

    const roseTex = createGlowSpriteTexture(
      'rgba(255, 224, 232, 1)',
      'rgba(244, 166, 184, 0.55)',
      'rgba(163, 19, 54, 0)',
    );
    const hMat = new THREE.PointsMaterial({
      size: 0.28,
      map: roseTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.heartParticles = new THREE.Points(hGeom, hMat);
    this.scene.add(this.heartParticles);

    this.disposables.push(ffGeom, ffMat, goldTex, hGeom, hMat, roseTex);
  }

  private handlePointerMove(e: PointerEvent): void {
    this.pointerX = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
    this.pointerY = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
  }

  private handleResize(): void {
    if (this.isDisposed) return;
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public setPreset(preset: GardenCameraPreset): void {
    this.preset = preset;
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  private tick = (): void => {
    if (this.isDisposed || !this.isVisible) return;

    const nowMs = performance.now();
    const delta = Math.min((nowMs - this.lastTimeMs) * 0.001, 0.08);
    this.lastTimeMs = nowMs;
    const elapsed = (nowMs - this.startTimeMs) * 0.001;

    // Update camera smoothly with exponential damping
    if (this.preset === 'vista') {
      _targetCamPos.set(this.pointerX * 0.9, 3.05 - this.pointerY * 0.35, 7.5);
      _targetLookAt.set(0, 1.45, 0);
    } else if (this.preset === 'macro') {
      _targetCamPos.set(
        0.65 + this.pointerX * 0.5,
        2.55 - this.pointerY * 0.25,
        3.1,
      );
      _targetLookAt.set(0, 2.05, 0);
    } else {
      const orbitAngle = elapsed * 0.14;
      _targetCamPos.set(
        Math.sin(orbitAngle) * 6.4 + this.pointerX * 0.4,
        3.9 - this.pointerY * 0.3,
        Math.cos(orbitAngle) * 6.4,
      );
      _targetLookAt.set(0, 1.35, 0);
    }

    this.camera.position.x = THREE.MathUtils.damp(
      this.camera.position.x,
      _targetCamPos.x,
      3.5,
      delta,
    );
    this.camera.position.y = THREE.MathUtils.damp(
      this.camera.position.y,
      _targetCamPos.y,
      3.5,
      delta,
    );
    this.camera.position.z = THREE.MathUtils.damp(
      this.camera.position.z,
      _targetCamPos.z,
      3.5,
      delta,
    );

    _currentLookAt.x = THREE.MathUtils.damp(_currentLookAt.x, _targetLookAt.x, 4, delta);
    _currentLookAt.y = THREE.MathUtils.damp(_currentLookAt.y, _targetLookAt.y, 4, delta);
    _currentLookAt.z = THREE.MathUtils.damp(_currentLookAt.z, _targetLookAt.z, 4, delta);
    this.camera.lookAt(_currentLookAt);

    if (!this.isPaused) {
      // Gentle breeze sway on roses
      for (let i = 0; i < this.roseGroups.length; i++) {
        const rose = this.roseGroups[i];
        const phase = rose.userData.phase as number;
        rose.rotation.z = Math.sin(elapsed * 0.8 + phase) * 0.025;
        rose.rotation.x = Math.cos(elapsed * 0.65 + phase) * 0.018;
      }

      // Drift instanced petals
      for (let i = 0; i < this.petalMeta.length; i++) {
        const m = this.petalMeta[i];
        m.y -= m.speed * delta;
        if (m.y < 0.1) {
          m.y = 5.9;
        }
        const swayX = Math.sin(elapsed * m.swayFreq + m.phase) * m.swayAmp;
        const swayZ = Math.cos(elapsed * m.swayFreq * 0.8 + m.phase) * m.swayAmp;
        _dummy.position.set(m.x + swayX, m.y, m.z + swayZ);
        _dummy.rotation.set(
          elapsed * m.rotSpeed + m.phase,
          elapsed * m.rotSpeed * 0.7,
          Math.sin(elapsed + m.phase) * 0.8,
        );
        _dummy.scale.setScalar(m.scale);
        _dummy.updateMatrix();
        this.petalsMesh.setMatrixAt(i, _dummy.matrix);
      }
      this.petalsMesh.instanceMatrix.needsUpdate = true;

      // Subtle firefly shimmer
      this.fireflies.rotation.y = elapsed * 0.04;
      this.heartParticles.position.y = Math.sin(elapsed * 0.5) * 0.16;
    }

    this.renderer.render(this.scene, this.camera);
    this.scheduleNextFrame();
  };

  private scheduleNextFrame(): void {
    if (this.isDisposed || !this.isVisible) return;
    if (this.isSoftwareGl) {
      afterDraw(this.renderer, this.tick, (id) => {
        this.timerId = id;
      });
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  public dispose(): void {
    this.isDisposed = true;
    cancelAnimationFrame(this.frameId);
    window.clearTimeout(this.timerId);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('resize', this.handleResize);
    this.observer?.disconnect();

    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
