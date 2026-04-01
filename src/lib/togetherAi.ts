const TOGETHER_API_KEY = import.meta.env.VITE_TOGETHER_API_KEY ?? ''

export interface GenerateSceneParams {
  prompt: string
  width?: number
  height?: number
}

/** Generate a scene image using Together AI FLUX.1 Schnell */
export async function generateSceneImage(params: GenerateSceneParams): Promise<string | null> {
  if (!TOGETHER_API_KEY) return null

  const { prompt, width = 1024, height = 768 } = params

  try {
    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell',
        prompt,
        width,
        height,
        steps: 4,
        n: 1,
        response_format: 'b64_json',
      }),
    })

    if (!response.ok) {
      console.error('Together AI error:', response.status)
      return null
    }

    const data = await response.json()
    const b64 = data.data?.[0]?.b64_json
    if (!b64) return null

    return `data:image/png;base64,${b64}`
  } catch (e) {
    console.error('Scene generation failed:', e)
    return null
  }
}

/** Stylize a selfie into an anime-style portrait using FLUX.1 depth (img2img) */
export async function stylizeSelfie(selfieDataUrl: string): Promise<string | null> {
  if (!TOGETHER_API_KEY) return null

  try {
    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1.1-pro',
        prompt: 'Anime style portrait, beautiful K-drama character illustration, soft studio lighting, clean background, expressive eyes, detailed hair, high quality anime art style, same pose and facial features as reference',
        image_url: selfieDataUrl,
        width: 768,
        height: 768,
        steps: 20,
        n: 1,
        response_format: 'b64_json',
      }),
    })

    if (!response.ok) {
      console.error('Stylize selfie error:', response.status)
      return null
    }

    const data = await response.json()
    const b64 = data.data?.[0]?.b64_json
    if (!b64) return null

    return `data:image/png;base64,${b64}`
  } catch (e) {
    console.error('Selfie stylization failed:', e)
    return null
  }
}
