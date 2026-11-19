import React from 'react';
import { Heart } from 'lucide-react';
import { ASSET_IMAGES } from '../config/loveConfig';
import { FloatingPetalsOverlay } from './FloatingPetalsOverlay';

interface WelcomeSectionProps {
  herName: string;
  specialDate: string;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  herName,
  specialDate,
}) => {
  return (
    <section
      id="welcome"
      className="relative scroll-mt-16 overflow-hidden bg-cinematic-radial px-6 pt-32 pb-24 sm:pt-40 sm:pb-32"
    >
      <FloatingPetalsOverlay count={10} />

      <div className="relative z-10 mx-auto grid max-w-6xl items-stretch gap-12 lg:grid-cols-12">
        <div className="flex flex-col justify-center lg:col-span-7">
          <div className="mb-5 flex items-center gap-3 text-xs tracking-[0.22em] text-[#D8B46A] uppercase">
            <span>01. Welcome</span>
            <span aria-hidden="true">·</span>
            <span>{specialDate}</span>
          </div>

          <h2 className="font-display text-4xl leading-tight font-medium text-[#FFF4EA] sm:text-5xl lg:text-6xl">
            Hello, My Beautiful{' '}
            <span className="italic text-[#F4A6B8]">{herName}</span>{' '}
            <Heart
              aria-hidden="true"
              className="mb-1 inline-block h-8 w-8 fill-[#A31336] text-[#F4A6B8]"
            />
          </h2>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#FFF4EA]/80 sm:text-lg">
            I created this little world just for you, because someone as special
            as you deserves something extraordinary.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#story"
              className="inline-flex items-center gap-2 rounded-full border border-[#D8B46A]/55 bg-[#310714] px-6 py-3 text-sm font-medium text-[#FFF4EA] transition-colors duration-200 hover:border-[#D8B46A] hover:bg-[#A31336] whitespace-nowrap shrink-0"
            >
              Read Our Story
            </a>
            <a
              href="#proposal"
              className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#D8B46A] transition-colors hover:text-[#FFF4EA] whitespace-nowrap shrink-0"
            >
              Skip to the Question →
            </a>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative h-full min-h-[340px] overflow-hidden rounded-2xl border border-[#D8B46A]/25 bg-[#1C070F] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
            <img
              src={ASSET_IMAGES.velvetRose}
              alt="Velvet crimson rose in soft candlelit warmth"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#10080C]/80 via-transparent to-transparent"
            />
            <p className="font-display absolute right-6 bottom-5 left-6 text-lg italic text-[#FFF4EA]/90">
              “Every detail here holds a quiet piece of how much you mean to me.”
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
