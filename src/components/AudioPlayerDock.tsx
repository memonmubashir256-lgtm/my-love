import React from 'react';
import { Music, Pause, Play, Upload, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerDockProps {
  isPlaying: boolean;
  isMuted: boolean;
  trackTitle: string;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onUploadTrack: (file: File) => void;
}

export const AudioPlayerDock: React.FC<AudioPlayerDockProps> = ({
  isPlaying,
  isMuted,
  trackTitle,
  onTogglePlay,
  onToggleMute,
  onUploadTrack,
}) => {
  return (
    <aside
      aria-label="Romantic background music controls"
      className="fixed right-4 bottom-4 z-30 flex items-center gap-2 rounded-full border border-[#D8B46A]/35 bg-[#1A0810]/95 px-3 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
    >
      <Music className="h-3.5 w-3.5 text-[#D8B46A] shrink-0" aria-hidden="true" />
      <span className="hidden max-w-[185px] truncate text-xs text-[#FFF4EA]/85 sm:inline">
        {isPlaying ? trackTitle : `${trackTitle} · Paused`}
      </span>

      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A31336] text-[#FFF4EA] transition-colors hover:bg-[#be1a42] focus-visible:outline-2 focus-visible:outline-[#D8B46A] cursor-pointer shrink-0"
      >
        {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
      </button>

      <button
        type="button"
        onClick={onToggleMute}
        aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#FFF4EA]/15 text-[#FFF4EA]/80 transition-colors hover:border-[#D8B46A]/60 hover:text-[#FFF4EA] focus-visible:outline-2 focus-visible:outline-[#D8B46A] cursor-pointer shrink-0"
      >
        {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      </button>

      <label
        title="Upload custom Tera Mera Rishta MP3"
        aria-label="Upload custom MP3 audio track"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#FFF4EA]/15 text-[#D8B46A]/85 transition-colors hover:border-[#D8B46A] hover:text-[#FFF4EA] cursor-pointer shrink-0"
      >
        <Upload className="h-3.5 w-3.5" />
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
    </aside>
  );
};
