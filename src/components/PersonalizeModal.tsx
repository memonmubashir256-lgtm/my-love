import React, { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { DEFAULT_LOVE_CONFIG, type LoveConfig } from '../config/loveConfig';
import { sanitizePersonalization } from '../utils/loveLogic';

interface PersonalizeModalProps {
  isOpen: boolean;
  config: LoveConfig;
  onClose: () => void;
  onSave: (next: LoveConfig) => void;
  onReset: () => void;
}

export const PersonalizeModal: React.FC<PersonalizeModalProps> = ({
  isOpen,
  config,
  onClose,
  onSave,
  onReset,
}) => {
  const [draft, setDraft] = useState<LoveConfig>(config);

  useEffect(() => {
    if (isOpen) {
      setDraft(config);
    }
  }, [isOpen, config]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = sanitizePersonalization(draft, DEFAULT_LOVE_CONFIG);
    onSave(cleaned);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="personalize-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#10080C]/88 p-4 sm:p-6"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#D8B46A]/40 bg-[#1B0810] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.75)] sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-[#FFF4EA]/10 pb-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#D8B46A] uppercase">
              Personalize Keepsake
            </p>
            <h2
              id="personalize-heading"
              className="font-display mt-1 text-3xl text-[#FFF4EA]"
            >
              Customize Your Love Story
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close personalization modal"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FFF4EA]/15 text-[#FFF4EA]/75 transition-colors hover:border-[#D8B46A] hover:text-[#FFF4EA] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-[#F4A6B8]">
                Girlfriend Name
              </span>
              <input
                type="text"
                value={draft.herName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, herName: e.target.value }))
                }
                placeholder="[HER NAME]"
                className="w-full rounded-lg border border-[#FFF4EA]/15 bg-[#10080C] px-3.5 py-2.5 text-sm text-[#FFF4EA] focus:border-[#D8B46A] focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-[#F4A6B8]">
                Your Name
              </span>
              <input
                type="text"
                value={draft.yourName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, yourName: e.target.value }))
                }
                placeholder="[YOUR NAME]"
                className="w-full rounded-lg border border-[#FFF4EA]/15 bg-[#10080C] px-3.5 py-2.5 text-sm text-[#FFF4EA] focus:border-[#D8B46A] focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-[#F4A6B8]">
                Special Date
              </span>
              <input
                type="text"
                value={draft.specialDate}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, specialDate: e.target.value }))
                }
                placeholder="[DATE]"
                className="w-full rounded-lg border border-[#FFF4EA]/15 bg-[#10080C] px-3.5 py-2.5 text-sm text-[#FFF4EA] focus:border-[#D8B46A] focus:outline-none"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[#F4A6B8]">
              Secret Love Letter (supports [HER NAME] and [YOUR NAME])
            </span>
            <textarea
              rows={7}
              value={draft.loveLetterBody}
              onChange={(e) =>
                setDraft((d) => ({ ...d, loveLetterBody: e.target.value }))
              }
              className="w-full rounded-lg border border-[#FFF4EA]/15 bg-[#10080C] px-3.5 py-2.5 text-sm leading-relaxed text-[#FFF4EA] focus:border-[#D8B46A] focus:outline-none"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#FFF4EA]/10 pt-5">
            <button
              type="button"
              onClick={() => {
                onReset();
                setDraft(DEFAULT_LOVE_CONFIG);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#FFF4EA]/15 px-4 py-2.5 text-xs font-medium text-[#FFF4EA]/75 transition-colors hover:border-[#F4A6B8] hover:text-[#F4A6B8] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#FFF4EA]/15 px-5 py-2.5 text-xs font-medium text-[#FFF4EA]/80 transition-colors hover:text-[#FFF4EA] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#A31336] px-6 py-2.5 text-xs font-semibold text-[#FFF4EA] transition-colors hover:bg-[#be1a42] cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
