import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  afterDraw,
  createContactShadowTexture,
  createGlowSpriteTexture,
  createVelvetMicroBumpTexture,
  detectSoftwareWebGL,
} from './webglUtils';

interface ProposalRingOptions {
  container: HTMLElement;
  onContextError?: () => void;
}

const _targetPos = new THREE.Vector3();

function createBrilliantDiamondGeometry(): THREE.BufferGeometry {
  // Multi-tiered faceted gemstone profile via LatheGeometry with flat facets
  const points = [
    new THREE.Vector2(0.001, -0.34), // culet tip
    new THREE.Vector2(0.36, -0.02),  // pavilion to girdle
    new THREE.Vector2(0.38, 0.03),   // girdle edge
    new THREE.Vector2(0.24, 0.16),   // crown bevel
    new THREE.Vector2(0.001, 0.16),  // flat table center
  ];
  const geom = new THREE.LatheGeometry(points, 12);
  geom.computeVertexNormals();
  return geom;
}

export class ProposalRingController {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;
  private isSoftwareGl: boolean;
  private frameId = 0;
  private timerId = 0;
  private isDisposed = false;
  private isVisible = true;
  private startTimeMs = performance.now();
  private lastTimeMs = performance.now();

  private boxGroup = new THREE.Group();
  private lidPivot = new THREE.Group();
  private ringGroup = new THREE.Group();
  private sparkles!: THREE.Points;

  private boxOpen = false;
  private celebrating = false;
  private lidAngle = 0;
  private ringLift = 0;
  private userYaw = 0;
  private targetYaw = 0;
  private userPitch = 0.08;
  private targetPitch = 0.08;
  private isDragging = false;
  private lastPointerX = 0;
  private lastPointerY = 0;

  private disposables: Array<{ dispose: () => void }> = [];
  private observer: IntersectionObserver | null = null;

  constructor(options: ProposalRingOptions) {
    this.container = options.container;
    this.isSoftwareGl = detectSoftwareWebGL();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
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
    this.renderer.domElement.style.cursor = 'grab';
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 40);
    this.camera.position.set(0, 2.35, 4.95);
    this.camera.lookAt(0, 0.45, 0);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = envTex;
    this.disposables.push(envTex);
    pmremGenerator.dispose();

