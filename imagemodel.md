# Image Generation Model Map

## Models

- **FLUX.1 Schnell** — Fast text-to-image. No reference image support. Generates from prompt only. ~$0.003-0.01/image, 1-3s. Good for scenes without specific characters.
- **FLUX.1 Kontext Pro** — Img2img that accepts ONE reference image. Used to place the user's selfie into scenes or stylize a selfie into anime. Cannot accept multiple references, so when two characters are needed, the second character is generated from text description alone (unreliable). ~$0.04/image, 3-8s.
- **FLUX.2 Pro** — Multi-reference image generation. Accepts up to 8 reference images in a single call. Both the user's selfie AND the companion/character portrait can be passed as references, so both characters look consistent. Eliminates the need for a second refinement pass. ~$0.03-0.055/image, 5-8s.

## Case Map

| # | Where | What | Current Model | Proposed Model | Cost/image |
|---|---|---|---|---|---|
| 1 | Character reaction portraits (blush, surprise) | Solo companion portrait from text prompt | **FLUX.1 Schnell.** Text-only, no reference needed. Works fine for single-character portraits. | **Keep Schnell.** No reference images needed, single character from text is sufficient. | ~$0.003-0.01 |
| 2 | Story/Chat intro (SceneChat, ChatScene) | Atmosphere shot when chat opens | **FLUX.1 Schnell.** Text-only. No specific characters in the image. | **Keep Schnell.** Just mood/setting images, no character consistency needed. | ~$0.003-0.01 |
| 3 | Travel scenes (protagonistVisible: false) | Location-only scenery | **FLUX.1 Schnell.** Text-only. Pure landscape/location shots. | **Keep Schnell.** No characters in frame. | ~$0.003-0.01 |
| 4 | Reveal page background | Abstract dream scene with silhouettes | **FLUX.1 Schnell.** Text-only. No real characters. | **Keep Schnell.** Stylized abstract, no identity needed. | ~$0.003-0.01 |
| 5 | Gift images (CastChatPage) | Gift item illustration | **FLUX.1 Schnell.** Text-only. Object illustration, not people. | **Keep Schnell.** No characters involved. | ~$0.003-0.01 |
| 6 | Travel scenes (protagonistVisible: true) | Scene with user exploring a location | **FLUX.1 Kontext Pro.** Single reference (user selfie). Companion is generated from text only — looks different every time. | **FLUX.2 Pro.** Pass both user selfie + companion portrait as references. Both characters stay consistent in one call. | ~$0.03-0.055 |
| 7 | Travel "Show Me" button | Visualize what companion just described | **FLUX.1 Kontext Pro.** Single reference (user selfie). Companion appearance is random because no portrait reference is used. | **FLUX.2 Pro.** Both references in one call. Companion matches their portrait consistently. | ~$0.03-0.055 |
| 8 | Travel "Hold Hands" | Romantic scene of two people walking together | **FLUX.1 Kontext Pro.** Single reference (user selfie). Companion is text-described only, looks different every time. | **FLUX.2 Pro.** Both user and companion references passed. Both look like themselves. | ~$0.03-0.055 |
| 9 | Travel "Selfie" | Selfie photo of user and companion together | **FLUX.1 Kontext Pro.** Single reference (user selfie). Companion is text-described, inconsistent across images. | **FLUX.2 Pro.** Both references. Companion face matches their known portrait. | ~$0.03-0.055 |
| 10 | Story scenes (StoryReaderPage) | Story scenes with protagonist visible | **FLUX.1 Kontext Pro.** Single reference (user selfie). Story characters are generated from text only — random appearance. | **FLUX.2 Pro.** Pass user selfie + character portrait(s). Both protagonist and story characters stay consistent. | ~$0.03-0.055 |
| 11 | Chat actions — coffee, serenade (ChatScene, CastChatPage, FreeChatPage) | Romantic two-person scenes triggered by chat actions | **FLUX.1 Kontext Pro.** Single reference (user selfie). The character receiving the action is text-described only, looks different from their actual portrait. | **FLUX.2 Pro.** Both references in one call. Character matches their known portrait. | ~$0.03-0.055 |
| 12 | Story "capture moment" (StoryReaderPage) | Memory photo with user + 1-3 characters | **FLUX.1 Kontext Pro.** Single reference (user selfie). All other characters are text-described, random appearances. | **FLUX.2 Pro.** Supports up to 8 references. User selfie + all character portraits passed together. Everyone looks like themselves. | ~$0.03-0.055 |
| 13 | Selfie stylization (CreateCharacterPage, EditCharacterPage, TravelCityPage) | Transform user photo into anime avatar | **FLUX.1 Kontext Pro.** Single reference (the selfie itself). Transforms one image into anime style. Works well. | **Keep Kontext Pro.** Single image transform, only one reference needed. Already produces good results. | ~$0.04 |

## Cost Comparison

| Cases | Current cost/image | Proposed cost/image | Change |
|---|---|---|---|
| 1-5 (Schnell, no upgrade) | $0.003-0.01 | $0.003-0.01 | No change |
| 6-12 (Kontext Pro → FLUX.2 Pro) | $0.04-0.08 (Kontext + failed refinement pass) | $0.03-0.055 (single call) | Cheaper |
| 13 (Kontext Pro, no upgrade) | $0.04 | $0.04 | No change |
