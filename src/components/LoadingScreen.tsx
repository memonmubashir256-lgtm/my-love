import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { FloatingPetalsOverlay } from './FloatingPetalsOverlay';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const duration = 1750;
    let rafId = 0;
    let doneTimer = 0;

    const step = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct < 100) {
        rafId = requestAnimationFrame(step);
      } else {
        setFadingOut(true);
        doneTimer = window.setTimeout(() => {
          onComplete();
        }, 420);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      data-testid="loading-screen"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#10080C] px-6 transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <FloatingPetalsOverlay count={12} />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="animate-heart-breath mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[#D8B46A]/30 bg-[#310714]/60">
          <Heart className="h-9 w-9 fill-[#A31336] text-[#F4A6B8]" />
        </div>

        <p className="font-display text-2xl tracking-wide text-[#FFF4EA] sm:text-3xl">
          Forever Love
        </p>
        <p className="mt-2 text-sm text-[#F4A6B8]/80">
          Preparing a moment crafted just for you
        </p>

        <div className="mt-8 w-56">
          <div className="h-[2px] w-full overflow-hidden bg-[#FFF4EA]/10">
            <div
              className="h-full bg-gradient-to-r from-[#A31336] via-[#F4A6B8] to-[#D8B46A] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="tabular-nums mt-3 text-xs tracking-[0.2em] text-[#D8B46A]">
            {progress}%
          </p>
        </div>
      </div>
    </div>
  );
};
