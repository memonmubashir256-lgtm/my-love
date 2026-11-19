/**
 * FOREVER LOVE — CENTRAL PERSONALIZATION CONFIGURATION
 * ----------------------------------------------------
 * Edit the values below or use the in-app "Personalize" panel
 * to customize names, dates, memories, compliments, and the love letter.
 *
 * All personal placeholders ([HER NAME], [YOUR NAME], [DATE]) are
 * interpolated cleanly throughout the experience.
 */

export interface MemoryChapter {
  id: string;
  chapterNumber: string;
  title: string;
  dateLabel: string;
  note: string;
  photoDataUrl: string | null;
}

export interface SpecialReason {
  id: number;
  title: string;
  detail: string;
}

export interface ShayariCouplet {
  id: number;
  title: string;
  lines: [string, string];
}

export interface LoveConfig {
  herName: string;
  yourName: string;
  specialDate: string;
  loveLetterBody: string;
  memories: MemoryChapter[];
  specialReasons: SpecialReason[];
  shayari: ShayariCouplet[];
}

export const ASSET_IMAGES = {
  velvetRose: '/src/assets/images/rose_velvet_macro_1795116962962.jpg',
  letterPress: '/src/assets/images/letter_botanical_press_1795116963326.jpg',
  nightSky: '/src/assets/images/velvet_night_sky_1795116965032.jpg',
} as const;

export const DEFAULT_LOVE_LETTER = `My Dearest [HER NAME],

Sometimes words are not enough to explain what someone means to you.

You are one of the most beautiful parts of my life. Your smile makes my days brighter, and your presence makes everything feel a little more special.

I don't promise that every day will be perfect, but I promise to respect you, support you, appreciate you and keep choosing you.

I want to create countless beautiful memories with you.

You deserve all the happiness in this world.

With all my love,
[YOUR NAME] ❤️`;

export const DEFAULT_MEMORIES: MemoryChapter[] = [
  {
    id: 'first-met',
    chapterNumber: '01',
    title: 'The day we first met',
    dateLabel: '[DATE]',
    note: 'Add the story of how our paths first crossed—the place, the feeling, and the moment everything shifted.',
    photoDataUrl: null,
  },
  {
    id: 'first-conversation',
    chapterNumber: '02',
    title: 'Our first conversation',
    dateLabel: 'Chapter Two',
    note: 'Write down the words, late-night messages, or shared quiet laughter that made time disappear.',
    photoDataUrl: null,
  },
  {
    id: 'funniest-memories',
    chapterNumber: '03',
    title: 'Our funniest memories',
    dateLabel: 'Chapter Three',
    note: 'Capture the inside jokes, spontaneous detours, and moments when we could not stop laughing together.',
    photoDataUrl: null,
  },
  {
    id: 'sweetest-moments',
    chapterNumber: '04',
    title: 'Our sweetest moments',
    dateLabel: 'Chapter Four',
    note: 'Record the quiet, tender memories that still bring warmth whenever they cross your mind.',
    photoDataUrl: null,
  },
  {
    id: 'became-special',
    chapterNumber: '05',
    title: 'Why you became special to me',
    dateLabel: 'Always',
    note: 'Describe the moment you realized she was not just someone in your life, but the person you wanted to choose every day.',
    photoDataUrl: null,
  },
];

export const DEFAULT_SPECIAL_REASONS: SpecialReason[] = [
  {
    id: 1,
    title: 'Your beautiful smile',
    detail: 'The way your smile softens the heaviest day and turns an ordinary room into somewhere warm.',
  },
  {
    id: 2,
    title: 'Your adorable personality',
    detail: 'Every little expression, spark of curiosity, and honest reaction that is unmistakably yours.',
  },
  {
    id: 3,
    title: 'Your beautiful eyes',
    detail: 'A quiet kind of warmth that says more in a single glance than a thousand words ever could.',
  },
  {
    id: 4,
    title: 'Your kindness',
    detail: 'How gently you care for the people around you, even in the smallest, unnoticed moments.',
  },
  {
    id: 5,
    title: 'Your cute little habits',
    detail: 'All the tiny, endearing things you do without realizing how deeply they stay in my memory.',
  },
  {
    id: 6,
    title: 'The happiness you bring',
    detail: 'Simply knowing you are there makes every plan brighter and every quiet evening feel complete.',
  },
  {
    id: 7,
    title: 'Your beautiful heart',
    detail: 'Rare, sincere, and full of grace—loving you feels like discovering home.',
  },
  {
    id: 8,
    title: 'Making ordinary moments special',
    detail: 'Even a quiet walk or a simple coffee beside you turns into a memory worth keeping forever.',
  },
  {
    id: 9,
    title: 'Your gentle strength',
    detail: 'The calm resilience you carry through every season, inspiring me more than you know.',
  },
  {
    id: 10,
    title: 'Your unforgettable laugh',
    detail: 'My favorite sound in the world—effortless, bright, and impossible not to smile along with.',
  },
  {
    id: 11,
    title: 'The peace in your presence',
    detail: 'With you, there is no need to pretend; silence feels easy and being myself feels natural.',
  },
  {
    id: 12,
    title: 'Simply being YOU',
    detail: 'Not a single version edited for the world—just you, exactly as you are, is everything.',
  },
];

export const DEFAULT_SHAYARI: ShayariCouplet[] = [
  {
    id: 1,
    title: 'Tera Mera Rishta',
    lines: [
      'Tera mera rishta adhoora nahi, ek mukammal kahani banega,',
      'Har pal tera saath meri zindagi ki sabse haseen nishani banega.',
    ],
  },
  {
    id: 2,
    title: 'Har Safar Mein Tu',
    lines: [
      'Tere bina adhoora lagta hai har ek safar, [HER NAME],',
      'Tu saath ho toh har manzil pyaari lagti hai.',
    ],
  },
  {
    id: 3,
    title: 'Meri Har Dua',
    lines: [
      'Lafzon mein kaise likhoon teri ehmiyat apni zindagi mein,',
      'Tu woh dua hai jo har sajde mein maangi jaati hai.',
    ],
  },
  {
    id: 4,
    title: 'Subah Aur Shaam',
    lines: [
      'Aankhon mein tera aks, khayalon mein tera naam,',
      'Subah bhi tu hi hai, aur tu hi meri har shaam.',
    ],
  },
  {
    id: 5,
    title: 'Bas Tu Hi Tu',
    lines: [
      'Na chand ki chaah hai, na sitaaron ki aarzoo,',
      'Bas haath mein tera haath ho, aur saamne sirf tu.',
    ],
  },
];

export const DEFAULT_LOVE_CONFIG: LoveConfig = {
  herName: 'Sifat',
  yourName: '[YOUR NAME]',
  specialDate: '[DATE]',
  loveLetterBody: DEFAULT_LOVE_LETTER,
  memories: DEFAULT_MEMORIES,
  specialReasons: DEFAULT_SPECIAL_REASONS,
  shayari: DEFAULT_SHAYARI,
};
