import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Feather, Heart } from 'lucide-react';
import type { ShayariCouplet } from '../config/loveConfig';
import { interpolateLoveText } from '../utils/loveLogic';

interface ShayariSectionProps {
  shayari: ShayariCouplet[];
  herName: string;
  yourName: string;
  specialDate: string;
}

export const ShayariSection: React.FC<ShayariSectionProps> = ({
  shayari,
  herName,
  yourName,
  specialDate,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const safeList = shayari.length > 0 ? shayari : [];
  const current = safeList[activeIndex % safeList.length];

  const formatLine = (text: string) =>
    interpolateLoveText(text, { herName, yourName, specialDate });

  return (
    <section
      id="shayari"
      className="scroll-mt-16 border-t border-[#FFF4EA]/10 bg-[#12060B] px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.22em] text-[#D8B46A] uppercase">
              Dil Ki Baatein · Shayari
            </p>
            <h2 className="font-display mt-3 text-4xl font-medium text-[#FFF4EA] sm:text-5xl">
              Poetry Written For{' '}
              <span className="italic text-[#F4A6B8]">{herName}</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="self-start rounded-lg border border-[#D8B46A]/40 px-4 py-2 text-xs font-medium text-[#D8B46A] transition-colors hover:border-[#D8B46A] hover:bg-[#310714] whitespace-nowrap shrink-0 cursor-pointer"
          >
            {showAll ? 'Spotlight View' : 'Read All Shayari'}
          </button>
        </div>

        {!showAll && current && (
          <div
            data-testid="shayari-spotlight"
            className="rounded-2xl border border-[#D8B46A]/35 bg-gradient-to-br from-[#2A0815] via-[#1B0710] to-[#12060B] p-8 shadow-[0_24px_65px_rgba(0,0,0,0.55)] sm:p-12"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#FFF4EA]/10 pb-5">
              <div className="flex items-center gap-2.5 text-xs tracking-[0.18em] text-[#D8B46A] uppercase">
                <Feather className="h-4 w-4" />
                <span>{current.title}</span>
              </div>
              <span className="tabular-nums text-xs text-[#FFF4EA]/60">
                {String(activeIndex + 1).padStart(2, '0')} /{' '}
                {String(safeList.length).padStart(2, '0')}
              </span>
            </div>

            <blockquote className="my-10 space-y-3 text-center">
              <p className="font-display text-2xl leading-relaxed italic text-[#FFF4EA] sm:text-4xl">
                “{formatLine(current.lines[0])}
              </p>
              <p className="font-display text-2xl leading-relaxed italic text-[#F4A6B8] sm:text-4xl">
                {formatLine(current.lines[1])}”
              </p>
            </blockquote>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#FFF4EA]/10 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                {safeList.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Read shayari ${idx + 1}: ${item.title}`}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      idx === activeIndex
                        ? 'bg-[#A31336] text-[#FFF4EA]'
                        : 'bg-[#10080C] text-[#FFF4EA]/65 hover:text-[#D8B46A]'
                    }`}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex(
                      (i) => (i - 1 + safeList.length) % safeList.length,
                    )
                  }
                  aria-label="Previous shayari"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FFF4EA]/15 text-[#FFF4EA]/80 transition-colors hover:border-[#D8B46A] hover:text-[#D8B46A] cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((i) => (i + 1) % safeList.length)
                  }
                  aria-label="Next shayari"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FFF4EA]/15 text-[#FFF4EA]/80 transition-colors hover:border-[#D8B46A] hover:text-[#D8B46A] cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {showAll && (
          <div className="grid gap-5 md:grid-cols-2">
            {safeList.map((item, idx) => (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-[#FFF4EA]/12 bg-[#1A0810]/90 p-7"
              >
                <div className="mb-4 flex items-center justify-between text-xs text-[#D8B46A]">
                  <span className="tabular-nums font-medium">
                    {String(idx + 1).padStart(2, '0')} · {item.title}
                  </span>
                  <Heart className="h-3.5 w-3.5 fill-[#A31336] text-[#F4A6B8]" />
                </div>

                <blockquote className="space-y-2">
                  <p className="font-display text-xl leading-relaxed italic text-[#FFF4EA] sm:text-2xl">
                    “{formatLine(item.lines[0])}
                  </p>
                  <p className="font-display text-xl leading-relaxed italic text-[#F4A6B8] sm:text-2xl">
                    {formatLine(item.lines[1])}”
                  </p>
                </blockquote>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
