import { supabase } from './supabase'

export interface GenerateSceneParams {
  prompt: string
  width?: number
  height?: number
  referenceImageUrl?: string | null
  companionReferenceUrl?: string | null
  companionDescription?: string
  protagonistGender?: 'male' | 'female'
  includesProtagonist?: boolean
  moodContext?: string
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
async function refineCompanionFace(sceneUrl: string, companionRefUrl: string, companionDesc: string, width: number, height: number): Promise<string | null> {
  const startTime = performance.now()
  try {
    const response = await fetch('/api/together', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-kontext-pro',
        prompt: `The reference image shows a scene with two people. One of the people is the travel companion — change ONLY their appearance to look exactly like: ${companionDesc}. Keep the other person, the background, lighting, composition, and everything else completely unchanged. Only modify the companion's face and features.`,
        image_url: sceneUrl,
        width,
        height,
        steps: 20,
        n: 1,
        response_format: 'url',
      }),
    })
    if (!response.ok) {
      console.warn(`[Companion refine] error after ${((performance.now() - startTime) / 1000).toFixed(1)}s:`, response.status)
      return null
    }
    const data = await response.json()
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(1)
    const url = data.data?.[0]?.url
    if (url) {
      console.log(`[Companion refine] done in ${elapsed}s`)
      return url
    }
    const b64 = data.data?.[0]?.b64_json
    if (b64) return `data:image/png;base64,${b64}`
    return null
  } catch (e) {
    console.warn('[Companion refine] failed:', e)
    return null
  }
}

export async function generateSceneImage(params: GenerateSceneParams): Promise<string | null> {
  const { prompt, width = 768, height = 576, referenceImageUrl, companionReferenceUrl, companionDescription, protagonistGender, includesProtagonist = true, moodContext } = params

  const useKontext = !!referenceImageUrl && includesProtagonist

  // Replace generic "a young person" with gender-specific description
  let genderedPrompt = protagonistGender
    ? prompt.replace(/a young person/gi, protagonistGender === 'female' ? 'a young woman' : 'a young man')
    : prompt

  // Append mood context from choices/affinity to make scenes feel connected to story state
  if (moodContext) {
    genderedPrompt += `, ${moodContext}`
  }

  // Convert width/height to closest aspect ratio string for Schnell
  const toAspectRatio = (w: number, h: number): string => {
    const ratio = w / h
    if (ratio >= 1.7) return '16:9'
    if (ratio >= 1.4) return '3:2'
    if (ratio >= 1.2) return '4:3'
    if (ratio >= 0.9) return '1:1'
    if (ratio >= 0.7) return '3:4'
    if (ratio >= 0.6) return '2:3'
    return '9:16'
  }

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
        aspect_ratio: toAspectRatio(width, height),
        steps: 8,
        n: 1,
        response_format: 'url',
      }

  const startTime = performance.now()
  const model = useKontext ? 'Kontext Pro' : 'Schnell'

  try {
    const response = await fetch('/api/together', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.warn(`[Scene ${model}] error after ${((performance.now() - startTime) / 1000).toFixed(1)}s:`, response.status, errText)

      // Kontext failed (e.g. invalid reference image) — fall back to Schnell
      if (useKontext) {
        console.log('[Scene] Kontext failed, falling back to Schnell...')
        const schnellBody = {
          model: 'black-forest-labs/FLUX.1-schnell',
          prompt: genderedPrompt,
          aspect_ratio: toAspectRatio(width, height),
          steps: 8,
          n: 1,
          response_format: 'url',
        }
        const fallbackResp = await fetch('/api/together', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(schnellBody),
        })
        if (fallbackResp.ok) {
          const fallbackData = await fallbackResp.json()
          const elapsed = ((performance.now() - startTime) / 1000).toFixed(1)
          const fallbackUrl = fallbackData.data?.[0]?.url
          if (fallbackUrl) {
            console.log(`[Scene Schnell fallback] generated in ${elapsed}s`)
            const hash = await hashPrompt(cacheKey)
            cacheImage(hash, fallbackUrl, genderedPrompt)
            return fallbackUrl
          }
          const fb64 = fallbackData.data?.[0]?.b64_json
          if (fb64) {
            console.log(`[Scene Schnell fallback] generated (b64) in ${elapsed}s`)
            return `data:image/png;base64,${fb64}`
          }
        }
      }
      return null
    }

    const data = await response.json()
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(1)
    let resultUrl = data.data?.[0]?.url as string | null
    const b64 = data.data?.[0]?.b64_json as string | undefined
    if (!resultUrl && b64) {
      resultUrl = `data:image/png;base64,${b64}`
    }
    if (!resultUrl) {
      console.warn(`[Scene ${model}] no image data after ${elapsed}s`)
      return null
    }

    console.log(`[Scene ${model}] generated in ${elapsed}s`)
    if (!useKontext) {
      const hash = await hashPrompt(cacheKey)
      cacheImage(hash, resultUrl, genderedPrompt)
    }

    if (companionReferenceUrl && companionDescription && !resultUrl.startsWith('data:')) {
      const refined = await refineCompanionFace(resultUrl, companionReferenceUrl, companionDescription, width, height)
      if (refined) return refined
    }

    return resultUrl
  } catch (e) {
    console.error(`[Scene ${model}] failed after ${((performance.now() - startTime) / 1000).toFixed(1)}s:`, e)
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
        aspect_ratio: '1:1',
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
