# Chaptr V2 — Current Session State

## In Progress
- Nothing actively in progress

## Done This Session

### 4 New Manhwa Romance Stories
Added 4 manhwa-style romance stories targeting 14-21 year old Asian female readers:

1. **Rooftop Promise** (`rooftop-promise`) — Chaebol heir Dohyun plays piano secretly on the school rooftop. You promised not to tell. Characters: Dohyun (🎹), Soyeon (✨). 15 steps, 2 choice points, 4 endings.

2. **Fake Dating My Rival** (`fake-dating`) — Childhood rival Hajin becomes your fake boyfriend for the summer. The deal ends in September. Characters: Hajin (😏), Yejin (👓). 15 steps, 2 choice points, 4 endings.

3. **Café 11:11** (`cafe-1111`) — Shy artist Sunwoo has been drawing you in his sketchbook every night at the café. Characters: Sunwoo (✏️), Jieun (☕). 15 steps, 2 choice points, 4 endings.

4. **The Idol Next Door** (`idol-next-door`) — Missing K-pop idol Taehyun is hiding in the apartment next door. He'll tutor you if you keep quiet. Characters: Taehyun (🎤), Nari (💗). 15 steps, 2 choice points, 4 endings.

**Files created:**
- `src/data/stories/rooftop-promise.ts`, `fake-dating.ts`, `cafe-1111.ts`, `idol-next-door.ts`
- Registered in `src/data/stories/index.ts` (story registry)
- Universe entries in `src/data/storyData.ts`
- Cast roster entries in `src/data/castRoster.ts` (8 new characters)
- Cover images in `public/` (rooftop-promise.jpeg, fake-dating.jpeg, cafe-1111.jpeg, idol-next-door.jpeg)

### Cover Image Regenerations
- Regenerated **Campus Rivals** cover as manhwa-style (library scene, two rivals glaring)
- Regenerated **Midnight in Paris** cover as manhwa-style (artist painting by the Seine)
- Moved Midnight in Paris to last position in romance lineup

### Character Portraits
- All 8 new characters have `portraitPrompt` fields — portraits auto-generate at runtime via FLUX Schnell. No static portrait PNGs needed.

## Next
- Test all 4 new stories in-browser (play through, verify branching, check image generation)
- Generate static character portraits if runtime generation is too slow
- Run `002_feedback.sql` migration in Supabase dashboard
- GTM: expand test audience to manhwa/K-drama fan communities

## Blockers
- Node.js not available in Claude Code shell — can't run build/dev server
