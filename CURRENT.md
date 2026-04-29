# Chaptr V2 — Current Session State

## In Progress
- Image generation consistency — scene images still don't perfectly match twin/companion portrait styles (different FLUX models used)

## Done This Session

### Mobile Landing Page Performance + UX
- Replaced auto-scroll CSS animation carousel with manual swipe + arrow buttons on mobile (MobileDestinationCarousel component)
- Added auto-scroll back (3s interval) that pauses on touch/arrow tap, resumes after 4s
- Added `loading="lazy"` to all destination card images (28 destinations × ~650KB each = ~18MB was loading eagerly)
- Added `loading="lazy"` to story card images
- Mobile carousel now renders only 28 images (not 56 — removed the duplication needed for infinite CSS loop)

### Image Generation Consistency
- FLUX.2 Pro scene prompts now include companion visual description (was passed as param but never used)
- Added explicit style anchors ("cel-shaded, soft shading, expressive eyes, detailed hair") to FLUX.2 Pro and Kontext Pro prompts
- Bumped generation steps 20 → 25 for FLUX.2 Pro and Kontext Pro
- Added "NOT western cartoon" to anime style suffix to prevent style drift
- DepartureScreen now passes `companionDescription` through to `generateSceneImage`

## Done Previous Sessions
- Mobile QA pass (copyright year, text sizes, viewport testing)
- Stay 2 More Days flow (HomePage → TravelReaderPage)
- $2.99 pricing display, chat history continuity
- Journey Stats bento, companion remix, globe expansion
- Day transitions, destination covers, food/landmark images
- Landing page, companion cards, globe UX
- Travel Mode (Phases 1-5), multi-chapter stories

## Next
1. **Test image consistency live** — start a new trip and compare departure scene vs twin/companion portraits
2. **GTM launch** — GTM-PLAYBOOK.md is ready, 30 destinations, 7+ stories
3. **Mobile polish** — continue testing on real phone

## Key Files
- `src/lib/togetherAi.ts` — all image generation (FLUX.2 Pro scenes, Kontext Pro selfie stylize, Schnell portraits)
- `src/components/travel/DepartureScreen.tsx` — departure scene generation with both character refs
- `src/pages/LandingPage.tsx` — MobileDestinationCarousel with auto-scroll + arrows + lazy loading
- `src/pages/TravelReaderPage.tsx` — travel reader with scene generation calls

## Blockers
- Scene images use FLUX.2 Pro while portraits use FLUX.1 Schnell — inherently different model styles. Prompt alignment helps but can't fully solve cross-model consistency.
- Safari selfie image not loading (likely base64 data URL too large)
