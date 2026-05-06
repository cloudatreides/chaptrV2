import { supabase } from './supabase'

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string | null> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 30_000) return cachedToken.token
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    cachedToken = null
    return null
  }
  const expiresAt = session.expires_at ? session.expires_at * 1000 : now + 60_000
  cachedToken = { token: session.access_token, expiresAt }
  return session.access_token
}

export async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function authedFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  const auth = await authHeaders()
  for (const [k, v] of Object.entries(auth)) headers.set(k, v)
  return fetch(input, { ...init, headers })
}
