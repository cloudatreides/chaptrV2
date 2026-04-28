import { supabase, uploadImageToStorage } from './supabase'

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

async function persistImage(imageUrl: string, promptKey: string, category: 'scenes' | 'portraits'): Promise<string> {
  if (!imageUrl || imageUrl.startsWith('data:')) return imageUrl
  const hash = await hashPrompt(promptKey)
  const path = `${category}/${hash}.png`
  return uploadImageToStorage(imageUrl, path)
}

const ANIME_STYLE_SUFFIX = '. Digital anime illustration, cel-shaded, clean linework, soft shading, expressive eyes, detailed hair, vibrant colors. NOT a photograph, NOT photorealistic, NOT 3D render, NOT western cartoon.'

function enforceAnimeStyle(prompt: string): string {
  const stripped = prompt.replace(/\.\s*$/, '')
  return stripped + ANIME_STYLE_SUFFIX
}


export async function generateSceneImage(params: GenerateSceneParams): Promise<string | null> {
  const { prompt, width = 768, height = 576, referenceImageUrl, companionReferenceUrl, companionDescription, protagonistGender, includesProtagonist = true, moodContext } = params

  // Tier selection: both refs → FLUX.2 Pro, single ref → Kontext Pro, none → Schnell
  const useFlux2 = !!referenceImageUrl && !!companionReferenceUrl && includesProtagonist
  const useKontext = !useFlux2 && !!referenceImageUrl && includesProtagonist

  let genderedPrompt = protagonistGender
    ? prompt.replace(/a young person/gi, protagonistGender === 'female' ? 'a young woman' : 'a young man')
    : prompt

  if (moodContext) {
    genderedPrompt += `, ${moodContext}`
  }

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

  const cacheKey = `${genderedPrompt}|${width}x${height}`
  if (!useKontext && !useFlux2) {
    const hash = await hashPrompt(cacheKey)
    const cached = await getCachedImage(hash)
    if (cached) return cached
  }

  const animePrompt = enforceAnimeStyle(genderedPrompt)

  let body: Record<string, unknown>
  let model: string

  const companionHint = companionDescription
    ? `. The travel companion's appearance: ${companionDescription.split(',').slice(0, 5).join(',')}`
    : ''

  if (useFlux2) {
    model = 'FLUX.2 Pro'
    body = {
      model: 'black-forest-labs/FLUX.2-pro',
      prompt: `Anime-style illustration, cel-shaded, clean linework. The person from image 1 is the protagonist (a ${protagonistGender === 'female' ? 'young woman' : 'young man'}). The character from image 2 is their travel companion${companionHint}. Draw both characters in the SAME consistent anime art style — soft shading, expressive eyes, detailed hair. Keep their faces, hairstyles, and features recognizable from the reference images. Both characters must look like they belong in the same illustration. Scene: ${animePrompt}`,
      reference_images: [referenceImageUrl, companionReferenceUrl],
      width,
      height,
      steps: 25,
      n: 1,
    }
  } else if (useKontext) {
    model = 'Kontext Pro'
    body = {
      model: 'black-forest-labs/FLUX.1-kontext-pro',
      prompt: `Transform this photo into an anime-style illustration with cel-shading, clean linework, and expressive eyes. The reference image shows the protagonist, a ${protagonistGender === 'female' ? 'young woman' : 'young man'}. Redraw them in anime art style and place them into the following scene, keeping their face shape, features, and expression recognizable but rendered as anime. IMPORTANT: Any other characters described in the scene are DIFFERENT people — generate them as new distinct anime characters, do NOT use the reference face for them. Scene: ${animePrompt}`,
      image_url: referenceImageUrl,
      width,
      height,
      steps: 25,
      n: 1,
      response_format: 'url',
    }
  } else {
    model = 'Schnell'
    body = {
      model: 'black-forest-labs/FLUX.1-schnell',
      prompt: animePrompt,
      aspect_ratio: toAspectRatio(width, height),
      steps: 8,
      n: 1,
      response_format: 'url',
    }
  }

  const startTime = performance.now()

  try {
    const response = await fetch('/api/together', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.warn(`[Scene ${model}] error after ${((performance.now() - startTime) / 1000).toFixed(1)}s:`, response.status, errText)

      // FLUX.2 or Kontext failed — fall back to Schnell
      if (useFlux2 || useKontext) {
        console.log(`[Scene] ${model} failed, falling back to Schnell...`)
        const fallbackPrompt = enforceAnimeStyle(genderedPrompt)
        const schnellBody = {
          model: 'black-forest-labs/FLUX.1-schnell',
          prompt: fallbackPrompt,
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
            const persisted = await persistImage(fallbackUrl, cacheKey, 'scenes')
            const hash = await hashPrompt(cacheKey)
            cacheImage(hash, persisted, genderedPrompt)
            return persisted
          }
          const fb64 = fallbackData.data?.[0]?.b64_json
          if (fb64) return `data:image/png;base64,${fb64}`
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

    const persistKey = (useFlux2 || useKontext) ? `${cacheKey}|${referenceImageUrl}` : cacheKey
    const persisted = await persistImage(resultUrl, persistKey, 'scenes')
    if (!useFlux2 && !useKontext) {
      const hash = await hashPrompt(cacheKey)
      cacheImage(hash, persisted, genderedPrompt)
    }

    return persisted
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
    if (url) return persistImage(url, prompt, 'portraits')
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
