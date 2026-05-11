import { verifyAuth, unauthorizedResponse } from './_auth'

export const config = { runtime: 'edge' }

// Hardcoded admin allow-list. Hit /api/admin-analytics from any other
// authenticated user → 403. Add new admins here only.
const ADMIN_EMAILS = new Set([
  'bosschuacapital@gmail.com',
  'nicholas@zentry.com',
])

interface AuthUserRow {
  id: string
  email?: string
  created_at: string
  last_sign_in_at: string | null
  user_metadata?: { full_name?: string; name?: string; avatar_url?: string }
}

interface EventRow {
  session_id: string
  event: string
  created_at: string
  properties: Record<string, unknown> | null
}

interface FeedbackRow {
  id: string
  user_id: string | null
  type: string
  message: string
  image_url: string | null
  page_url: string | null
  user_agent: string | null
  created_at: string
}

type ReturnStatus = 'never_signed_in' | 'one_session' | 'returned_next_day' | 'returned_later'

function classifyReturn(createdAt: string, lastSignIn: string | null): { status: ReturnStatus; daysBetween: number | null } {
  if (!lastSignIn) return { status: 'never_signed_in', daysBetween: null }
  const created = new Date(createdAt)
  const last = new Date(lastSignIn)
  // Use UTC date diff to avoid timezone-edge weirdness.
  const dayMs = 24 * 60 * 60 * 1000
  const createdDay = Math.floor(created.getTime() / dayMs)
  const lastDay = Math.floor(last.getTime() / dayMs)
  const daysBetween = lastDay - createdDay
  if (daysBetween <= 0) return { status: 'one_session', daysBetween }
  if (daysBetween === 1) return { status: 'returned_next_day', daysBetween }
  return { status: 'returned_later', daysBetween }
}

