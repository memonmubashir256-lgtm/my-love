import React, { useState } from 'react';
import { Heart, Mail, MailOpen } from 'lucide-react';
import { ASSET_IMAGES } from '../config/loveConfig';
import { interpolateLoveText } from '../utils/loveLogic';
import { romanticAudio } from '../utils/romanticAudio';

interface SecretLoveLetterProps {
  letterTemplate: string;
  herName: string;
  yourName: string;
  specialDate: string;
}

export const SecretLoveLetter: React.FC<SecretLoveLetterProps> = ({
  letterTemplate,
  herName,
  yourName,
  specialDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const letterText = interpolateLoveText(letterTemplate, {
    herName,
    yourName,
    specialDate,
  });

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      romanticAudio.playWaxSealSound();
    }
  };

  return (
    <section
      id="letter"
      className="scroll-mt-16 border-t border-[#FFF4EA]/10 bg-cinematic-radial px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="text-xs tracking-[0.22em] text-[#D8B46A] uppercase">
            04. Secret Love Letter
          </p>
          <h2 className="font-display mt-3 text-4xl font-medium text-[#FFF4EA] sm:text-5xl">
            Sealed With All My Heart
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-[#FFF4EA]/70 sm:text-base">
            Break the crimson wax seal to unfold the letter written for you.
          </p>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Still-life botanical stationery visual */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-[#D8B46A]/25 bg-[#19080F] shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
              <img
                src={ASSET_IMAGES.letterPress}
                alt="Cream cotton stationery with crimson wax seal and dried rose petals"
                referrerPolicy="no-referrer"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="flex items-center justify-between px-6 py-4">
                <span className="font-display text-lg italic text-[#FFF4EA]">
                  For {herName}
                </span>
                <button
                  type="button"
                  onClick={handleToggle}
                  className="inline-flex items-center gap-2 rounded-full border border-[#D8B46A]/50 bg-[#310714] px-4 py-2 text-xs font-medium text-[#FFF4EA] transition-colors hover:border-[#D8B46A] hover:bg-[#A31336] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isOpen ? (
                    <>
                      <Mail className="h-3.5 w-3.5" />
                      <span>Fold Envelope</span>
                    </>
                  ) : (
                    <>
                      <MailOpen className="h-3.5 w-3.5" />
                      <span>Open Envelope</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 3D Interactive Envelope & Cream Letter Sheet */}
          <div className="lg:col-span-7">
            <div className="perspective-1200 relative mx-auto max-w-xl">
              {/* Envelope stage */}
              <div className="relative rounded-2xl border border-[#D8B46A]/35 bg-[#2A0916] p-4 shadow-[0_28px_70px_rgba(0,0,0,0.65)] sm:p-8">
                {/* 3D Hinged Top Flap */}
                <div
                  className="preserve-3d relative mb-4 origin-top transition-transform duration-700 ease-out"
                  style={{
                    transform: isOpen ? 'rotateX(165deg)' : 'rotateX(0deg)',
                  }}
                >
                  <div className="flex items-center justify-between rounded-t-xl border border-[#D8B46A]/30 bg-gradient-to-b from-[#450D22] to-[#310714] px-6 py-4">
                    <span className="text-xs tracking-[0.2em] text-[#D8B46A] uppercase">
                      Private Correspondence
                    </span>
                    <span className="text-xs text-[#F4A6B8]/80">
                      {isOpen ? 'Unsealed' : 'Wax Sealed'}
                    </span>
                  </div>
                </div>

                {/* Closed envelope prompt vs Unfolded Cream Cotton Letter */}
                {!isOpen ? (
                  <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-[#D8B46A]/20 bg-gradient-to-br from-[#310714] via-[#210610] to-[#14050B] p-8 text-center">
                    <button
                      type="button"
                      onClick={handleToggle}
                      aria-label="Break wax seal and open love letter"
                      className="group relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#D8B46A]/55 bg-[#A31336] shadow-[0_10px_30px_rgba(163,19,54,0.65)] transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D8B46A] cursor-pointer"
                    >
                      <Heart className="h-9 w-9 fill-[#FFF4EA] text-[#FFF4EA] transition-transform duration-200 group-hover:scale-110" />
                    </button>

                    <p className="font-display mt-6 text-2xl italic text-[#FFF4EA]">
                      For the eyes of {herName}
                    </p>
                    <p className="mt-2 text-xs tracking-[0.16em] text-[#D8B46A] uppercase">
                      Click the wax seal to open
                    </p>
                  </div>
                ) : (
                  <article
                    data-testid="love-letter-content"
                    className="rounded-xl border border-[#D8B46A]/40 bg-[#FFF4EA] p-7 text-[#2A0E17] shadow-inner transition-all duration-500 sm:p-10"
                  >
                    <div className="mb-6 flex items-center justify-between border-b border-[#A31336]/15 pb-4">
                      <span className="font-display text-sm italic text-[#A31336]">
                        With Every Heartbeat
                      </span>
                      <Heart className="h-4 w-4 fill-[#A31336] text-[#A31336]" />
                    </div>

                    <div className="font-display space-y-4 text-lg leading-relaxed whitespace-pre-line sm:text-xl">
                      {letterText}
                    </div>
                  </article>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
