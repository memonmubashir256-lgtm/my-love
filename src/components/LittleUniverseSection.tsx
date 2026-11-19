import React, { useEffect, useMemo, useRef } from 'react';
import { Heart, Music, Pause, Play, RotateCcw, Upload } from 'lucide-react';
import { ASSET_IMAGES } from '../config/loveConfig';
import { generateConstellationStars } from '../utils/loveLogic';

interface LittleUniverseSectionProps {
  herName: string;
  yourName: string;
  specialDate: string;
  isMusicPlaying: boolean;
  trackTitle: string;
  hasCustomTrack: boolean;
  onToggleMusic: () => void;
  onUploadTrack: (file: File) => void;
  onResetTrack: () => void;
}

export const LittleUniverseSection: React.FC<LittleUniverseSectionProps> = ({
  herName,
  yourName,
  specialDate,
  isMusicPlaying,
  trackTitle,
  hasCustomTrack,
  onToggleMusic,
  onUploadTrack,
  onResetTrack,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stars = useMemo(() => generateConstellationStars(95, 2026), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let isVisible = true;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(parent.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(parent.clientHeight * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              isVisible = Boolean(entries[0]?.isIntersecting);
            },
            { threshold: 0.05 },
          )
        : null;
    observer?.observe(canvas);

    const draw = (timeMs: number) => {
      const t = timeMs * 0.001;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      if (isVisible) {
        const heartStars = stars.filter((s) => s.isHeartNode);

        // Draw constellation lines connecting heart stars
        ctx.save();
        ctx.strokeStyle = 'rgba(216, 180, 106, 0.28)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        heartStars.forEach((s, idx) => {
          const sx = s.x * w;
          const sy = s.y * h;
          if (idx === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // Draw all stars with gentle twinkle
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          const twinkle = reducedMotion
            ? 0.85
            : 0.55 + 0.45 * Math.sin(t * s.twinkleSpeed + s.twinklePhase);
          const alpha = s.alpha * twinkle;
          const sx = s.x * w;
          const sy = s.y * h;

          ctx.beginPath();
          ctx.arc(sx, sy, s.radius, 0, Math.PI * 2);
          ctx.fillStyle = s.isHeartNode
            ? `rgba(244, 166, 184, ${alpha})`
            : `rgba(255, 244, 234, ${alpha})`;
          ctx.fill();
        }
      }

      if (!reducedMotion) {
        rafId = requestAnimationFrame(draw);
      }
    };

    if (reducedMotion) {
      draw(0);
    } else {
      rafId = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      observer?.disconnect();
    };
  }, [stars]);

  return (
    <section
      id="universe"
      className="relative flex min-h-[78vh] scroll-mt-16 items-center justify-center overflow-hidden border-t border-[#FFF4EA]/10 bg-[#0D050A] px-6 py-28"
    >
      {/* Velvet night sky illustration backdrop */}
      <img
        src={ASSET_IMAGES.nightSky}
        alt="Starry burgundy night sky with warm rose-gold nebula"
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover opacity-55"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[#10080C]/80 via-[#10080C]/35 to-[#10080C]/90"
      />

      {/* Interactive Constellation Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="text-xs tracking-[0.22em] text-[#D8B46A] uppercase">
          06. Our Little Universe
        </p>

        <h2 className="font-display mt-4 text-4xl leading-tight font-medium text-[#FFF4EA] sm:text-5xl">
          Somewhere in this endless universe, I&apos;m grateful that I found you.
        </h2>

        {/* Both Names Linked Under the Stars */}
        <div className="mt-10 inline-flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-[#D8B46A]/35 bg-[#19070F]/88 px-8 py-5 shadow-[0_16px_45px_rgba(0,0,0,0.55)]">
          <span className="font-display text-2xl font-medium text-[#F4A6B8] sm:text-3xl">
            {herName}
          </span>
          <Heart className="h-5 w-5 fill-[#A31336] text-[#D8B46A]" />
          <span className="font-display text-2xl font-medium text-[#FFF4EA] sm:text-3xl">
            {yourName}
          </span>
          <span className="w-full text-xs tracking-[0.18em] text-[#D8B46A]/85 uppercase">
            {specialDate}
          </span>
        </div>

        {/* Romantic Music Toggle */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onToggleMusic}
            className="inline-flex items-center gap-3 rounded-full border border-[#D8B46A]/55 bg-[#310714]/90 px-6 py-3 text-sm font-medium text-[#FFF4EA] transition-colors duration-200 hover:border-[#D8B46A] hover:bg-[#A31336] focus-visible:outline-2 focus-visible:outline-[#D8B46A] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Music className="h-4 w-4 text-[#D8B46A]" />
            <span>
              {isMusicPlaying ? `Pause · ${trackTitle}` : `Play · ${trackTitle}`}
            </span>
            {isMusicPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#FFF4EA]/20 bg-[#1B0810]/90 px-5 py-3 text-xs font-medium text-[#FFF4EA]/85 transition-colors hover:border-[#D8B46A] hover:text-[#D8B46A] whitespace-nowrap shrink-0">
            <Upload className="h-3.5 w-3.5 text-[#D8B46A]" />
            <span>Use Own MP3</span>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUploadTrack(f);
                e.target.value = '';
              }}
              className="sr-only"
            />
          </label>

          {hasCustomTrack && (
            <button
              type="button"
              onClick={onResetTrack}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#FFF4EA]/15 px-4 py-3 text-xs text-[#F4A6B8] transition-colors hover:border-[#F4A6B8] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Use Instrumental</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
