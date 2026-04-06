# Chaptr V2 — Current Session State

## In Progress
- Homepage built (`/home`), needs QA + push to git

## Done This Session
- **Landing page features section polished** — ambient glow orbs, gradient cards with hover lift, removed "Takes about 5 minutes" from both mobile + desktop CTA blocks
- **Image generation speed fix** — Kontext Pro steps 28→20, default scene size 1024x768→768x576, response format b64_json→url
- **Gender-aware scene images** — `generateSceneImage` now accepts `protagonistGender`, replaces "a young person" with gendered term, Kontext Pro prompt explicitly states gender. Wired in StoryReaderPage, ChatScene, SceneChat
- **Warmer chat suggestions** — all personality types (bold/quiet/dreamer/custom) rewritten across all tiers (opening/mid/deep) in ChatScene, SceneChat, FreeChatPage. No more confrontational tones ("Cut the small talk" → "I'm intrigued. Tell me everything")
- **Character replies longer** — max_tokens 150→300, system prompt requires 2-4 sentence substantive replies
- **Mood stage tooltip fix** — repositioned below to avoid clipping by header
- **Choice screen full-page** — ChoicePoint now uses `min-h-[calc(100vh-80px)]` + `justify-center`, taller images (160→220px), larger text
- **Homepage built** (`src/pages/HomePage.tsx`) — Dashboard Hub design:
  - Mobile: greeting header, continue story card with progress, universe covers row, character avatars with Edit link, stats row, "Start New Story" CTA
  - Desktop: two-column layout — left (continue story + universes grid + stats), right sidebar (character cards with Edit + create new)
  - Route: `/home` (protected), landing page CTA now routes to `/home` instead of `/universes`
- **Pencil designs** — 3 homepage variants designed in `chaptr.pen` (Dashboard Hub chosen, with characters section added)

## Next
1. **Push to git** — commit all changes
2. **QA the homepage** — test with existing characters/progress, test empty state (new user), verify mobile + desktop
3. **Character edit page** — standalone character editing (name, personality, selfie) independent from story flow
4. Immersive choice UX — scene backdrop + consequence hints
5. Test full playthroughs on Horror, Mystery, Sakura Academy, Edge of Atlas
6. Cost modeling before scaling
7. Hero BG blurry on retina — needs 2x source

## Key Files Changed This Session
- `src/pages/HomePage.tsx` — NEW, post-login dashboard
- `src/pages/LandingPage.tsx` — features section polish, CTA route change to `/home`
- `src/components/ChatScene.tsx` — warmer suggestions, mood tooltip fix, gender-aware images
- `src/components/SceneChat.tsx` — warmer suggestions, gender-aware images
- `src/components/ChoicePoint.tsx` — full-page centered layout
- `src/lib/togetherAi.ts` — speed optimizations, gender-aware prompts, url response format
- `src/lib/claudeStream.ts` — longer replies (max_tokens 300), substantive reply prompt
- `src/pages/StoryReaderPage.tsx` — gender passed to generateSceneImage
- `src/pages/FreeChatPage.tsx` — warmer suggestions
- `src/App.tsx` — added `/home` route

## Key Assets
- `public/step1-selfie.jpeg` — female selfie
- `public/step1-anime.png` — anime version matching selfie pose
- `public/jiwon-portrait.png` — Jiwon portrait for landing chat demo

## Stack
React + Vite + TS + Tailwind v3 + Zustand + Framer Motion + Vaul + Claude Haiku + Together AI FLUX
Repo: C:/Users/ASUS/projects/chaptr-v2
GitHub: https://github.com/cloudatreides/chaptrV2
Live: https://chaptr-v2.vercel.app
Supabase project: tbrnfiixertryutrijau
