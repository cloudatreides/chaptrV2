// Server-side Supabase token verification for Edge proxy endpoints.
// Mirrors the public anon URL+key from src/lib/supabase.ts so no new
// env vars are required (the anon key is already shipped in the bundle).

const SUPABASE_URL = 'https://tbrnfiixertryutrijau.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_2k_s-b40Q8B2LgPMauCMjw_OggDPg04'

export interface AuthUser {
  id: string
  email?: string
}

export async function verifyAuth(req: Request): Promise<AuthUser | null> {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7).trim()
  if (!token) return null
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
      },
    })
    if (!r.ok) return null
    const user = await r.json()
    return user?.id ? { id: user.id, email: user.email } : null
  } catch {
    return null
  }
}

export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  })
}
