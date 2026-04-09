# Chaptr V2 — Current Session State

## In Progress
- Nothing actively in progress

## Done This Session

### First External Feedback — Fixes Applied
Received feedback from Pim (Product) on 2026-04-09. Full log in `FEEDBACK.md`.

**Character personality overhaul** (`src/data/characters.ts`)
- Rewrote Jiwon, Sora, Yuna system prompts — each now has explicit FLIRTING STYLE + VARIETY sections
- Characters framed as magnetic/intriguing instead of guarded/deflecting
- All carry "create chemistry, not distance" instruction

**Contextual AI suggestions** (`src/lib/claudeStream.ts` + all chat components)
- Model now returns `[SUGGESTIONS: "..." | "..." | "..."]` contextual to what was just said
- Components use AI suggestions when available, static pool as fallback
- `generateOpeningMessage` returns `{ content, suggestions }` (breaking change — all consumers updated)
- All streaming displays strip suggestion tags

**Romance chemistry from first exchange** (`src/lib/claudeStream.ts`)
- Tiered: chemistry building at affinity >= 20, walls down at >= 56 (was only >= 56)
- Romance rule rewritten: "butterflies not therapy"

## Done Previous Sessions
- 4 new manhwa romance stories (rooftop-promise, fake-dating, cafe-1111, idol-next-door)
- In-app feedback modal + FAB
- Master mode affinity tier bypass
- Text readability sweep
- Chat action changes (dare picker, comfort/mystery box portraits)

## Next
- Test character responses in-browser — verify flirtier tone and contextual suggestions
- Address remaining feedback: choices affecting story (P1), art style matching (P2), scene context (P2)
- Test all 4 new stories in-browser
- Run `002_feedback.sql` migration in Supabase dashboard
- GTM: narrow to Seoul Transfer + K-drama/manhwa fan communities

## Blockers
- Node.js not available in Claude Code shell — can't run build/dev server
- Scene image gen for serenade/coffee may be failing silently — needs browser console check
