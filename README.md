# Forever Love — Cinematic 3D Proposal Website

A luxury 3D romantic proposal web experience featuring a loading curtain, hero reveal, editable memory timeline with photo uploads, 12 compliment cards, interactive 3D wax-sealed love letter, Three.js 3D Rose Garden, animated night sky constellations, an interactive 3D Velvet Ring Box & Diamond Ring proposal scene, and procedural Web Audio nocturnal music.

## Personalizing Your Story

You can customize everything in two ways:

1. **In-Browser Personalization**: Click **Personalize** in the top navigation bar (or footer) to edit `[HER NAME]`, `[YOUR NAME]`, `[DATE]`, and the Secret Love Letter. Click **Edit Memory** or **Upload a Personal Photo** directly on any of the 5 chapters in **Our Love Story** to add real photographs and captions. Changes persist locally in `localStorage`.
2. **In Code**: Edit `src/config/loveConfig.ts` to hardcode your names, special date, memories, compliments, and letter text before sharing or deploying.

## Project Structure

- `src/config/loveConfig.ts` — Central editable names, dates, memories, 12 reasons, and love letter template
- `src/utils/loveLogic.ts` — Pure personalization, proposal state machine, and parametric geometry/star math
- `src/utils/romanticAudio.ts` — Procedural Web Audio API nocturnal piano/harp music & chimes (zero external audio 404s)
- `src/three/RoseGardenScene.ts` — Composite multi-part 3D roses, instanced floating petals, and golden fireflies
- `src/three/ProposalRingScene.ts` — Interactive 3D velvet ring box and solitaire diamond ring
- `src/components/` — Modular React components for each of the 10 sections and interactive overlays

## Setup & Scripts

```bash
npm install
npm run dev       # Starts development server on http://localhost:3000
npm run lint      # TypeScript validation
npm run build     # Production build into dist/
npx --yes tsx --test src/utils/loveLogic.test.ts  # Run unit tests
```
