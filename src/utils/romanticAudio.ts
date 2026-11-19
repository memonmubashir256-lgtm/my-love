/**
 * Romantic Audio Engine — "Tera Mera Rishta" Inspired Nocturne + Custom MP3 Support
 * ----------------------------------------------------------------------------------
 * Plays a soulful D-minor / F-major ballad arrangement ("Tera Mera Rishta" mood)
 * using Web Audio API piano + warm string pad synthesis with zero external 404s,
 * and also supports loading a local MP3/audio file chosen by the user.
 */

interface MelodyStep {
  bass: number;
  arp: number[];
  lead: number | null;
}

class RomanticAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private timerId: number | null = null;
  private isPlaying = false;
  private isMuted = false;
  private stepIndex = 0;

  // Optional user-uploaded MP3 audio element
  private customAudio: HTMLAudioElement | null = null;
  private customObjectUrl: string | null = null;
  private trackTitle = 'Tera Mera Rishta (Instrumental)';

  // Soulful Dm -> C -> Bb -> A7 romantic ballad phrasing (Hz)
  private readonly steps: MelodyStep[] = [
    // Bar 1: Dm (D3, A3, D4, F4)
    { bass: 146.83, arp: [220.0, 293.66, 349.23], lead: 440.0 },   // A4
    { bass: 146.83, arp: [293.66, 349.23, 440.0], lead: 466.16 },  // Bb4
    { bass: 146.83, arp: [220.0, 293.66, 349.23], lead: 440.0 },   // A4
    { bass: 146.83, arp: [293.66, 349.23, 440.0], lead: 392.0 },   // G4
    // Bar 2: C (C3, G3, C4, E4)
    { bass: 130.81, arp: [196.0, 261.63, 329.63], lead: 349.23 },  // F4
    { bass: 130.81, arp: [261.63, 329.63, 392.0], lead: 329.63 },  // E4
    { bass: 130.81, arp: [196.0, 261.63, 329.63], lead: 349.23 },  // F4
    { bass: 130.81, arp: [261.63, 329.63, 392.0], lead: 392.0 },   // G4
    // Bar 3: Bb (Bb2, F3, Bb3, D4)
    { bass: 116.54, arp: [174.61, 233.08, 293.66], lead: 349.23 }, // F4
    { bass: 116.54, arp: [233.08, 293.66, 349.23], lead: 329.63 }, // E4
    { bass: 116.54, arp: [174.61, 233.08, 293.66], lead: 293.66 }, // D4
    { bass: 116.54, arp: [233.08, 293.66, 349.23], lead: 329.63 }, // E4
    // Bar 4: A7sus4 -> A7 (A2, E3, A3, C#4)
    { bass: 110.0, arp: [164.81, 220.0, 293.66], lead: 329.63 },   // E4
    { bass: 110.0, arp: [164.81, 220.0, 277.18], lead: 277.18 },   // C#4
    { bass: 110.0, arp: [220.0, 277.18, 329.63], lead: 293.66 },   // D4
    { bass: 110.0, arp: [164.81, 220.0, 277.18], lead: null },
  ];

  private ensureContext(): boolean {
    if (typeof window === 'undefined') return false;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return false;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.24;
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return true;
  }

  private playTone(
    freq: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'triangle',
    cutoff = 1150,
  ): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const env = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, now);
    filter.frequency.exponentialRampToValueAtTime(280, now + duration);

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(volume, now + 0.06);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(env);
    env.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  public start(): boolean {
    if (this.isPlaying) return true;

    if (this.customAudio) {
      this.customAudio.muted = this.isMuted;
      void this.customAudio.play().catch(() => {
        // Fallback silently if browser blocks playback
      });
      this.isPlaying = true;
      return true;
    }

    if (!this.ensureContext()) return false;

    this.isPlaying = true;
    const tick = () => {
      if (!this.isPlaying || this.customAudio) return;
      const step = this.steps[this.stepIndex % this.steps.length];
      const isBarStart = this.stepIndex % 4 === 0;

      if (isBarStart) {
        this.playTone(step.bass, 2.8, 0.16, 'sine', 600);
      }

      const arpNote = step.arp[this.stepIndex % step.arp.length];
      this.playTone(arpNote, 1.45, 0.085, 'triangle', 950);

      if (step.lead !== null) {
        this.playTone(step.lead, 1.9, 0.14, 'sine', 1400);
      }

      this.stepIndex++;
      this.timerId = window.setTimeout(tick, 620);
    };
    tick();
    return true;
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
  }

  public togglePlay(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    }
    return this.start();
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.customAudio) {
      this.customAudio.muted = muted;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        muted ? 0 : 0.24,
        this.ctx.currentTime,
        0.08,
      );
    }
  }

  public loadCustomTrack(file: File): string {
    this.pause();
    if (this.customObjectUrl) {
      URL.revokeObjectURL(this.customObjectUrl);
    }
    const url = URL.createObjectURL(file);
    this.customObjectUrl = url;
    const audio = new Audio(url);
    audio.loop = true;
    audio.muted = this.isMuted;
    audio.volume = 0.65;
    this.customAudio = audio;
    const cleanName = file.name.replace(/\.[^/.]+$/, '').slice(0, 32);
    this.trackTitle = cleanName || 'Tera Mera Rishta';
    this.start();
    return this.trackTitle;
  }

  public clearCustomTrack(): void {
    this.pause();
    if (this.customAudio) {
      this.customAudio.src = '';
      this.customAudio = null;
    }
    if (this.customObjectUrl) {
      URL.revokeObjectURL(this.customObjectUrl);
      this.customObjectUrl = null;
    }
    this.trackTitle = 'Tera Mera Rishta (Instrumental)';
  }

  public getTrackTitle(): string {
    return this.trackTitle;
  }

  public hasCustomTrack(): boolean {
    return this.customAudio !== null;
  }

  public getState(): { isPlaying: boolean; isMuted: boolean; trackTitle: string } {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      trackTitle: this.trackTitle,
    };
  }

  public playWaxSealSound(): void {
    if (!this.ensureContext() || this.isMuted) return;
    this.playTone(587.33, 0.9, 0.09, 'sine', 1200);
    window.setTimeout(() => this.playTone(698.46, 1.1, 0.08, 'sine', 1200), 110);
  }

  public playCelebrationChime(): void {
    if (!this.ensureContext() || this.isMuted) return;
    const notes = [349.23, 440.0, 523.25, 659.25, 698.46, 880.0, 1046.5];
    notes.forEach((freq, idx) => {
      window.setTimeout(() => {
        this.playTone(freq, 2.4, 0.14, 'triangle', 1500);
      }, idx * 120);
    });
  }

  public dispose(): void {
    this.clearCustomTrack();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
      this.masterGain = null;
    }
  }
}

export const romanticAudio = new RomanticAudioEngine();
