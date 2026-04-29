import { useEffect, useState } from 'react'
import { CheckCircle2, AlertTriangle, Loader2, Cloud } from 'lucide-react'
import { subscribeSync, getSyncState } from '../lib/gameStateSync'
import type { SyncStatus } from '../lib/gameStateSync'

const SG = "'Space Grotesk', sans-serif"

/** Tiny sync-status pill. Surfaces save failures (otherwise silent) so users
 *  notice when their state isn't actually persisting to Supabase. */
export function SyncIndicator() {
  const [state, setState] = useState(getSyncState())
  const [expanded, setExpanded] = useState(false)

  useEffect(() => subscribeSync(setState), [])

  // Hide entirely when there's nothing to report (idle and never saved)
  if (state.status === 'idle' && !state.lastSavedAt) return null

  const config: Record<SyncStatus, { icon: typeof Cloud; color: string; label: string }> = {
    idle: { icon: Cloud, color: 'rgba(255,255,255,0.3)', label: 'Idle' },
    saving: { icon: Loader2, color: '#A78BFA', label: 'Saving...' },
    saved: { icon: CheckCircle2, color: 'rgba(110,231,183,0.7)', label: 'Saved' },
    error: { icon: AlertTriangle, color: '#ef4444', label: 'Save failed' },
  }
  const c = config[state.status]
  const Icon = c.icon

  return (
    <div
      onClick={() => state.status === 'error' && setExpanded((v) => !v)}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${state.status === 'error' ? 'cursor-pointer' : ''}`}
      style={{
        background: state.status === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${state.status === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'}`,
        color: c.color,
        fontFamily: SG,
      }}
      title={state.status === 'error' ? state.lastError : undefined}
    >
      <Icon size={11} className={state.status === 'saving' ? 'animate-spin' : ''} />
      <span>{c.label}</span>
      {expanded && state.lastError && (
        <div
          className="absolute top-full right-0 mt-2 p-3 rounded-lg max-w-[320px] text-[11px] leading-relaxed font-mono"
          style={{ background: '#1A1726', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', zIndex: 100 }}
        >
          {state.lastError}
        </div>
      )}
    </div>
  )
}
