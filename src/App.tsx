import { useCallback, useEffect, useState } from 'react';
import { AudioPlayerDock } from './components/AudioPlayerDock';
import { CustomCursor } from './components/CustomCursor';
import { FinalFooter } from './components/FinalFooter';
import { HeroIntro } from './components/HeroIntro';
import { LittleUniverseSection } from './components/LittleUniverseSection';
import { LoadingScreen } from './components/LoadingScreen';
import { LoveStoryTimeline } from './components/LoveStoryTimeline';
import { Navbar } from './components/Navbar';
import { PersonalizeModal } from './components/PersonalizeModal';
import { ProposalSection } from './components/ProposalSection';
import { RoseGardenSection } from './components/RoseGardenSection';
import { SecretLoveLetter } from './components/SecretLoveLetter';
import { ShayariSection } from './components/ShayariSection';
import { SpecialReasonsGrid } from './components/SpecialReasonsGrid';
import { WelcomeSection } from './components/WelcomeSection';
import {
  DEFAULT_LOVE_CONFIG,
  type LoveConfig,
  type MemoryChapter,
} from './config/loveConfig';
import {
  type AppStage,
  deserializeLoveConfig,
  resolveInitialStage,
  serializeLoveConfig,
} from './utils/loveLogic';
import { romanticAudio } from './utils/romanticAudio';

const STORAGE_KEY = 'forever_love_config_v2';

export default function App() {
  const [stage, setStage] = useState<AppStage>(() =>
    typeof window !== 'undefined'
      ? resolveInitialStage(window.location.search)
      : 'loading',
  );

  const [config, setConfig] = useState<LoveConfig>(() => {
    if (typeof window === 'undefined') return DEFAULT_LOVE_CONFIG;
    try {
      return deserializeLoveConfig(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      return DEFAULT_LOVE_CONFIG;
    }
  });

  const [personalizeOpen, setPersonalizeOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [trackTitle, setTrackTitle] = useState(() => romanticAudio.getTrackTitle());
  const [hasCustomTrack, setHasCustomTrack] = useState(false);

  // Sync data-app-state on body for clean state observability
  useEffect(() => {
    document.body.dataset.appState = stage;
  }, [stage]);

  // Persist personalization changes safely
  const updateConfig = useCallback((next: LoveConfig) => {
    setConfig(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, serializeLoveConfig(next));
    } catch {
      // Ignore quota errors on large uploaded photos in private browsing
    }
  }, []);

  const handleUpdateMemory = useCallback(
    (id: string, patch: Partial<MemoryChapter>) => {
      setConfig((prev) => {
        const next: LoveConfig = {
          ...prev,
          memories: prev.memories.map((m) =>
            m.id === id ? { ...m, ...patch } : m,
          ),
        };
        try {
          window.localStorage.setItem(STORAGE_KEY, serializeLoveConfig(next));
        } catch {
          // Safe fallback
        }
        return next;
      });
    },
    [],
  );

  const handleResetConfig = useCallback(() => {
    setConfig(DEFAULT_LOVE_CONFIG);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Safe fallback
    }
  }, []);

  const handleEnterExperience = useCallback(() => {
    setStage('experience');
    const started = romanticAudio.start();
    setIsMusicPlaying(started);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const handleToggleMusic = useCallback(() => {
    const playing = romanticAudio.togglePlay();
    setIsMusicPlaying(playing);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      romanticAudio.setMuted(next);
      return next;
    });
  }, []);

  const handleReplayFromBeginning = useCallback(() => {
    romanticAudio.pause();
    setIsMusicPlaying(false);
    setStage('intro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleUploadTrack = useCallback((file: File) => {
    const title = romanticAudio.loadCustomTrack(file);
    setTrackTitle(title);
    setHasCustomTrack(true);
    setIsMusicPlaying(true);
  }, []);

  const handleResetTrack = useCallback(() => {
    romanticAudio.clearCustomTrack();
    setTrackTitle(romanticAudio.getTrackTitle());
    setHasCustomTrack(false);
    setIsMusicPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      romanticAudio.dispose();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#10080C] text-[#FFF4EA]">
      <CustomCursor />

      {stage === 'loading' && (
        <LoadingScreen onComplete={() => setStage('intro')} />
      )}

      {stage === 'intro' && (
        <main>
          <HeroIntro onEnter={handleEnterExperience} />
        </main>
      )}

      {stage === 'experience' && (
        <>
          <Navbar onOpenPersonalize={() => setPersonalizeOpen(true)} />

          <main>
            <WelcomeSection
              herName={config.herName}
              specialDate={config.specialDate}
            />

            <LoveStoryTimeline
              memories={config.memories}
              herName={config.herName}
              yourName={config.yourName}
              specialDate={config.specialDate}
              onUpdateMemory={handleUpdateMemory}
            />

            <SpecialReasonsGrid
              reasons={config.specialReasons}
              herName={config.herName}
            />

            <ShayariSection
              shayari={config.shayari}
              herName={config.herName}
              yourName={config.yourName}
              specialDate={config.specialDate}
            />

            <SecretLoveLetter
              letterTemplate={config.loveLetterBody}
              herName={config.herName}
              yourName={config.yourName}
              specialDate={config.specialDate}
            />

            <RoseGardenSection />

            <LittleUniverseSection
              herName={config.herName}
              yourName={config.yourName}
              specialDate={config.specialDate}
              isMusicPlaying={isMusicPlaying}
              trackTitle={trackTitle}
              hasCustomTrack={hasCustomTrack}
              onToggleMusic={handleToggleMusic}
              onUploadTrack={handleUploadTrack}
              onResetTrack={handleResetTrack}
            />

            <ProposalSection herName={config.herName} />
          </main>

          <FinalFooter
            herName={config.herName}
            yourName={config.yourName}
            onReplayExperience={handleReplayFromBeginning}
            onOpenPersonalize={() => setPersonalizeOpen(true)}
          />

          <AudioPlayerDock
            isPlaying={isMusicPlaying}
            isMuted={isMuted}
            trackTitle={trackTitle}
            onTogglePlay={handleToggleMusic}
            onToggleMute={handleToggleMute}
            onUploadTrack={handleUploadTrack}
          />

          <PersonalizeModal
            isOpen={personalizeOpen}
            config={config}
            onClose={() => setPersonalizeOpen(false)}
            onSave={updateConfig}
            onReset={handleResetConfig}
          />
        </>
      )}
    </div>
  );
}
