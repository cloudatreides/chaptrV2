# Chaptr V2 — Current Session State

## In Progress
- Researching selfie-in-scene image gen alternatives (fal.ai vs Replicate vs others)

## Done This Session
- **Fixed onboarding order**: Landing → /universes (browse freely) → /bio → selfie gate only if needed → /story
- **Theatrical loading screen**: Replaced spinner with full "BUILDING YOUR WORLD" overlay — cycling status text, progress bar, chapter name
- **Relationship UI**: junhoTrust now visible — trust bar + status label (e.g. "cautiously curious") in reader nav. Claude returns `{"trustDelta", "statusLabel"}` JSON after each prose beat, parsed and applied automatically.
- **Bio selection page**: New `/bio` screen with 3 personality archetypes (The Quiet One, The Bold One, The Dreamer) + custom "write your own" option. Bio injected into Claude system prompt to shape protagonist voice.
- **Markdown stripping**: Bold/italic stripped inline during streaming. Headers and bullets stripped via `stripMarkdown()` on final prose. Trust JSON extracted and cleaned before display.

## New Onboarding Flow
Landing → /universes (Step 1 of 3) → /bio (Step 2 of 3) → /upload selfie gate (Step 3 of 3, skipped if selfie exists) → /story

## Next
- Selfie-in-scene photo generation (P0) — awaiting API evaluation results
- Hero BG blurry on retina — needs 2x source image (2880×1400)

## Open Issues (carried forward)
- Hero BG blurry on retina — needs 2x source image (2880×1400)
- Scene images are still placeholder V1 JPEGs — solved when photo gen is wired up

## Key Files
- `src/lib/claudeStream.ts` — streaming + system prompt + generateChoices() + stripMarkdown + extractTrustData
- `src/data/storyData.ts` — chapter data, CHARACTER_BIBLE, CHAPTER_BRIEFS, UNIVERSES
- `src/store/useStore.ts` — Zustand store (selfieUrl, gems, junhoTrust, trustStatusLabel, bio, dynamicChoices)
- `src/pages/StoryReaderPage.tsx` — main reader, choice handling, streaming, theatrical loader, trust UI
- `src/pages/BioPage.tsx` — personality archetype selection (new)
- `src/pages/LandingPage.tsx` — landing page (mobile + desktop)
- `src/pages/UniversesPage.tsx` — story browser
- `src/pages/UploadPage.tsx` — selfie upload (now step 3 of 3)

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku (direct SSE streaming)
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
