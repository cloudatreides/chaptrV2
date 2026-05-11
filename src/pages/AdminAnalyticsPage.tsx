import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Loader2, AlertTriangle, RefreshCcw } from 'lucide-react'
import { supabase } from '../lib/supabase'

const SG = "'Space Grotesk', sans-serif"

type ReturnStatus = 'never_signed_in' | 'one_session' | 'returned_next_day' | 'returned_later'

interface AnalyticsUser {
  id: string
  email: string | null
  name: string | null
  avatar: string | null
  created_at: string
  last_sign_in_at: string | null
  days_between: number | null
  return_status: ReturnStatus
}

interface AnalyticsPayload {
  generated_at: string
  window_days: number
  users: AnalyticsUser[]
  user_summary: {
    total: number
    returned_next_day: number
    returned_later: number
    one_session: number
    never_signed_in: number
  }
  sessions: {
    total: number
    multi_event: number
    avg_seconds: number
    median_seconds: number
    p90_seconds: number
    max_seconds: number
    duration_buckets: Record<string, number>
  }
  daily_sessions: { day: string; sessions: number }[]
  top_events: { event: string; count: number }[]
  events_total: number
}

function formatDuration(s: number): string {
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  if (m < 60) return rem === 0 ? `${m}m` : `${m}m ${rem}s`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return rm === 0 ? `${h}h` : `${h}h ${rm}m`
}

function formatRelative(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return d.toLocaleDateString()
}

