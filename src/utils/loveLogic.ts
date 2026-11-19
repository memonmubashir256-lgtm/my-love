import {
  DEFAULT_LOVE_CONFIG,
  type LoveConfig,
  type MemoryChapter,
  type ShayariCouplet,
  type SpecialReason,
} from '../config/loveConfig';

export type AppStage = 'loading' | 'intro' | 'experience';
export type ProposalStatus = 'pending' | 'accepted' | 'paused';

export interface ProposalState {
  boxOpen: boolean;
  status: ProposalStatus;
  celebrationCount: number;
}

export type ProposalAction =
  | { type: 'TOGGLE_BOX' }
  | { type: 'OPEN_BOX' }
  | { type: 'ACCEPT_PROPOSAL' }
  | { type: 'NEED_MOMENT' }
  | { type: 'RETURN_TO_PROPOSAL' }
  | { type: 'REPLAY_PROPOSAL' };

export const INITIAL_PROPOSAL_STATE: ProposalState = {
  boxOpen: false,
  status: 'pending',
  celebrationCount: 0,
};

/**
 * Pure state machine for the Ultimate Proposal interaction.
 * Always respects her choice and never forces acceptance.
 */
export function proposalReducer(
  state: ProposalState,
  action: ProposalAction,
): ProposalState {
  switch (action.type) {
    case 'TOGGLE_BOX':
      return { ...state, boxOpen: !state.boxOpen };
    case 'OPEN_BOX':
      return { ...state, boxOpen: true };
    case 'ACCEPT_PROPOSAL':
      return {
        boxOpen: true,
        status: 'accepted',
        celebrationCount: state.celebrationCount + 1,
      };
    case 'NEED_MOMENT':
      return {
        ...state,
        status: 'paused',
      };
    case 'RETURN_TO_PROPOSAL':
      return {
        ...state,
        status: 'pending',
      };
    case 'REPLAY_PROPOSAL':
      return {
        boxOpen: false,
        status: 'pending',
        celebrationCount: state.celebrationCount,
      };
    default:
      return state;
  }
}

/**
 * Interpolates [HER NAME], [YOUR NAME], and [DATE] placeholders cleanly.
 */
export function interpolateLoveText(
  template: string,
  config: Pick<LoveConfig, 'herName' | 'yourName' | 'specialDate'>,
): string {
  const her = config.herName.trim() || DEFAULT_LOVE_CONFIG.herName;
  const yours = config.yourName.trim() || DEFAULT_LOVE_CONFIG.yourName;
  const date = config.specialDate.trim() || DEFAULT_LOVE_CONFIG.specialDate;

  return template
    .replaceAll('[HER NAME]', her)
    .replaceAll('[YOUR NAME]', yours)
    .replaceAll('[DATE]', date);
}

/**
 * Sanitizes and validates user-edited personalization fields.
 */
export function sanitizePersonalization(
  input: Partial<LoveConfig>,
  current: LoveConfig = DEFAULT_LOVE_CONFIG,
): LoveConfig {
  const herName =
    typeof input.herName === 'string' && input.herName.trim().length > 0
      ? input.herName.trim().slice(0, 60)
      : current.herName;

  const yourName =
    typeof input.yourName === 'string' && input.yourName.trim().length > 0
      ? input.yourName.trim().slice(0, 60)
      : current.yourName;

  const specialDate =
    typeof input.specialDate === 'string' && input.specialDate.trim().length > 0
      ? input.specialDate.trim().slice(0, 60)
      : current.specialDate;

  const loveLetterBody =
    typeof input.loveLetterBody === 'string' && input.loveLetterBody.trim().length > 0
      ? input.loveLetterBody.slice(0, 3000)
      : current.loveLetterBody;

  const memories: MemoryChapter[] = Array.isArray(input.memories)
    ? current.memories.map((fallback, idx) => {
        const candidate = input.memories?.[idx];
        if (!candidate) return fallback;
        return {
          ...fallback,
          title:
            typeof candidate.title === 'string' && candidate.title.trim().length > 0
              ? candidate.title.trim().slice(0, 80)
              : fallback.title,
          dateLabel:
            typeof candidate.dateLabel === 'string' && candidate.dateLabel.trim().length > 0
              ? candidate.dateLabel.trim().slice(0, 40)
              : fallback.dateLabel,
          note:
            typeof candidate.note === 'string'
              ? candidate.note.slice(0, 600)
              : fallback.note,
          photoDataUrl:
            typeof candidate.photoDataUrl === 'string' && candidate.photoDataUrl.startsWith('data:image/')
              ? candidate.photoDataUrl
              : candidate.photoDataUrl === null
                ? null
                : fallback.photoDataUrl,
        };
      })
    : current.memories;

  const specialReasons: SpecialReason[] = Array.isArray(input.specialReasons)
    ? current.specialReasons.map((fallback, idx) => {
        const candidate = input.specialReasons?.[idx];
        if (!candidate) return fallback;
        return {
          id: fallback.id,
          title:
            typeof candidate.title === 'string' && candidate.title.trim().length > 0
              ? candidate.title.trim().slice(0, 80)
              : fallback.title,
          detail:
            typeof candidate.detail === 'string' && candidate.detail.trim().length > 0
              ? candidate.detail.trim().slice(0, 300)
              : fallback.detail,
        };
      })
    : current.specialReasons;

  const shayari: ShayariCouplet[] = Array.isArray(input.shayari)
    ? current.shayari.map((fallback, idx) => {
        const candidate = input.shayari?.[idx];
        if (!candidate) return fallback;
        return {
          id: fallback.id,
          title:
            typeof candidate.title === 'string' && candidate.title.trim().length > 0
              ? candidate.title.trim().slice(0, 80)
              : fallback.title,
          lines:
            Array.isArray(candidate.lines) && candidate.lines.length === 2
              ? [
                  String(candidate.lines[0] || fallback.lines[0]).slice(0, 220),
                  String(candidate.lines[1] || fallback.lines[1]).slice(0, 220),
                ]
              : fallback.lines,
        };
      })
    : current.shayari;

  return {
    herName,
    yourName,
    specialDate,
    loveLetterBody,
    memories,
    specialReasons,
    shayari,
  };
}

