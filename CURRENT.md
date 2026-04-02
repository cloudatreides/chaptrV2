# Chaptr V2 — Current Session State

## In Progress
- Nothing — ready to start Approach C (Full Social Loop)

## Done This Session
- **Landing page refresh**: Removed fake testimonials/social proof. Added honest value prop + feature differentiators section. Better mobile CTAs.
- **Mobile polish**: Fixed breakpoint inconsistency (lg→md on StoryReaderPage), added dvh viewport units, iOS zoom prevention, better chat keyboard handling, consistent safe areas.
- **Logo nav**: Chaptr logo now navigates home on all inner pages.
- **Bug fixes**: Universe modal centering (Framer Motion transform conflict), Start Over button layout (choice-btn justify-between override).
- **CEO Review (Approach C selected)**: Full social loop for market testing.

## Next — Approach C: Full Social Loop (BUILD THIS)
Priority order:
1. **Supabase edge function proxy** — wrap Anthropic + Together AI calls. Keys stay server-side. Basic rate limiting (50 plays/IP/day).
2. **Analytics events** — Posthog free tier or Supabase table: landing_view, universe_select, bio_complete, upload_complete, story_start, chat_exchange, choice_made, reveal_reached, share_clicked.
3. **Playthrough persistence** — Save completed playthroughs to Supabase (unique ID, choices, reveal signature, trust score, selfie reference).
4. **Unique share URLs** — `/reveal/:id` loads saved playthrough. Visitors see reveal card without playing.
5. **OG meta tags** — Dynamic OG image for share URLs (anime selfie + reveal text). Shows in Twitter/Discord previews.
6. **Rate limiting** — IP-based abuse prevention on proxy.

## CEO Review Key Findings
- **Selfie hook is the bet** — "your face in the story" is genuinely differentiated
- **Exposed API keys** — blocks real public distribution (Supabase proxy fixes this)
- **Zero analytics** — can't measure funnel drop-off (Posthog/Supabase logging fixes this)
- **Share is weak** — copy-to-clipboard with no OG preview kills viral potential
- **Cost risk** — model API costs per playthrough need estimation before scaling
- **One story** — fine for testing, but no answer to "what's next" if hook works

## Open Issues (carried forward)
- Hero BG blurry on retina — needs 2x source image (2880×1400)
- Cost modeling needed before scaling (Claude Haiku + Together AI per playthrough)

## Key Files
- `src/lib/claudeStream.ts` — streaming + system prompts + generateOpeningMessage + extractTrustData
- `src/data/storyData.ts` — step-based branching model, STORY_STEPS, getActiveSteps()
- `src/store/useStore.ts` — Zustand store (persist, chaptr-v2-story key)
- `src/pages/StoryReaderPage.tsx` — step-based state machine reader
- `src/components/ChatScene.tsx` — freeform chat (mood labels, min/max exchanges, AI opener)
- `src/pages/LandingPage.tsx` — landing page (refreshed)
- `src/pages/RevealPage.tsx` — relationship reveal + share

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku (direct SSE) + Together AI FLUX (scenes + selfie)
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
