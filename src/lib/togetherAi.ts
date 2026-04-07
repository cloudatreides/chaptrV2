import { supabase } from './supabase'

export interface GenerateSceneParams {
  prompt: string
  width?: number
  height?: number
  referenceImageUrl?: string | null
  protagonistGender?: 'male' | 'female'
  includesProtagonist?: boolean
}

// ─── Prompt-hash image cache (Supabase) ───

async function hashPrompt(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function getCachedImage(hash: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('chaptr_image_cache')
      .select('image_url')
      .eq('prompt_hash', hash)
      .single()
    return data?.image_url ?? null
  } catch {
    return null
  }
}

async function cacheImage(hash: string, imageUrl: string, prompt: string): Promise<void> {
  try {
    await supabase.from('chaptr_image_cache').upsert({
      prompt_hash: hash,
      image_url: imageUrl,
      prompt_preview: prompt.slice(0, 200),
      created_at: new Date().toISOString(),
    })
  } catch {
    // Silent fail — caching is best-effort
  }
}

/** Generate a scene image using Together AI.
 *  Uses Kontext Pro (img2img, $0.20) only when the protagonist is visible in the
 *  scene AND a selfie reference exists. Otherwise uses Schnell ($0.04).
 *  Schnell results are cached by prompt hash to avoid regenerating identical scenes. */
export async function generateSceneImage(params: GenerateSceneParams): Promise<string | null> {
  const { prompt, width = 768, height = 576, referenceImageUrl, protagonistGender, includesProtagonist = true } = params

  const useKontext = !!referenceImageUrl && includesProtagonist

  // Replace generic "a young person" with gender-specific description
  const genderedPrompt = protagonistGender
    ? prompt.replace(/a young person/gi, protagonistGender === 'female' ? 'a young woman' : 'a young man')
    : prompt

  // Cache key: prompt + dimensions + gender (Schnell only — Kontext is personalized per selfie)
  const cacheKey = `${genderedPrompt}|${width}x${height}`
  if (!useKontext) {
    const hash = await hashPrompt(cacheKey)
    const cached = await getCachedImage(hash)
    if (cached) return cached
  }

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
    if (url) {
      // Cache Schnell results for future reuse
      if (!useKontext) {
        const hash = await hashPrompt(cacheKey)
        cacheImage(hash, url, genderedPrompt)
      }
      return url
    }
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