    this.setupLighting();
    this.buildVelvetRingBoxAndDiamondRing();
    this.buildGoldenSparkles();

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      options.onContextError?.();
    });

    this.bindEvents();

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

    this.scheduleNextFrame();
  }

  private setupLighting(): void {
    const hemi = new THREE.HemisphereLight('#FFF4EA', '#2A0814', 0.8);
    this.scene.add(hemi);

    const keyLight = new THREE.DirectionalLight('#FFF0D4', 2.4);
    keyLight.position.set(3.5, 6.2, 4.2);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    const roseFill = new THREE.DirectionalLight('#F4A6B8', 1.1);
    roseFill.position.set(-4.2, 2.8, 2.0);
    this.scene.add(roseFill);

    const ringSpot = new THREE.PointLight('#FFE8B6', 2.8, 8, 1.8);
    ringSpot.position.set(0.4, 2.6, 1.8);
    this.scene.add(ringSpot);
  }

  private buildVelvetRingBoxAndDiamondRing(): void {
    const bumpTex = createVelvetMicroBumpTexture(this.renderer);
    const contactTex = createContactShadowTexture();
    this.disposables.push(bumpTex, contactTex);

    // Contact shadow plane on pedestal
    const shadowGeom = new THREE.CircleGeometry(2.1, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.78,
    });
    const shadow = new THREE.Mesh(shadowGeom, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.58;
    this.scene.add(shadow);

    // Velvet exterior material (deep burgundy)
    const velvetMat = new THREE.MeshPhysicalMaterial({
      color: '#3A0716',
      roughness: 0.9,
      metalness: 0.02,
      sheen: 0.42,
      sheenRoughness: 0.7,
      sheenColor: new THREE.Color('#8F1D3A'),
      bumpMap: bumpTex,
      bumpScale: 0.018,
    });

    // Warm champagne silk cushion interior
    const silkMat = new THREE.MeshStandardMaterial({
      color: '#EBD8C3',
      roughness: 0.62,
      metalness: 0.04,
    });

    // Champagne gold hardware & ring band
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: '#E6C27A',
      roughness: 0.14,
      metalness: 0.96,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
    });

    // Multi-faceted brilliant diamond crystal
    const diamondMat = new THREE.MeshPhysicalMaterial({
      color: '#F5FAFF',
      metalness: 0.04,
      roughness: 0.03,
      ior: 2.41,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      iridescence: 0.65,
      iridescenceIOR: 1.45,
      transmission: this.isSoftwareGl ? 0 : 0.88,
      thickness: 0.8,
      transparent: this.isSoftwareGl,
      opacity: this.isSoftwareGl ? 0.9 : 1.0,
      flatShading: true,
    });

    // 1. Box Lower Base (chamfered rounded rectangle extruded)
    const boxShape = new THREE.Shape();
    const w = 0.95;
    const d = 0.95;
    const r = 0.18;
    boxShape.moveTo(-w + r, -d);
    boxShape.lineTo(w - r, -d);
    boxShape.quadraticCurveTo(w, -d, w, -d + r);
    boxShape.lineTo(w, d - r);
    boxShape.quadraticCurveTo(w, d, w - r, d);
    boxShape.lineTo(-w + r, d);
    boxShape.quadraticCurveTo(-w, d, -w, d - r);
    boxShape.lineTo(-w, -d + r);
    boxShape.quadraticCurveTo(-w, -d, -w + r, -d);

    const baseGeom = new THREE.ExtrudeGeometry(boxShape, {
      depth: 0.58,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    });
    baseGeom.rotateX(Math.PI / 2);
    const baseMesh = new THREE.Mesh(baseGeom, velvetMat);
    baseMesh.position.y = 0.02;
    baseMesh.castShadow = !this.isSoftwareGl;
    baseMesh.receiveShadow = true;
    this.boxGroup.add(baseMesh);

    // 2. Interior cream silk cushion pad
    const cushionGeom = new THREE.BoxGeometry(1.66, 0.16, 1.66);
    const cushionMesh = new THREE.Mesh(cushionGeom, silkMat);
    cushionMesh.position.y = 0.01;
    this.boxGroup.add(cushionMesh);

    // 3. Champagne gold front clasp button & trim rail
    const trimGeom = new THREE.BoxGeometry(1.94, 0.04, 1.94);
    const trimMesh = new THREE.Mesh(trimGeom, goldMat);
    trimMesh.position.y = 0.04;
    this.boxGroup.add(trimMesh);

    const claspGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 18);
    claspGeom.rotateX(Math.PI / 2);
    const claspMesh = new THREE.Mesh(claspGeom, goldMat);
    claspMesh.position.set(0, 0.04, 1.0);
    this.boxGroup.add(claspMesh);

    // 4. Hinged Lid Pivot positioned at rear edge (z = -0.98)
    this.lidPivot.position.set(0, 0.06, -0.96);

    const lidGeom = new THREE.ExtrudeGeometry(boxShape, {
      depth: 0.44,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    });
    lidGeom.rotateX(-Math.PI / 2);
    const lidMesh = new THREE.Mesh(lidGeom, velvetMat);
    lidMesh.position.set(0, 0.02, 0.96);
    lidMesh.castShadow = !this.isSoftwareGl;
    this.lidPivot.add(lidMesh);

    // Silk lid lining
    const liningGeom = new THREE.PlaneGeometry(1.62, 1.62);
    const liningMesh = new THREE.Mesh(liningGeom, silkMat);
    liningMesh.rotation.x = Math.PI / 2;
    liningMesh.position.set(0, 0.025, 0.96);
    this.lidPivot.add(liningMesh);

    this.boxGroup.add(this.lidPivot);

    // 5. Solitaire Diamond Ring (Band + Cathedral Gallery + 6 Prongs + Diamond)
    const bandGeom = new THREE.TorusGeometry(0.46, 0.058, 18, 48);
    const bandMesh = new THREE.Mesh(bandGeom, goldMat);
    this.ringGroup.add(bandMesh);

    const galleryGeom = new THREE.CylinderGeometry(0.24, 0.14, 0.16, 12);
    const galleryMesh = new THREE.Mesh(galleryGeom, goldMat);
    galleryMesh.position.y = 0.52;
    this.ringGroup.add(galleryMesh);

    const prongGeom = new THREE.CylinderGeometry(0.022, 0.018, 0.24, 8);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const prong = new THREE.Mesh(prongGeom, goldMat);
      prong.position.set(Math.cos(a) * 0.23, 0.62, Math.sin(a) * 0.23);
      prong.rotation.z = -Math.cos(a) * 0.28;
      prong.rotation.x = Math.sin(a) * 0.28;
      this.ringGroup.add(prong);
    }

    const diamondGeom = createBrilliantDiamondGeometry();
    const diamondMesh = new THREE.Mesh(diamondGeom, diamondMat);
    diamondMesh.position.y = 0.72;
    diamondMesh.scale.setScalar(0.84);
    this.ringGroup.add(diamondMesh);

    this.ringGroup.position.set(0, 0.22, 0);
    this.ringGroup.rotation.y = 0.35;
    this.boxGroup.add(this.ringGroup);

    this.boxGroup.position.y = -0.05;
    this.scene.add(this.boxGroup);

    this.disposables.push(
      shadowGeom,
      shadowMat,
      velvetMat,
      silkMat,
      goldMat,
      diamondMat,
      baseGeom,
      cushionGeom,
      trimGeom,
      claspGeom,
      lidGeom,
      liningGeom,
      bandGeom,
      galleryGeom,
      prongGeom,
      diamondGeom,
    );
  }

  private buildGoldenSparkles(): void {
    const count = 65;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.2 + Math.random() * 2.2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = -0.3 + Math.random() * 2.6;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const spriteTex = createGlowSpriteTexture(
      'rgba(255, 250, 232, 1)',
      'rgba(216, 180, 106, 0.58)',
      'rgba(216, 180, 106, 0)',
    );
    const mat = new THREE.PointsMaterial({
      size: 0.16,
      map: spriteTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.sparkles = new THREE.Points(geom, mat);
    this.scene.add(this.sparkles);
    this.disposables.push(geom, mat, spriteTex);
  }

  private bindEvents(): void {
    const dom = this.renderer.domElement;

    const onDown = (e: PointerEvent) => {
      this.isDragging = true;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      dom.style.cursor = 'grabbing';
    };

    const onMove = (e: PointerEvent) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      this.targetYaw += dx * 0.012;
      this.targetPitch = THREE.MathUtils.clamp(
        this.targetPitch + dy * 0.008,
        -0.25,
        0.55,
      );
    };

    const onUp = () => {
      this.isDragging = false;
      dom.style.cursor = 'grab';
    };

    dom.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('resize', this.handleResize);

    this.disposables.push({
      dispose: () => {
        dom.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('resize', this.handleResize);
      },
    });
  }

  private handleResize = (): void => {
    if (this.isDisposed) return;
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public setState(opts: { boxOpen: boolean; celebrating: boolean }): void {
    this.boxOpen = opts.boxOpen;
    this.celebrating = opts.celebrating;
  }

  public resetView(): void {
    this.targetYaw = 0;
    this.targetPitch = 0.08;
  }

  private tick = (): void => {
    if (this.isDisposed || !this.isVisible) return;

    const nowMs = performance.now();
    const delta = Math.min((nowMs - this.lastTimeMs) * 0.001, 0.08);
    this.lastTimeMs = nowMs;
    const elapsed = (nowMs - this.startTimeMs) * 0.001;

    // Smoothly hinge lid open or closed
    const desiredLidAngle = this.boxOpen ? -Math.PI * 0.62 : 0;
    this.lidAngle = THREE.MathUtils.damp(this.lidAngle, desiredLidAngle, 4.5, delta);
    this.lidPivot.rotation.x = this.lidAngle;

    // Lift diamond ring gracefully when box opens
    const desiredLift = this.boxOpen ? 0.56 : 0.22;
    this.ringLift = THREE.MathUtils.damp(this.ringLift, desiredLift, 4.0, delta);
    this.ringGroup.position.y =
      this.ringLift + (this.boxOpen ? Math.sin(elapsed * 2.1) * 0.035 : 0);

    // Gentle celebratory or idle rotation
    if (!this.isDragging) {
      this.targetYaw += delta * (this.celebrating ? 0.85 : 0.22);
    }

    this.userYaw = THREE.MathUtils.damp(this.userYaw, this.targetYaw, 6, delta);
    this.userPitch = THREE.MathUtils.damp(this.userPitch, this.targetPitch, 6, delta);

    this.boxGroup.rotation.y = this.userYaw;
    this.boxGroup.rotation.x = this.userPitch;

    // Subtle camera push-in when celebrating
    _targetPos.set(0, this.boxOpen ? 2.1 : 2.35, this.boxOpen ? 4.3 : 4.95);
    this.camera.position.lerp(_targetPos, 1 - Math.exp(-3.2 * delta));
    this.camera.lookAt(0, this.boxOpen ? 0.55 : 0.35, 0);

    this.sparkles.rotation.y = elapsed * (this.celebrating ? 0.45 : 0.12);

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
    this.observer?.disconnect();
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
