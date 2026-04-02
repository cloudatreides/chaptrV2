import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://iohaulmowogajkgezoms.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvaGF1bG1vd29nYWprZ2V6b21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDUwNDMsImV4cCI6MjA4OTIyMTA0M30.Z9w1NPBCz9XaelPBaxufsUu1KpyGwAmmYfmaKVsM4l0'

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
