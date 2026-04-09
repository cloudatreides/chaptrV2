# Chaptr V2 — Current Session State

## In Progress
- Nothing actively in progress

## Done This Session

### 4 New Manhwa Romance Stories
Added 4 manhwa-style romance stories targeting 14-21 year old Asian female readers:
1. **Rooftop Promise** (`rooftop-promise`) — Chaebol heir Dohyun plays piano secretly on the school rooftop
2. **Fake Dating My Rival** (`fake-dating`) — Childhood rival Hajin becomes your fake boyfriend
3. **Café 11:11** (`cafe-1111`) — Shy artist Sunwoo has been drawing you in his sketchbook
4. **The Idol Next Door** (`idol-next-door`) — Missing K-pop idol Taehyun is hiding next door

Files: `src/data/stories/{rooftop-promise,fake-dating,cafe-1111,idol-next-door}.ts`, registered in story registry, storyData.ts universes, castRoster.ts (8 new characters), cover images in `public/`

### In-App Feedback Modal
- `FeedbackModal.tsx` — Bug report (with optional screenshot upload) or Feature Idea
- `FeedbackFab.tsx` — Global floating "Feedback" pill button (bottom-right, all pages)
- Mounted globally in App.tsx inside GameStateSync
- Submissions go to Supabase `feedback` table (migration: `002_feedback.sql`)
- Auto-captures page URL + user agent for bug context
- Improved modal contrast: solid `#1e1832` background, stronger `#3d3060` borders

### Master Mode — Affinity Tier Bypass
- Master mode now forces `tierIndex = 4` so all chat actions are unlocked
- Previously only bypassed gem costs, not tier requirements

### Text Readability Sweep
- Bumped all `text-white/10`, `/15`, `/20` to `/25`-`/50` across all pages
- Affinity tier colors brightened: Stranger 0.3→0.5, Acquaintance 0.4→0.7, Friend 0.6→0.85
- Action tray hover description bumped from white/50→white/80, gem/affinity labels 0.7→0.9

### Chat Action Changes
- Removed "Challenge" action (redundant with Dare)
- Comfort: now costs 2 gems, generates FLUX reaction portrait (arms open for hug)
- Mystery Box: now generates reaction portrait (surprised/delighted expression)
- Dare: now shows picker with 3 random genre-aware options instead of firing randomly
- Dare text + meme text now visible in chat message for better AI context
- Action text label context-aware: "Your dare" / "Your meme" / "Your letter"
- Added `getDareOptions()` to chatActions.ts

### Bug Fixes
- Fixed syntax error: extra braces around `characterAvatar()` in CastChatPage
- Fixed dare not working: AI was ignoring dare prompt because message only showed `[ACTION: Dare]` with no content

## Next
- Test dare picker UI and verify character performs the chosen dare
- Test all 4 new stories in-browser (play through, verify branching)
- Run `002_feedback.sql` migration in Supabase dashboard
- Debug coffee/serenade scene image generation (check browser console for Kontext logs)
- GTM: narrow to Seoul Transfer + K-drama/manhwa fan communities

## Blockers
- Node.js not available in Claude Code shell — can't run build/dev server
- Scene image gen for serenade/coffee may be failing silently — needs browser console check
