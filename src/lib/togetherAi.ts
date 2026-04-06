export interface GenerateSceneParams {
  prompt: string
  width?: number
  height?: number
  referenceImageUrl?: string | null
  protagonistGender?: 'male' | 'female'
}

/** Generate a scene image using Together AI.
 *  If referenceImageUrl is provided, uses FLUX.1 Kontext Pro (img2img) so the
 *  player's stylized selfie is incorporated as the protagonist. Otherwise falls
 *  back to FLUX.1 Schnell (text-only). */
export async function generateSceneImage(params: GenerateSceneParams): Promise<string | null> {
  const { prompt, width = 768, height = 576, referenceImageUrl, protagonistGender } = params

  const useKontext = !!referenceImageUrl

  // Replace generic "a young person" with gender-specific description
  const genderedPrompt = protagonistGender
    ? prompt.replace(/a young person/gi, protagonistGender === 'female' ? 'a young woman' : 'a young man')
    : prompt

  const body = useKontext
    ? {
        model: 'black-forest-labs/FLUX.1-kontext-pro',
        prompt: `The reference image shows the protagonist, a ${protagonistGender === 'female' ? 'young woman' : 'young man'}. Place them into the following scene, keeping their face and appearance exactly as shown. IMPORTANT: Any other characters described in the scene (e.g. a Korean male idol, a girl with blue hair) are DIFFERENT people — generate them as new distinct characters, do NOT use the reference face for them. Scene: ${genderedPrompt}`,
        image_url: referenceImageUrl,
        width,
        height,
        steps: 20,
        n: 1,
        response_format: 'url',
      }
    : {
        model: 'black-forest-labs/FLUX.1-schnell',
        prompt: genderedPrompt,
        width,
        height,
        steps: 4,
        n: 1,
        response_format: 'url',
      }

  try {
    const response = await fetch('/api/together', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.error('Together AI error:', response.status)
      return null
    }

    const data = await response.json()
    const url = data.data?.[0]?.url
    if (url) return url
    const b64 = data.data?.[0]?.b64_json
    if (b64) return `data:image/png;base64,${b64}`
    return null
  } catch (e) {
    console.error('Scene generation failed:', e)
    return null
  }
}

/** Generate a character portrait using FLUX.1 Schnell */
export async function generateCharacterPortrait(prompt: string): Promise<string | null> {
  try {
    const response = await fetch('/api/together', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell',
        prompt,
        width: 512,
        height: 512,
        steps: 4,
        n: 1,
        response_format: 'url',
      }),
    })

    if (!response.ok) {
      console.error('Portrait generation error:', response.status)
      return null
    }

    const data = await response.json()
    const url = data.data?.[0]?.url
    if (url) return url
    const b64 = data.data?.[0]?.b64_json
    if (b64) return `data:image/png;base64,${b64}`
    return null
  } catch (e) {
    console.error('Portrait generation failed:', e)
    return null
  }
}

/** Stylize a selfie into an anime-style portrait using FLUX.1 Kontext (img2img) */
export async function stylizeSelfie(selfieDataUrl: string): Promise<string | null> {
  try {
    const response = await fetch('/api/together', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-kontext-pro',
        prompt: 'Transform this photo into an anime-style portrait illustration. Keep the exact same person, face, gender, facial features, glasses if present, hairstyle, and expression. Apply a clean anime art style with soft studio lighting, expressive eyes, and detailed hair. Clean simple background.',
        image_url: selfieDataUrl,
        width: 768,
        height: 768,
        steps: 20,
        n: 1,
        response_format: 'url',
      }),
    })

    if (!response.ok) {
      console.error('Stylize selfie error:', response.status)
      return null
    }

    const data = await response.json()
    const url = data.data?.[0]?.url
    if (url) return url
    const b64 = data.data?.[0]?.b64_json
    if (b64) return `data:image/png;base64,${b64}`
    return null
  } catch (e) {
    console.error('Selfie stylization failed:', e)
    return null
  }
}
