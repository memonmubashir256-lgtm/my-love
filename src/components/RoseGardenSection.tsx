import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Pause, Play } from 'lucide-react';
import { ASSET_IMAGES } from '../config/loveConfig';
import {
  type GardenCameraPreset,
  RoseGardenController,
} from '../three/RoseGardenScene';

export const RoseGardenSection: React.FC = () => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<RoseGardenController | null>(null);

  const [preset, setPreset] = useState<GardenCameraPreset>('vista');
  const [isPaused, setIsPaused] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    let initialized = false;
    const initController = () => {
      if (initialized) return;
      initialized = true;
      try {
        const controller = new RoseGardenController({
          container: mount,
          onContextError: () => setWebglFailed(true),
        });
        controllerRef.current = controller;
      } catch {
        setWebglFailed(true);
      }
    };

    if (typeof IntersectionObserver === 'undefined') {
      initController();
      return () => {
        controllerRef.current?.dispose();
        controllerRef.current = null;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          initController();
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px' },
    );
    observer.observe(mount);

    return () => {
      observer.disconnect();
      controllerRef.current?.dispose();
      controllerRef.current = null;
    };
  }, []);

  const handlePreset = (next: GardenCameraPreset) => {
    setPreset(next);
    controllerRef.current?.setPreset(next);
  };

  const handleTogglePause = () => {
    const next = !isPaused;
    setIsPaused(next);
    controllerRef.current?.setPaused(next);
  };

  return (
    <section
      id="garden"
      className="relative h-[88vh] min-h-[600px] w-full scroll-mt-16 overflow-hidden border-t border-[#FFF4EA]/10 bg-[#14060B]"
    >
      {/* Isolated WebGL canvas mount */}
      <div
        ref={canvasMountRef}
        data-testid="rose-garden-canvas-container"
        className="absolute inset-0 h-full w-full"
      />

      {/* Graceful fallback if WebGL fails */}
      {webglFailed && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#14060B] p-6">
          <img
            src={ASSET_IMAGES.velvetRose}
            alt="Deep crimson velvet rose garden"
            referrerPolicy="no-referrer"
            className="h-full w-full rounded-2xl object-cover opacity-50"
          />
        </div>
      )}

      {/* Minimal top-left editorial title overlay (zero occlusion of center 3D roses, no backdrop-filter!) */}
      <div className="pointer-events-none relative z-10 mx-auto max-w-6xl px-6 pt-24">
        <div className="inline-block rounded-xl border border-[#D8B46A]/25 bg-[#10080C]/88 px-5 py-3.5">
          <p className="text-xs tracking-[0.22em] text-[#D8B46A] uppercase">
            05. Immersive 3D Rose Garden
          </p>
          <h2 className="font-display mt-1 text-2xl font-medium text-[#FFF4EA] sm:text-3xl">
            Move your cursor to wander through the roses
          </h2>
        </div>
      </div>

      {/* Collapsible Bottom Control Dock (Zero backdrop-filter over WebGL) */}
      <div className="pointer-events-none absolute right-0 bottom-5 left-0 z-10 flex flex-col items-center px-4">
        <button
          type="button"
          onClick={() => setDockCollapsed((c) => !c)}
          aria-expanded={!dockCollapsed}
          className="pointer-events-auto mb-2 inline-flex items-center gap-1.5 rounded-t-lg border border-b-0 border-[#D8B46A]/35 bg-[#14060B]/95 px-3.5 py-1 text-xs font-medium text-[#D8B46A] transition-colors hover:text-[#FFF4EA] cursor-pointer"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              <span>Hide Controls</span>
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#D8B46A]/35 bg-[#14060B]/95 px-4 py-2.5 shadow-[0_14px_40px_rgba(0,0,0,0.65)]">
            <div className="flex items-center gap-1 rounded-lg bg-[#240A14] p-1">
              {(
                [
                  { id: 'vista', label: 'Garden Vista' },
                  { id: 'macro', label: 'Rose Macro' },
                  { id: 'starlight', label: 'Starlight Drift' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePreset(item.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    preset === item.id
                      ? 'bg-[#A31336] text-[#FFF4EA]'
                      : 'text-[#FFF4EA]/75 hover:text-[#FFF4EA]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleTogglePause}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#FFF4EA]/15 px-3 py-1.5 text-xs font-medium text-[#FFF4EA]/85 transition-colors hover:border-[#D8B46A] hover:text-[#D8B46A] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isPaused ? (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause Petals</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
