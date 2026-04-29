import { rateLimit, rateLimitResponse, getClientIp } from './_rateLimit'

export const config = { runtime: 'edge' }

const MAX_LOGS_PER_MINUTE = 60

interface LogPayload {
  user_id: string
  error_code: string | null
  error_message: string
  error_details: string | null
  classification: 'transient' | 'permanent' | 'unknown'
  state_size: number
  user_agent: string | null
  timestamp: string
}

// Server-side telemetry: we use the service-role key here rather than the
// anon key so this insert can't be blocked by user-side RLS issues — which
// would defeat the entire point of failure logging. The sync_errors table
// itself should still have RLS enabled for SELECT (admin-only) — only this
// route inserts.
export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const ip = getClientIp(req)
  if (!rateLimit(`sync-error:${ip}`, MAX_LOGS_PER_MINUTE)) return rateLimitResponse()

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'service-role not configured' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  let body: LogPayload
  try {
    body = (await req.json()) as LogPayload
  } catch {
    return new Response(JSON.stringify({ error: 'bad payload' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  // Truncate strings defensively to keep the row size sane.
  const truncate = (s: string | null, n: number) => (s == null ? null : s.slice(0, n))

  try {
    const r = await fetch(`${supabaseUrl}/rest/v1/sync_errors`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        user_id: body.user_id,
        error_code: truncate(body.error_code, 50),
        error_message: truncate(body.error_message, 1000),
        error_details: truncate(body.error_details, 2000),
        classification: body.classification,
        state_size: body.state_size,
        user_agent: truncate(body.user_agent, 500),
        client_timestamp: body.timestamp,
      }),
    })
    if (!r.ok) {
      const t = await r.text().catch(() => '')
      console.error('[log-sync-error] supabase insert failed', r.status, t)
      // Return 200 anyway — telemetry failure must not cascade to user.
    }
  } catch (e) {
    console.error('[log-sync-error] threw', e)
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}
