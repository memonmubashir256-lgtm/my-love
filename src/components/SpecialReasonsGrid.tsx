import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heart } from 'lucide-react';
import type { SpecialReason } from '../config/loveConfig';

gsap.registerPlugin(ScrollTrigger);

interface SpecialReasonsGridProps {
  reasons: SpecialReason[];
  herName: string;
}

export const SpecialReasonsGrid: React.FC<SpecialReasonsGridProps> = ({
  reasons,
  herName,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.reason-card', {
        y: 24,
        opacity: 0,
        duration: 0.65,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 76%',
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const toggleReason = (id: number) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section
      ref={sectionRef}
      id="special"
      className="scroll-mt-16 border-t border-[#FFF4EA]/10 bg-[#15070E] px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.22em] text-[#D8B46A] uppercase">
              03. Why You Are Special
            </p>
            <h2 className="font-display mt-3 text-4xl font-medium text-[#FFF4EA] sm:text-5xl">
              Twelve Quiet Reasons I Adore{' '}
              <span className="italic text-[#F4A6B8]">{herName}</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              const allOpen = reasons.every((r) => revealedIds[r.id]);
              const next: Record<number, boolean> = {};
              reasons.forEach((r) => {
                next[r.id] = !allOpen;
              });
              setRevealedIds(next);
            }}
            className="self-start rounded-lg border border-[#D8B46A]/40 px-4 py-2 text-xs font-medium text-[#D8B46A] transition-colors hover:border-[#D8B46A] hover:bg-[#310714] whitespace-nowrap shrink-0 cursor-pointer"
          >
            {reasons.every((r) => revealedIds[r.id])
              ? 'Collapse Notes'
              : 'Reveal All Notes'}
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason) => {
            const isOpen = Boolean(revealedIds[reason.id]);
            const num = String(reason.id).padStart(2, '0');

            return (
              <button
                key={reason.id}
                type="button"
                onClick={() => toggleReason(reason.id)}
                aria-expanded={isOpen}
                className={`reason-card group flex min-h-[168px] flex-col justify-between rounded-2xl border p-6 text-left transition-all duration-200 cursor-pointer ${
                  isOpen
                    ? 'border-[#D8B46A]/70 bg-[#310714]/85 shadow-[0_14px_38px_rgba(163,19,54,0.28)]'
                    : 'border-[#FFF4EA]/10 bg-[#1B0912]/90 hover:-translate-y-0.5 hover:border-[#D8B46A]/45'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="tabular-nums text-xs font-medium tracking-[0.18em] text-[#D8B46A]">
                    {num}.
                  </span>
                  <Heart
                    className={`h-4 w-4 transition-colors duration-200 ${
                      isOpen
                        ? 'fill-[#F4A6B8] text-[#F4A6B8]'
                        : 'text-[#F4A6B8]/40 group-hover:text-[#F4A6B8]'
                    }`}
                  />
                </div>

                <div className="mt-4">
                  <h3 className="font-display text-2xl font-medium text-[#FFF4EA]">
                    {reason.title}
                  </h3>
                  <p
                    className={`mt-2.5 text-sm leading-relaxed transition-opacity duration-200 ${
                      isOpen ? 'text-[#FFF4EA]/85' : 'text-[#FFF4EA]/60'
                    }`}
                  >
                    {isOpen
                      ? reason.detail
                      : 'Tap to read the note behind this reason'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