function formatExact(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const RETURN_BADGES: Record<ReturnStatus, { label: string; bg: string; border: string; color: string }> = {
  never_signed_in: { label: 'Never signed in', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.3)', color: '#fca5a5' },
  one_session: { label: 'One day only', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.3)', color: '#fcd34d' },
  returned_next_day: { label: 'Returned next day', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.3)', color: '#6ee7b7' },
  returned_later: { label: 'Returned later', bg: 'rgba(96,165,250,0.10)', border: 'rgba(96,165,250,0.3)', color: '#93c5fd' },
}

export function AdminAnalyticsPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<AnalyticsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    setError(null)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('Not signed in.')
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/admin-analytics', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.status === 403) {
        setError("You're signed in, but this account isn't an admin. Sign in with the admin email.")
        return
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        setError(`Failed to load (${res.status}): ${txt.slice(0, 200)}`)
        return
      }
      const json = (await res.json()) as AnalyticsPayload
      setData(json)
    } catch (e) {
      setError(`Network error: ${String(e)}`)
    }
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  return (
    <div className="min-h-screen min-h-dvh" style={{ background: '#0a0810', fontFamily: SG }}>
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 py-6">
        <button
          onClick={() => navigate('/home')}
          className="cursor-pointer flex items-center gap-1 text-white/40 text-sm mb-6 hover:text-white/70"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-white text-3xl font-bold mb-1">Analytics</h1>
            <p className="text-white/40 text-sm">
              Signups, return cadence, and time-on-platform. Last 30 days of events.
            </p>
            {data && (
              <p className="text-white/30 text-xs mt-1">
                Generated {formatRelative(data.generated_at)} · {data.events_total.toLocaleString()} events
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', color: '#c4b5fd' }}
          >
            {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
            Refresh
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-white/50 text-sm py-12">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        )}

        {error && (
          <div
            className="mb-6 p-4 rounded-xl flex gap-3 items-start"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <AlertTriangle size={18} className="text-red-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-200 text-sm font-semibold mb-0.5">Couldn't load analytics</p>
              <p className="text-red-200/70 text-xs">{error}</p>
            </div>
          </div>
        )}

        {data && (
          <>
            {/* Top-line user funnel */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              <StatCard label="Total users" value={data.user_summary.total.toString()} accent="#c4b5fd" />
              <StatCard label="Returned next day" value={data.user_summary.returned_next_day.toString()} accent="#6ee7b7" />
              <StatCard label="Returned later" value={data.user_summary.returned_later.toString()} accent="#93c5fd" />
              <StatCard label="One day only" value={data.user_summary.one_session.toString()} accent="#fcd34d" />
              <StatCard label="Never signed in" value={data.user_summary.never_signed_in.toString()} accent="#fca5a5" />
            </div>

            {/* Users table */}
            <Section title="Users" subtitle={`${data.users.length} total · sorted by signup`}>
              <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #1e1830' }}>
                <table className="w-full text-sm" style={{ minWidth: 720 }}>
                  <thead>
                    <tr style={{ background: '#13101e', color: 'rgba(255,255,255,0.4)' }} className="text-left text-[11px] uppercase tracking-wider">
                      <th className="px-4 py-3 font-semibold">User</th>
                      <th className="px-4 py-3 font-semibold">Signed up</th>
                      <th className="px-4 py-3 font-semibold">Last login</th>
                      <th className="px-4 py-3 font-semibold">Gap</th>
                      <th className="px-4 py-3 font-semibold">Return</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((u) => {
                      const badge = RETURN_BADGES[u.return_status]
                      return (
                        <tr key={u.id} className="border-t" style={{ borderColor: '#1e1830' }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 min-w-0">
                              {u.avatar ? (
                                <img src={u.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: '#2a2040', color: '#c4b5fd' }}>
                                  {(u.name ?? u.email ?? '?').slice(0, 1).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-white text-sm truncate">{u.name ?? '—'}</p>
                                <p className="text-white/40 text-xs truncate">{u.email ?? '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-white/70">
                            <div className="flex flex-col">
                              <span>{formatExact(u.created_at)}</span>
                              <span className="text-white/30 text-xs">{formatRelative(u.created_at)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-white/70">
                            <div className="flex flex-col">
                              <span>{formatExact(u.last_sign_in_at)}</span>
                              <span className="text-white/30 text-xs">{formatRelative(u.last_sign_in_at)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-white/60">
                            {u.days_between === null
                              ? '—'
                              : u.days_between === 0
                              ? 'same day'
                              : `${u.days_between}d`}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-block px-2 py-1 rounded-md text-[11px] font-semibold"
                              style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color }}
                            >
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-white/30 text-xs mt-3">
                Note: <span className="font-mono">last_sign_in_at</span> only stores the most recent login.
                "Returned later" means they came back at least once on a different day, not necessarily that they're active now.
              </p>
            </Section>

            {/* Session duration */}
            <Section title="Time on platform" subtitle={`${data.sessions.total} sessions · ${data.sessions.multi_event} with >1 event`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <StatCard label="Avg session" value={formatDuration(data.sessions.avg_seconds)} accent="#c4b5fd" />
                <StatCard label="Median" value={formatDuration(data.sessions.median_seconds)} accent="#6ee7b7" />
                <StatCard label="p90" value={formatDuration(data.sessions.p90_seconds)} accent="#93c5fd" />
                <StatCard label="Longest" value={formatDuration(data.sessions.max_seconds)} accent="#fcd34d" />
              </div>

              <div className="rounded-xl p-4" style={{ background: '#13101e', border: '1px solid #1e1830' }}>
                <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-3">Duration distribution</p>
                <BucketBars buckets={data.sessions.duration_buckets} />
              </div>

              <p className="text-white/30 text-xs mt-3">
                Sessions are anonymous (keyed by <span className="font-mono">session_id</span>, not user). Wire <span className="font-mono">user_id</span> into <span className="font-mono">trackEvent</span> properties to link sessions to users.
              </p>
            </Section>

            {/* Daily sessions */}
            <Section title="Daily sessions" subtitle="Last 14 days">
              <div className="rounded-xl p-4" style={{ background: '#13101e', border: '1px solid #1e1830' }}>
                <DailyBars days={data.daily_sessions} />
              </div>
            </Section>

            {/* Event counts */}
            <Section title="Top events" subtitle={`${data.top_events.length} unique event names`}>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1e1830' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#13101e', color: 'rgba(255,255,255,0.4)' }} className="text-left text-[11px] uppercase tracking-wider">
                      <th className="px-4 py-3 font-semibold">Event</th>
                      <th className="px-4 py-3 font-semibold text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_events.map((e) => (
                      <tr key={e.event} className="border-t" style={{ borderColor: '#1e1830' }}>
                        <td className="px-4 py-3 text-white/80 font-mono text-[13px]">{e.event}</td>
                        <td className="px-4 py-3 text-white/60 text-right tabular-nums">{e.count.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="mb-3">
        <h2 className="text-white text-lg font-bold">{title}</h2>
        {subtitle && <p className="text-white/40 text-xs">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: '#13101e', border: '1px solid #1e1830' }}>
      <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-1">{label}</p>
      <p className="text-3xl font-bold tabular-nums" style={{ color: accent }}>{value}</p>
    </div>
  )
}

function BucketBars({ buckets }: { buckets: Record<string, number> }) {
  const max = Math.max(1, ...Object.values(buckets))
  return (
    <div className="flex flex-col gap-2">
      {Object.entries(buckets).map(([label, count]) => (
        <div key={label} className="flex items-center gap-3">
          <div className="w-28 text-white/60 text-xs shrink-0">{label}</div>
          <div className="flex-1 h-6 rounded-md relative overflow-hidden" style={{ background: '#1a1530' }}>
            <div
              className="absolute inset-y-0 left-0 rounded-md"
              style={{ width: `${(count / max) * 100}%`, background: 'linear-gradient(90deg, #c84b9e 0%, #a78bfa 100%)' }}
            />
          </div>
          <div className="w-12 text-right text-white/80 text-sm tabular-nums">{count}</div>
        </div>
      ))}
    </div>
  )
}

function DailyBars({ days }: { days: { day: string; sessions: number }[] }) {
  if (days.length === 0) return <p className="text-white/40 text-sm">No sessions in the last 14 days.</p>
  const max = Math.max(1, ...days.map((d) => d.sessions))
  const ordered = [...days].sort((a, b) => (a.day < b.day ? -1 : 1))
  return (
    <div className="flex items-end gap-2 h-32">
      {ordered.map((d) => {
        const h = (d.sessions / max) * 100
        const label = new Date(d.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div className="text-white/70 text-[10px] tabular-nums">{d.sessions}</div>
            <div
              className="w-full rounded-t-md min-h-[2px]"
              style={{ height: `${h}%`, background: 'linear-gradient(180deg, #c84b9e 0%, #7c3aed 100%)' }}
            />
            <div className="text-white/30 text-[10px] truncate w-full text-center">{label}</div>
          </div>
        )
      })}
    </div>
  )
}
