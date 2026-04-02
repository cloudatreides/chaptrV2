# Chaptr V2 — Current Session State

## In Progress
- **Multi-universe wiring (90% done)**: Story data written for Horror (Hollow Manor) and Mystery (The Last Signal). Architecture is universe-aware. Remaining wiring:
  - Pass `universeId` and `selectedUniverse` through call sites in `StoryReaderPage` (streamBeatProse call), `ChatScene` (streamChatReply, generateOpeningMessage calls), and `RevealPage` (generateRevealSignature, reveal perspective label)
  - ChatScene needs to use `getCharacter()` instead of `CHARACTERS[id]` for universe-specific characters
  - RevealPage needs `getRevealPerspective()` for the "X sees you as" label
  - The `loveInterest` picker on BioPage should only show for Seoul Transfer (hide for horror/mystery)
  - Need placeholder images for hollow-manor.svg and last-signal.svg in /public

## Done This Session
- **Approach C: Full Social Loop** — all 6 priorities complete:
  1. API proxy: `api/claude.ts` + `api/together.ts` (Vercel Edge, keys server-side)
  2. Analytics: `chaptr_events` Supabase table, 9 funnel events tracked
  3. Playthrough persistence: `chaptr_playthroughs` table, auto-save on reveal
  4. Share URLs: `/reveal/:id` (SPA) + `/s/:id` (OG-tagged for crawlers)
  5. OG meta: `api/og.tsx` dynamic image + `api/share.ts` meta HTML
  6. Rate limiting: deferred (not critical for testing)
- **Multi-universe story data**: Hollow Manor (Horror) + The Last Signal (Mystery) — full step definitions, characters, bibles, scene prompts
- **Universe-aware architecture**: `getStepsForUniverse()`, `getBibleForUniverse()`, `getCharacter()`, `getRevealPerspective()`, story registry pattern
- **Unlocked** hollow-manor and the-last-signal in UNIVERSES array

## Env Vars Needed in Vercel
- `ANTHROPIC_API_KEY` (server-side, no VITE_ prefix)
- `TOGETHER_API_KEY` (server-side, no VITE_ prefix)
- `SUPABASE_ANON_KEY` (for api/og.tsx and api/share.ts)

## Next
- Finish universe wiring (pass universeId through remaining call sites)
- Add placeholder universe cover images
- Test full playthrough on each story
- Love interest picker: hide for non-romance universes

## Key Files
- `src/data/stories/hollow-manor.ts` — Horror story data
- `src/data/stories/the-last-signal.ts` — Mystery story data
- `src/data/stories/index.ts` — Story registry
- `api/claude.ts` + `api/together.ts` — API proxies
- `api/og.tsx` + `api/share.ts` — OG image + share HTML
- `src/lib/supabase.ts` — Supabase client, analytics, playthrough persistence

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku (via proxy) + Together AI FLUX (via proxy) + Supabase
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
