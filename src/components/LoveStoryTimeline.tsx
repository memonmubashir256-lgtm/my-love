import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Camera, Expand, ImagePlus, Trash2, X } from 'lucide-react';
import type { MemoryChapter } from '../config/loveConfig';
import { interpolateLoveText } from '../utils/loveLogic';

gsap.registerPlugin(ScrollTrigger);

interface LoveStoryTimelineProps {
  memories: MemoryChapter[];
  herName: string;
  yourName: string;
  specialDate: string;
  onUpdateMemory: (id: string, patch: Partial<MemoryChapter>) => void;
}

export const LoveStoryTimeline: React.FC<LoveStoryTimelineProps> = ({
  memories,
  herName,
  yourName,
  specialDate,
  onUpdateMemory,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [lightboxMemory, setLightboxMemory] = useState<MemoryChapter | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.timeline-card', {
        y: 28,
        opacity: 0,
        duration: 0.75,
        stagger: 0.14,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!lightboxMemory) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxMemory(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxMemory]);

  const handlePhotoUpload = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateMemory(id, { photoDataUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <section
      ref={sectionRef}
      id="story"
      className="relative scroll-mt-16 border-t border-[#FFF4EA]/10 bg-[#10080C] px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 max-w-2xl">
          <p className="text-xs tracking-[0.22em] text-[#D8B46A] uppercase">
            02. Our Love Story
          </p>
          <h2 className="font-display mt-3 text-4xl font-medium text-[#FFF4EA] sm:text-5xl">
            Chapters Worth Remembering
          </h2>
          <p className="mt-4 text-base text-[#FFF4EA]/70">
            Every chapter below is yours to fill with real photographs and personal notes—nothing invented, everything genuinely ours.
          </p>
        </div>

        <div className="relative space-y-10 border-l border-[#D8B46A]/25 pl-6 sm:pl-10">
          {memories.map((memory) => {
            const formattedDate = interpolateLoveText(memory.dateLabel, {
              herName,
              yourName,
              specialDate,
            });
            const isEditing = editingId === memory.id;

            return (
              <article
                key={memory.id}
                className="timeline-card relative grid gap-6 rounded-2xl border border-[#FFF4EA]/10 bg-[#1B0911]/85 p-6 sm:grid-cols-12 sm:gap-8 sm:p-8"
              >
                {/* Chapter marker on hairline */}
                <span
                  aria-hidden="true"
                  className="absolute top-8 -left-[31px] flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#D8B46A] bg-[#310714] sm:-left-[47px]"
                />

                {/* Photo upload / gallery frame */}
                <div className="sm:col-span-5">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#D8B46A]/25 bg-[#12060B]">
                    {memory.photoDataUrl ? (
                      <>
                        <img
                          src={memory.photoDataUrl}
                          alt={memory.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setLightboxMemory(memory)}
                            aria-label={`View photo for ${memory.title} fullscreen`}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#FFF4EA]/25 bg-[#10080C]/85 text-[#FFF4EA] transition-colors hover:border-[#D8B46A] hover:text-[#D8B46A] cursor-pointer"
                          >
                            <Expand className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateMemory(memory.id, { photoDataUrl: null })
                            }
                            aria-label={`Remove photo for ${memory.title}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#FFF4EA]/25 bg-[#10080C]/85 text-[#F4A6B8] transition-colors hover:bg-[#A31336] hover:text-[#FFF4EA] cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 p-4 text-center transition-colors hover:bg-[#310714]/45">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D8B46A]/40 bg-[#310714]/70 text-[#D8B46A]">
                          <ImagePlus className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#FFF4EA]">
                            Upload a Personal Photo
                          </p>
                          <p className="mt-1 text-xs text-[#FFF4EA]/55">
                            Click to choose from your device
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(memory.id, e)}
                          className="sr-only"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Story chapter content */}
                <div className="flex flex-col justify-between sm:col-span-7">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#D8B46A]">
                      <span className="tabular-nums font-medium">
                        Chapter {memory.chapterNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formattedDate}</span>
                    </div>

                    <h3 className="font-display mt-2 text-2xl font-medium text-[#FFF4EA] sm:text-3xl">
                      {memory.title}
                    </h3>

                    {isEditing ? (
                      <div className="mt-4 space-y-3">
                        <label className="block">
                          <span className="sr-only">Date or label</span>
                          <input
                            type="text"
                            value={memory.dateLabel}
                            onChange={(e) =>
                              onUpdateMemory(memory.id, {
                                dateLabel: e.target.value,
                              })
                            }
                            placeholder="Date or chapter label"
                            className="w-full rounded-lg border border-[#D8B46A]/40 bg-[#10080C] px-3 py-2 text-xs text-[#FFF4EA] focus:border-[#D8B46A] focus:outline-none"
                          />
                        </label>
                        <label className="block">
                          <span className="sr-only">Memory story</span>
                          <textarea
                            rows={3}
                            value={memory.note}
                            onChange={(e) =>
                              onUpdateMemory(memory.id, { note: e.target.value })
                            }
                            className="w-full rounded-lg border border-[#D8B46A]/40 bg-[#10080C] px-3 py-2 text-sm leading-relaxed text-[#FFF4EA] focus:border-[#D8B46A] focus:outline-none"
                          />
                        </label>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm leading-relaxed text-[#FFF4EA]/75 sm:text-base">
                        {memory.note}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingId(isEditing ? null : memory.id)
                      }
                      className="rounded-lg border border-[#FFF4EA]/15 px-3.5 py-2 text-xs font-medium text-[#FFF4EA]/85 transition-colors hover:border-[#D8B46A] hover:text-[#D8B46A] cursor-pointer"
                    >
                      {isEditing ? 'Done Editing' : 'Edit Memory'}
                    </button>

                    {memory.photoDataUrl && (
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#FFF4EA]/15 px-3.5 py-2 text-xs font-medium text-[#F4A6B8] transition-colors hover:border-[#F4A6B8]">
                        <Camera className="h-3.5 w-3.5" />
                        <span>Replace Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(memory.id, e)}
                          className="sr-only"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Lightbox Gallery Modal */}
      {lightboxMemory && lightboxMemory.photoDataUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxMemory.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#10080C]/95 p-6"
        >
          <div className="relative w-full max-w-4xl">
            <button
              type="button"
              onClick={() => setLightboxMemory(null)}
              aria-label="Close photo lightbox"
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-[#FFF4EA]/25 text-[#FFF4EA] transition-colors hover:border-[#D8B46A] hover:text-[#D8B46A] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <img
              src={lightboxMemory.photoDataUrl}
              alt={lightboxMemory.title}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] w-full rounded-xl object-contain"
            />

            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4 border-t border-[#FFF4EA]/15 pt-4">
              <h3 className="font-display text-2xl text-[#FFF4EA]">
                {lightboxMemory.title}
              </h3>
              <span className="text-xs text-[#D8B46A]">
                Chapter {lightboxMemory.chapterNumber}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
