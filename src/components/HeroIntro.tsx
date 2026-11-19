import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Heart, Sparkles } from 'lucide-react';
import { ASSET_IMAGES } from '../config/loveConfig';
import { FloatingPetalsOverlay } from './FloatingPetalsOverlay';

interface HeroIntroProps {
  onEnter: () => void;
}

export const HeroIntro: React.FC<HeroIntroProps> = ({ onEnter }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-stagger', {
        y: 26,
        opacity: 0,
        duration: 1.05,
        stagger: 0.22,
        ease: 'power3.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      data-testid="hero-intro"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#10080C] px-6 py-20"
    >
      {/* Atmospheric rose photography backdrop with measured contrast scrim */}
      <div className="absolute inset-0">
        <img
          src={ASSET_IMAGES.velvetRose}
          alt="Deep crimson velvet rose illuminated by warm candlelight"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover opacity-35 scale-105"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#10080C]/85 via-[#310714]/55 to-[#10080C]"
        />
      </div>

      <FloatingPetalsOverlay count={16} />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="hero-stagger mb-6 text-xs tracking-[0.28em] text-[#D8B46A] uppercase">
          A Private Keepsake
        </p>

        <h1 className="hero-stagger font-display text-4xl leading-tight font-medium tracking-tight text-[#FFF4EA] sm:text-5xl md:text-6xl">
          Some people make life beautiful...
        </h1>

        <p className="hero-stagger font-display mt-5 text-3xl italic text-[#F4A6B8] sm:text-4xl md:text-5xl">
          And then there&apos;s YOU.
        </p>

        <div className="hero-stagger mt-12 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={onEnter}
            className="group inline-flex items-center gap-3 rounded-full border border-[#D8B46A]/60 bg-[#A31336] px-8 py-4 text-sm font-semibold tracking-[0.14em] text-[#FFF4EA] shadow-[0_12px_40px_rgba(163,19,54,0.45)] transition-all duration-200 hover:scale-[1.03] hover:border-[#D8B46A] hover:bg-[#b91840] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D8B46A] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>ENTER MY HEART</span>
            <Heart className="h-4 w-4 fill-[#FFF4EA] text-[#FFF4EA] transition-transform duration-200 group-hover:scale-110" />
          </button>

          <p className="flex items-center gap-2 text-xs text-[#FFF4EA]/60">
            <Sparkles className="h-3.5 w-3.5 text-[#D8B46A]" />
            <span>Begins gentle ambient music &amp; our story</span>
          </p>
        </div>
      </div>
    </section>
  );
};
