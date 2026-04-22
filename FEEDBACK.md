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
| 4 | Choices don't meaningfully affect where the story goes | P1 | Fixed |
| 5 | User profile picture style doesn't match character art style (e.g. anime avatar with realistic character) | P2 | Fixed |
| 6 | Some AI-generated scenes feel unrelated to the previous conversation context | P2 | Fixed |

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

### What we changed (Round 2)

**Choices affecting story (#4)**
- Added `affinityDelta` to `ChoiceOption` — bold choices boost affinity (+5 to +12), cautious gives moderate, evasive penalizes
- Affinity changes applied instantly on choice selection
- Beat prose AI prompt now receives `MOST RECENT CHOICE — CRITICAL` section forcing consequences to show
- Chat `storyContext` includes most recent choice with tone/sceneHint

**Art style matching (#5)** (`AppSidebar.tsx`)
- The user's selfie was already being anime-styled via FLUX.1 Kontext Pro (img2img style transfer) during character creation — so the in-story avatar matches character art
- The actual gap was the sidebar account section, which was pulling the raw OAuth avatar (`user_metadata.avatar_url`) instead of the styled version
- Fixed sidebar to prioritize `activeChar.selfieUrl` (anime version) → OAuth avatar → generic icon fallback

**Scene context relevance (#6)** (`togetherAi.ts`, `StoryReaderPage.tsx`, `ChatScene.tsx`)
- Root cause: all scene image prompts were static strings from `SCENE_PROMPTS` — no awareness of what just happened in the story
- Added `moodContext` parameter to `generateSceneImage()` that appends choice tone to the FLUX prompt
- StoryReaderPage builds mood from the player's most recent choice `sceneHint` (e.g. "bold / direct") and passes it to beat and carousel image generation
- ChatScene extracts mood from `storyContext` and passes it to chat intro image generation
- Result: FLUX prompts now end with contextual suffixes like "bold / direct mood, emotional tension" so generated scenes reflect story state
