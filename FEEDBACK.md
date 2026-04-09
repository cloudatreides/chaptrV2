# Chaptr V2 — User Feedback Log

---

## Round 1 — 2026-04-09

**Tester:** Pim (Product)

### Feedback

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | Characters feel rigid, robotic — same tone every time, no variety or playfulness | P0 | Fixed |
| 2 | Characters too serious, lack flirty energy — no wit, warmth, or romantic tension | P0 | Fixed |
| 3 | Suggestion chips are generic and disconnected from the conversation | P0 | Fixed |
| 4 | Choices don't meaningfully affect where the story goes | P1 | Open |
| 5 | User profile picture style doesn't match character art style (e.g. anime avatar with realistic character) | P2 | Open |
| 6 | Some AI-generated scenes feel unrelated to the previous conversation context | P2 | Open |

### What we changed

**Character personality overhaul** (`src/data/characters.ts`)
- Rewrote Jiwon, Sora, and Yuna system prompts
- Each character now has an explicit FLIRTING STYLE section with distinct approaches
- Added VARIETY instructions — characters must alternate energy between teasing, curious, vulnerable, playful, intense
- Replaced "guarded with strangers" framing with magnetic/intriguing framing
- All characters now carry the line: "You are a character in a ROMANCE story. Create chemistry, not distance."

**Romance chemistry from the start** (`src/lib/claudeStream.ts`)
- Lowered romance override threshold: was affinity >= 56, now tiered at >= 20 (chemistry building) and >= 56 (walls down)
- Romance rule now reads "create romantic tension from the VERY FIRST exchange"
- Removed preachy/therapist language guardrails — replaced with "give them butterflies, not therapy"

**Contextual AI suggestions** (`src/lib/claudeStream.ts`, `SceneChat.tsx`, `ChatScene.tsx`)
- Model now returns 3 contextual reply suggestions as part of every response
- Format: `[SUGGESTIONS: "reply 1" | "reply 2" | "reply 3"]`
- Suggestions must be direct responses to what the character just said — not generic icebreakers
- Components use AI suggestions when available, fall back to static genre pool as backup
- All streaming displays strip suggestion tags so they're never shown raw

### Still open

- **Choices affecting story** — Needs architectural work to branch content based on player decisions. Short-term: make AI reference past choices more explicitly.
- **Art style matching** — Would need style-transfer on user avatar or global style preset selection.
- **Scene context relevance** — Pass more conversation context into image generation prompts.
