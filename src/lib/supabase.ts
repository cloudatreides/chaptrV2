import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tbrnfiixertryutrijau.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_2k_s-b40Q8B2LgPMauCMjw_OggDPg04'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── Analytics ───

let sessionId: string | null = null

function getSessionId(): string {
  if (!sessionId) {
    sessionId = sessionStorage.getItem('chaptr_session') ?? crypto.randomUUID()
    sessionStorage.setItem('chaptr_session', sessionId)
  }
  return sessionId
}

export async function trackEvent(event: string, properties: Record<string, unknown> = {}) {
  try {
    await supabase.from('chaptr_events').insert({
      event,
      properties,
      session_id: getSessionId(),
    })
  } catch {
    // Silent fail — analytics should never break the app
  }
}

// ─── Playthroughs ───

export interface PlaythroughData {
  universe_id: string
  choices: { label: string; description: string }[]
  chat_summaries: string[]
  trust_score: number
  trust_label: string | null
  reveal_signature: string | null
  selfie_url: string | null
  bio: string | null
  love_interest?: 'jiwon' | 'yuna' | null
}

export async function savePlaythrough(data: PlaythroughData): Promise<string | null> {
  const { data: result, error } = await supabase
    .from('chaptr_playthroughs')
    .insert(data)
    .select('id')
    .single()

  if (error) {
    console.error('Failed to save playthrough:', error)
    return null
  }
  return result.id
}

export async function getPlaythrough(id: string): Promise<PlaythroughData & { id: string; created_at: string } | null> {
  const { data, error } = await supabase
    .from('chaptr_playthroughs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

// ─── Selfie Storage ───

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/** Persist an image URL to Supabase storage. Returns a durable URL or null —
 *  NEVER an ephemeral CDN URL. If Supabase upload fails but we already have
 *  the blob, falls back to a data: URL so the image still works (heavier in
 *  localStorage but zero broken-link risk). If even the fetch fails, returns
 *  null so callers can skip storing the result. */
export async function uploadImageToStorage(imageUrl: string, path: string): Promise<string | null> {
  try {
    // Already-durable URLs pass through unchanged.
    if (imageUrl.startsWith('data:') || imageUrl.includes('tbrnfiixertryutrijau.supabase.co')) {
      return imageUrl
    }
    const res = await fetch(imageUrl)
    if (!res.ok) {
      console.warn('[Image persist] source fetch failed:', res.status, imageUrl.slice(0, 80))
      return null
    }
    const blob = await res.blob()
    const { error } = await supabase.storage
      .from('chaptr-images')
      .upload(path, blob, { contentType: 'image/png', upsert: true })
    if (error) {
      console.warn('[Image persist] Supabase upload failed, falling back to data: URL:', error.message)
      try {
        return await blobToDataUrl(blob)
      } catch {
        return null
      }
    }
    const { data } = supabase.storage.from('chaptr-images').getPublicUrl(path)
    return data.publicUrl
  } catch (e) {
    console.warn('[Image persist] error:', e)
    return null
  }
}

/** Returns true if the URL is an ephemeral CDN URL that will expire (Together AI shrt URLs).
 *  Use to guard against persisting URLs that won't survive past ~1 hour. */
export function isEphemeralUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return url.includes('api.together.ai/shrt')
       || url.includes('api.together.xyz/shrt')
       || url.includes('together.ai/imgproxy')
}

/** Upload a styled selfie (data URL) to Supabase Storage and return a public URL.
 *  Used so FLUX.1 Kontext Pro receives a real URL instead of a base64 payload. */
export async function uploadSelfieToStorage(dataUrl: string, id: string): Promise<string | null> {
  try {
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    const path = `selfies/${id}.png`
    const { error } = await supabase.storage
      .from('profile-avatars')
      .upload(path, blob, { contentType: 'image/png', upsert: true })
    if (error) {
      console.error('Selfie upload failed:', error.message, error)
      return null
    }
    const { data } = supabase.storage.from('profile-avatars').getPublicUrl(path)
    return data.publicUrl
  } catch (e) {
    console.error('Selfie upload error:', e)
    return null
  }
}