/**
 * Safely serializes and deserializes LoveConfig for localStorage persistence.
 */
export function serializeLoveConfig(config: LoveConfig): string {
  return JSON.stringify(config);
}

export function deserializeLoveConfig(raw: string | null): LoveConfig {
  if (!raw) return DEFAULT_LOVE_CONFIG;
  try {
    const parsed = JSON.parse(raw) as Partial<LoveConfig>;
    if (!parsed || typeof parsed !== 'object') {
      return DEFAULT_LOVE_CONFIG;
    }
    return sanitizePersonalization(parsed, DEFAULT_LOVE_CONFIG);
  } catch {
    return DEFAULT_LOVE_CONFIG;
  }
}

/**
 * Resolves initial app stage based on URL search string (?autostart=1 skips loading/intro).
 */
export function resolveInitialStage(search: string): AppStage {
  const params = new URLSearchParams(search);
  if (params.get('autostart') === '1') {
    return 'experience';
  }
  return 'loading';
}

/**
 * Deterministic golden-angle phyllotaxis coordinate generator for 3D rose petals.
 */
export interface PetalPlacement {
  angle: number;
  radius: number;
  heightOffset: number;
  tilt: number;
  scale: number;
}

export function computeRosePetalPlacement(index: number, total: number): PetalPlacement {
  const safeTotal = Math.max(1, total);
  const t = index / safeTotal;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const angle = index * goldenAngle;
  const radius = 0.06 + Math.pow(t, 0.78) * 0.44;
  const heightOffset = (1 - t) * 0.22;
  const tilt = 0.08 + t * 0.72;
  const scale = 0.45 + t * 0.68;

  return { angle, radius, heightOffset, tilt, scale };
}

/**
 * Deterministic constellation coordinates for "Our Little Universe".
 */
export interface StarNode {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  isHeartNode: boolean;
}

export function generateConstellationStars(
  count: number,
  seed = 1337,
): StarNode[] {
  let s = seed >>> 0;
  const nextRand = () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };

  const stars: StarNode[] = [];
  const heartCount = Math.min(18, Math.floor(count * 0.2));

  // Heart constellation ring centered around (0.5, 0.46)
  for (let i = 0; i < heartCount; i++) {
    const t = (i / heartCount) * Math.PI * 2;
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = -(
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
    );
    stars.push({
      x: 0.5 + hx * 0.011,
      y: 0.48 + hy * 0.013,
      radius: 2.1 + nextRand() * 1.4,
      alpha: 0.85,
      twinkleSpeed: 1.2 + nextRand() * 1.8,
      twinklePhase: nextRand() * Math.PI * 2,
      isHeartNode: true,
    });
  }

  for (let i = heartCount; i < count; i++) {
    stars.push({
      x: nextRand(),
      y: nextRand(),
      radius: 0.6 + nextRand() * 1.6,
      alpha: 0.25 + nextRand() * 0.7,
      twinkleSpeed: 0.6 + nextRand() * 2.2,
      twinklePhase: nextRand() * Math.PI * 2,
      isHeartNode: false,
    });
  }

  return stars;
}
