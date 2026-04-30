import { supabase, uploadImageToStorage } from './supabase'
import { generateNanoBananaImage } from './nanoBanana'

export interface GenerateSceneParams {
  prompt: string
  width?: number
  height?: number
  referenceImageUrl?: string | null
  companionReferenceUrl?: string | null
  companionDescription?: string
  protagonistGender?: 'male' | 'female'
  companionGender?: 'male' | 'female' | 'non-binary' | 'unknown'
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

// User-scoped path prevents cross-user overwrites at the same content hash.
// Cross-user cache reuse still works via chaptr_image_cache (public bucket
// means anyone can read another user's URL once it's in the cache table).
async function getStoragePathPrefix(): Promise<string> {
  try {
    const { data } = await supabase.auth.getUser()
    return data.user ? `users/${data.user.id}/` : ''
  } catch {
    return ''
  }
}

export async function persistImage(
  imageUrl: string,
  promptKey: string,
  category: 'scenes' | 'portraits' | 'departures'
): Promise<string | null> {
  if (!imageUrl) return null
  const hash = await hashPrompt(promptKey)
  const prefix = await getStoragePathPrefix()
  const path = `${prefix}${category}/${hash}.png`
  return uploadImageToStorage(imageUrl, path)
}

const ANIME_STYLE_SUFFIX = '. Digital anime illustration, cel-shaded, clean linework, soft shading, expressive eyes, detailed hair, vibrant colors. NOT a photograph, NOT photorealistic, NOT 3D render, NOT western cartoon.'

function enforceAnimeStyle(prompt: string): string {
  const stripped = prompt.replace(/\.\s*$/, '')
  return stripped + ANIME_STYLE_SUFFIX
}


/** Normalize a reference image URL for the Nano Banana proxy. The proxy fetches
 *  remote URLs and inlines them as base64; data: URLs are passed through and
 *  decoded directly. Static portraits at paths like /yuna-portrait.png are
 *  resolved to absolute URLs so the Edge proxy can fetch them. */
function toNanoRefUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('data:')) return url
  if (typeof window !== 'undefined' && url.startsWith('/')) return `${window.location.origin}${url}`
  return undefined
}

export async function generateSceneImage(params: GenerateSceneParams): Promise<string | null> {
  const { prompt, companionDescription, protagonistGender, companionGender, includesProtagonist = true, moodContext } = params
  const referenceImageUrl = toNanoRefUrl(params.referenceImageUrl)
  const companionReferenceUrl = toNanoRefUrl(params.companionReferenceUrl)

  const hasProtagRef = !!referenceImageUrl && includesProtagonist
  const hasCompanionRef = !!companionReferenceUrl

  let genderedPrompt = protagonistGender
    ? prompt.replace(/a young person/gi, protagonistGender === 'female' ? 'a young woman' : 'a young man')
    : prompt
  if (moodContext) genderedPrompt += `, ${moodContext}`

  const cacheKey = `${genderedPrompt}|nano`
  const isPromptOnly = !hasProtagRef && !hasCompanionRef
  if (isPromptOnly) {
    const hash = await hashPrompt(cacheKey)
    const cached = await getCachedImage(hash)
    if (cached) return cached
  }

  const animePrompt = enforceAnimeStyle(genderedPrompt)
  const protagNoun = protagonistGender === 'female' ? 'young woman' : 'young man'
  const compNoun = companionGender === 'male' ? 'young man' : companionGender === 'female' ? 'young woman' : 'young person'
  const companionHint = companionDescription
    ? `. The travel companion's appearance: ${companionDescription.split(',').slice(0, 5).join(',')}`
    : ''

  let fullPrompt: string
  if (hasProtagRef && hasCompanionRef) {
    fullPrompt = `Anime-style illustration, cel-shaded, clean linework. Image 1 is the protagonist — a ${protagNoun}. Image 2 is the travel companion — a ${compNoun}${companionHint}. Render the protagonist as a ${protagNoun} matching image 1's gender, face, and hair. Render the companion as a ${compNoun} matching image 2's gender, face, and hair. Do not swap genders. Draw both in the same consistent anime art style — soft shading, expressive eyes, detailed hair. Scene: ${animePrompt}`
  } else if (hasProtagRef) {
    fullPrompt = `Anime-style illustration, cel-shaded. The reference image shows the protagonist, a ${protagNoun}. Redraw them in anime art style as a ${protagNoun}, keeping their face, features, and expression recognizable. Do not change their gender. Any other characters described in the scene are different people — generate them as new distinct anime characters. Scene: ${animePrompt}`
  } else if (hasCompanionRef) {
    fullPrompt = `Anime-style illustration, cel-shaded. The reference image shows the travel companion, a ${compNoun}${companionHint}. Render them matching the reference's appearance. Scene: ${animePrompt}`
  } else {
    fullPrompt = animePrompt
  }

  const refs: string[] = []
  if (hasProtagRef) refs.push(referenceImageUrl!)
  if (hasCompanionRef) refs.push(companionReferenceUrl!)

  const startTime = performance.now()
  const result = await generateNanoBananaImage({
    prompt: fullPrompt,
    referenceImageUrls: refs,
    model: 'gemini-2.5-flash-image',
  })
  const elapsed = ((performance.now() - startTime) / 1000).toFixed(1)

  if ('error' in result) {
    console.warn(`[Scene Nano Banana] error after ${elapsed}s:`, result.error)
    return null
  }
  console.log(`[Scene Nano Banana] generated in ${elapsed}s`)

  const persistKey = isPromptOnly ? cacheKey : `${cacheKey}|${refs.join('|')}`
  const persisted = await persistImage(result.imageDataUrl, persistKey, 'scenes')
  if (persisted && isPromptOnly) {
    const hash = await hashPrompt(cacheKey)
    cacheImage(hash, persisted, genderedPrompt)
  }
  return persisted ?? result.imageDataUrl
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
        response_format: 'b64_json',
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

/** Stylize a selfie into an anime-style portrait using Nano Banana
 *  (Gemini 2.5 Flash Image). Returns a durable data: URL (base64 PNG). */
export async function stylizeSelfie(selfieDataUrl: string): Promise<string | null> {
  const result = await generateNanoBananaImage({
    prompt: 'Transform this photo into an anime-style portrait illustration. Keep the exact same person, face, gender, facial features, glasses if present, hairstyle, and expression. Apply a clean anime art style with soft studio lighting, expressive eyes, and detailed hair. Clean simple background.',
    referenceImageUrls: [selfieDataUrl],
    model: 'gemini-2.5-flash-image',
  })
  if ('imageDataUrl' in result) return result.imageDataUrl
  console.error('Stylize selfie error:', result.error)
  return null
}
