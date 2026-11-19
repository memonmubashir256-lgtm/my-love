import React, { useEffect, useReducer, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Heart, RotateCcw, Sparkles } from 'lucide-react';
import { ProposalRingController } from '../three/ProposalRingScene';
import {
  INITIAL_PROPOSAL_STATE,
  proposalReducer,
} from '../utils/loveLogic';
import { romanticAudio } from '../utils/romanticAudio';
import { FloatingPetalsOverlay } from './FloatingPetalsOverlay';

interface ProposalSectionProps {
  herName: string;
}

export const ProposalSection: React.FC<ProposalSectionProps> = ({
  herName,
}) => {
  const [state, dispatch] = useReducer(proposalReducer, INITIAL_PROPOSAL_STATE);
  const [webglFailed, setWebglFailed] = useState(false);

  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<ProposalRingController | null>(null);

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    let initialized = false;
    const initController = () => {
      if (initialized) return;
      initialized = true;
      try {
        const controller = new ProposalRingController({
          container: mount,
          onContextError: () => setWebglFailed(true),
        });
        controller.setState({
          boxOpen: state.boxOpen,
          celebrating: state.status === 'accepted',
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

  useEffect(() => {
    controllerRef.current?.setState({
      boxOpen: state.boxOpen,
      celebrating: state.status === 'accepted',
    });
  }, [state.boxOpen, state.status]);

  const handleYesForever = () => {
    dispatch({ type: 'ACCEPT_PROPOSAL' });
    romanticAudio.playCelebrationChime();

    try {
      const palette = ['#A31336', '#F4A6B8', '#D8B46A', '#FFF4EA'];
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.6 },
        colors: palette,
      });
      window.setTimeout(() => {
        confetti({
          particleCount: 75,
          angle: 60,
          spread: 60,
          origin: { x: 0.15, y: 0.65 },
          colors: palette,
        });
        confetti({
          particleCount: 75,
          angle: 120,
          spread: 60,
          origin: { x: 0.85, y: 0.65 },
          colors: palette,
        });
      }, 280);
    } catch {
      // Confetti is purely celebratory visual polish
    }
  };

  return (
    <section
      id="proposal"
      data-proposal-status={state.status}
      className="relative min-h-screen scroll-mt-16 overflow-hidden border-t border-[#D8B46A]/25 bg-proposal-radial px-6 py-24 sm:py-32"
    >
      <FloatingPetalsOverlay
        count={state.status === 'accepted' ? 44 : 14}
        burstMode={state.status === 'accepted'}
      />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12">
        {/* Left/Top: Interactive 3D Velvet Ring Box & Diamond Ring */}
        <div className="lg:col-span-6">
          <div className="relative h-[380px] w-full overflow-hidden rounded-2xl border border-[#D8B46A]/35 bg-[#1B060E]/75 shadow-[0_24px_70px_rgba(0,0,0,0.65)] sm:h-[460px]">
            <div
              ref={canvasMountRef}
              data-testid="proposal-ring-canvas-container"
              className="h-full w-full"
            />

            {webglFailed && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <Sparkles className="h-12 w-12 text-[#D8B46A]" />
                <p className="font-display mt-4 text-2xl text-[#FFF4EA]">
                  A Promise Kept in Gold
                </p>
              </div>
            )}

            {/* Simple Ring Box Controls (no backdrop-filter over WebGL) */}
            <div className="absolute right-4 bottom-4 left-4 flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-lg bg-[#10080C]/90 px-3 py-1.5 text-xs text-[#FFF4EA]/75">
                Drag to rotate 3D ring
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'TOGGLE_BOX' })}
                  className="rounded-lg border border-[#D8B46A]/60 bg-[#310714] px-3.5 py-1.5 text-xs font-medium text-[#FFF4EA] transition-colors hover:bg-[#A31336] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {state.boxOpen ? 'Close Ring Box' : 'Open Ring Box'}
                </button>
                <button
                  type="button"
                  onClick={() => controllerRef.current?.resetView()}
                  aria-label="Reset 3D ring angle"
                  className="rounded-lg border border-[#FFF4EA]/20 bg-[#10080C]/90 px-3 py-1.5 text-xs text-[#FFF4EA]/80 transition-colors hover:border-[#D8B46A] hover:text-[#D8B46A] cursor-pointer"
                >
                  Reset View
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right/Bottom: Proposal Narrative & Choice */}
        <div className="lg:col-span-6">
          <p className="text-xs tracking-[0.22em] text-[#D8B46A] uppercase">
            07. The Ultimate Proposal
          </p>

          {state.status === 'pending' && (
            <div data-testid="proposal-pending-panel" className="mt-5">
              <p className="font-display text-3xl italic text-[#F4A6B8] sm:text-4xl">
                {herName},
              </p>

              <p className="mt-4 text-lg leading-relaxed text-[#FFF4EA]/85">
                Every beautiful story has a special moment...
              </p>
              <p className="mt-2 font-display text-2xl text-[#FFF4EA] sm:text-3xl">
                You are my favorite chapter.
              </p>

              <div className="my-8 h-px w-24 bg-[#D8B46A]/50" />

              <h2 className="font-display text-4xl leading-tight font-semibold tracking-tight text-[#FFF4EA] sm:text-5xl">
                WILL YOU BE MINE FOREVER? 💍
              </h2>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleYesForever}
                  className="inline-flex items-center gap-2.5 rounded-full border border-[#D8B46A] bg-[#A31336] px-8 py-4 text-sm font-semibold tracking-[0.1em] text-[#FFF4EA] shadow-[0_14px_45px_rgba(163,19,54,0.55)] transition-transform duration-200 hover:scale-[1.03] hover:bg-[#be1a42] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D8B46A] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>YES, FOREVER!</span>
                  <Heart className="h-4 w-4 fill-[#FFF4EA]" />
                </button>

                <button
                  type="button"
                  onClick={() => dispatch({ type: 'NEED_MOMENT' })}
                  className="inline-flex items-center gap-2 rounded-full border border-[#FFF4EA]/25 bg-[#1B0810] px-6 py-4 text-sm font-medium tracking-wide text-[#FFF4EA]/85 transition-colors hover:border-[#F4A6B8] hover:text-[#F4A6B8] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  I NEED A MOMENT 🥺
                </button>
              </div>
            </div>
          )}

          {state.status === 'accepted' && (
            <div
              data-testid="proposal-accepted-panel"
              className="mt-5 rounded-2xl border border-[#D8B46A]/55 bg-[#2A0815]/90 p-8 shadow-[0_24px_65px_rgba(163,19,54,0.4)]"
            >
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#A31336] text-[#FFF4EA]">
                <Heart className="h-7 w-7 fill-[#FFF4EA]" />
              </div>

              <h2 className="font-display text-4xl leading-tight font-semibold text-[#FFF4EA] sm:text-5xl">
                YOU JUST MADE MY WORLD COMPLETE! ❤️
              </h2>

              <p className="mt-4 text-base leading-relaxed text-[#F4A6B8] sm:text-lg">
                Here&apos;s to all the beautiful memories waiting for us.
              </p>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'REPLAY_PROPOSAL' })}
                  className="inline-flex items-center gap-2 rounded-full border border-[#D8B46A]/60 bg-[#10080C] px-6 py-3 text-xs font-medium tracking-wider text-[#D8B46A] transition-colors hover:bg-[#310714] hover:text-[#FFF4EA] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Replay Proposal</span>
                </button>
              </div>
            </div>
          )}

          {state.status === 'paused' && (
            <div
              data-testid="proposal-paused-panel"
              className="mt-5 rounded-2xl border border-[#F4A6B8]/35 bg-[#1D0811]/95 p-8"
            >
              <h2 className="font-display text-3xl font-medium text-[#FFF4EA] sm:text-4xl">
                Take all the time your heart needs, {herName}.
              </h2>

              <p className="mt-4 text-base leading-relaxed text-[#FFF4EA]/80">
                There is zero rush and zero pressure. Moments like this are meant
                to feel completely peaceful and true to you. Whatever you choose,
                I am simply grateful to share this space with you.
              </p>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'RETURN_TO_PROPOSAL' })}
                  className="inline-flex items-center gap-2 rounded-full border border-[#D8B46A]/50 bg-[#310714] px-6 py-3 text-xs font-medium text-[#FFF4EA] transition-colors hover:bg-[#A31336] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Return to Proposal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