export default async function handler(req: Request) {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 })

  const user = await verifyAuth(req)
  if (!user) return unauthorizedResponse()
  if (!user.email || !ADMIN_EMAILS.has(user.email.toLowerCase())) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://tbrnfiixertryutrijau.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return new Response(JSON.stringify({ error: 'service-role not configured' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  // Auth users — admin endpoint, paginate if you blow past 200 someday.
  const usersRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?per_page=200`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  })
  if (!usersRes.ok) {
    const t = await usersRes.text().catch(() => '')
    return new Response(JSON.stringify({ error: 'users fetch failed', detail: t.slice(0, 200) }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    })
  }
  const usersData = (await usersRes.json()) as { users: AuthUserRow[] }

  // Events — last 30 days, capped. PostgREST default limit is 1000; ask for more.
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const eventsRes = await fetch(
    `${supabaseUrl}/rest/v1/chaptr_events?select=session_id,event,created_at,properties&created_at=gte.${since}&order=created_at.desc&limit=10000`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  )
  if (!eventsRes.ok) {
    const t = await eventsRes.text().catch(() => '')
    return new Response(JSON.stringify({ error: 'events fetch failed', detail: t.slice(0, 200) }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    })
  }
  const events = (await eventsRes.json()) as EventRow[]

  // Feedback (bug + feature submissions from FeedbackFab)
  const feedbackRes = await fetch(
    `${supabaseUrl}/rest/v1/feedback?select=id,user_id,type,message,image_url,page_url,user_agent,created_at&order=created_at.desc&limit=200`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  )
  const feedback: FeedbackRow[] = feedbackRes.ok ? ((await feedbackRes.json()) as FeedbackRow[]) : []

  // ── Sessions: aggregate first/last/count + device per session_id
  const sessions = new Map<string, { first: number; last: number; count: number; device: string | null }>()
  for (const e of events) {
    const t = new Date(e.created_at).getTime()
    const device = (e.properties && typeof e.properties === 'object' && typeof (e.properties as Record<string, unknown>).device === 'string')
      ? ((e.properties as Record<string, unknown>).device as string)
      : null
    const s = sessions.get(e.session_id)
    if (s) {
      if (t < s.first) s.first = t
      if (t > s.last) s.last = t
      s.count++
      // Prefer a non-null device tag if we have one; older events have none.
      if (!s.device && device) s.device = device
    } else {
      sessions.set(e.session_id, { first: t, last: t, count: 1, device })
    }
  }

  // Device split — count unique sessions per device. Sessions from before
  // device tagging shipped land in 'unknown'.
  const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0, unknown: 0 }
  for (const s of sessions.values()) {
    const key = s.device ?? 'unknown'
    deviceCounts[key] = (deviceCounts[key] || 0) + 1
  }

  // Multi-event sessions only — single-event sessions have 0 duration and
  // skew the average. We still report total session count separately.
  const multiEventDurations: number[] = []
  let singleEventSessions = 0
  for (const s of sessions.values()) {
    if (s.count > 1) multiEventDurations.push(Math.round((s.last - s.first) / 1000))
    else singleEventSessions++
  }
  multiEventDurations.sort((a, b) => a - b)

  function pct(p: number): number {
    if (multiEventDurations.length === 0) return 0
    const idx = Math.min(multiEventDurations.length - 1, Math.floor(multiEventDurations.length * p))
    return multiEventDurations[idx]
  }

  const buckets: Record<string, number> = {
    '0-30s (bounce)': 0,
    '30s-2m': 0,
    '2-5m': 0,
    '5-10m': 0,
    '10m+': 0,
  }
  for (const seconds of multiEventDurations) {
    if (seconds < 30) buckets['0-30s (bounce)']++
    else if (seconds < 120) buckets['30s-2m']++
    else if (seconds < 300) buckets['2-5m']++
    else if (seconds < 600) buckets['5-10m']++
    else buckets['10m+']++
  }

  const avgSeconds =
    multiEventDurations.length === 0
      ? 0
      : Math.round(multiEventDurations.reduce((acc, s) => acc + s, 0) / multiEventDurations.length)

  // ── Daily session counts (last 14 days)
  const dailyMap = new Map<string, Set<string>>()
  for (const e of events) {
    const day = e.created_at.slice(0, 10)
    if (!dailyMap.has(day)) dailyMap.set(day, new Set())
    dailyMap.get(day)!.add(e.session_id)
  }
  const dailySessions = [...dailyMap.entries()]
    .map(([day, set]) => ({ day, sessions: set.size }))
    .sort((a, b) => (a.day < b.day ? 1 : -1))
    .slice(0, 14)

  // ── Event counts
  const eventCounts: Record<string, number> = {}
  for (const e of events) {
    eventCounts[e.event] = (eventCounts[e.event] || 0) + 1
  }
  const topEvents = Object.entries(eventCounts)
    .map(([event, count]) => ({ event, count }))
    .sort((a, b) => b.count - a.count)

  // ── Users with relogin classification
  const enrichedUsers = usersData.users
    .map((u) => {
      const { status, daysBetween } = classifyReturn(u.created_at, u.last_sign_in_at)
      return {
        id: u.id,
        email: u.email ?? null,
        name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? null,
        avatar: u.user_metadata?.avatar_url ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        days_between: daysBetween,
        return_status: status,
      }
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const userSummary = {
    total: enrichedUsers.length,
    returned_next_day: enrichedUsers.filter((u) => u.return_status === 'returned_next_day').length,
    returned_later: enrichedUsers.filter((u) => u.return_status === 'returned_later').length,
    one_session: enrichedUsers.filter((u) => u.return_status === 'one_session').length,
    never_signed_in: enrichedUsers.filter((u) => u.return_status === 'never_signed_in').length,
  }

  return new Response(
    JSON.stringify({
      generated_at: new Date().toISOString(),
      window_days: 30,
      users: enrichedUsers,
      user_summary: userSummary,
      sessions: {
        total: sessions.size,
        multi_event: multiEventDurations.length,
        single_event: singleEventSessions,
        avg_seconds: avgSeconds,
        median_seconds: pct(0.5),
        p90_seconds: pct(0.9),
        max_seconds: multiEventDurations[multiEventDurations.length - 1] ?? 0,
        duration_buckets: buckets,
      },
      devices: deviceCounts,
      daily_sessions: dailySessions,
      top_events: topEvents,
      events_total: events.length,
      feedback: feedback.map((f) => {
        // Match feedback user_id to enriched user info so we can show name/email.
        const u = enrichedUsers.find((eu) => eu.id === f.user_id)
        return {
          id: f.id,
          type: f.type,
          message: f.message,
          image_url: f.image_url,
          page_url: f.page_url,
          created_at: f.created_at,
          user_email: u?.email ?? null,
          user_name: u?.name ?? null,
        }
      }),
    }),
    { headers: { 'content-type': 'application/json' } }
  )
}
