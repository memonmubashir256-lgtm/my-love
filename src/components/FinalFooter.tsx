import React from 'react';
import { Heart, RotateCcw } from 'lucide-react';

interface FinalFooterProps {
  herName: string;
  yourName: string;
  onReplayExperience: () => void;
  onOpenPersonalize: () => void;
}

export const FinalFooter: React.FC<FinalFooterProps> = ({
  herName,
  yourName,
  onReplayExperience,
  onOpenPersonalize,
}) => {
  return (
    <footer className="border-t border-[#FFF4EA]/10 bg-[#10080C] px-6 pt-24 pb-16">
      <div className="mx-auto max-w-3xl text-center">
        <div className="animate-heart-breath mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-[#D8B46A]/35 bg-[#310714]/70">
          <Heart className="h-7 w-7 fill-[#A31336] text-[#F4A6B8]" />
        </div>

        <p className="font-display text-2xl leading-relaxed text-[#FFF4EA]/90 sm:text-3xl">
          Whatever the future holds, I hope it is filled with kindness,
          happiness, laughter and beautiful memories.
        </p>

        <p className="font-display mt-5 text-3xl italic text-[#F4A6B8] sm:text-4xl">
          Thank you for being YOU. ❤️
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={onReplayExperience}
            className="inline-flex items-center gap-2 rounded-full border border-[#D8B46A]/45 bg-[#1B0810] px-5 py-2.5 text-xs font-medium text-[#FFF4EA] transition-colors hover:border-[#D8B46A] hover:bg-[#310714] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[#D8B46A]" />
            <span>Replay From Beginning</span>
          </button>

          <button
            type="button"
            onClick={onOpenPersonalize}
            className="rounded-full border border-[#FFF4EA]/15 px-5 py-2.5 text-xs font-medium text-[#FFF4EA]/75 transition-colors hover:border-[#F4A6B8] hover:text-[#F4A6B8] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Customize Names &amp; Memories
          </button>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-[#FFF4EA]/10 pt-8 text-xs text-[#FFF4EA]/50">
          <span>Forever Love · {herName} &amp; {yourName}</span>
          <span>Made with sincerity and care</span>
        </div>
      </div>
    </footer>
  );
};
