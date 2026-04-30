import { supabase } from './supabase'

// ─── Per-User Game State Sync ───
// Syncs the Zustand store to Supabase so state survives logout/login.
// Table: user_game_state (user_id UUID PK, state JSONB, updated_at TIMESTAMPTZ)

const TABLE = 'user_game_state'

// Per-browser bookkeeping: when *this* browser last successfully saved to
// the cloud. hydrateFromCloud compares this against the cloud row's
// updated_at — if cloud is meaningfully newer than our last save, another
// browser/device has touched the data and we should pull cloud state in.
const LAST_LOCAL_SAVE_KEY = 'chaptr-v2-last-local-save'

export function getLastLocalSaveTimestamp(): number {
  try {
    const v = localStorage.getItem(LAST_LOCAL_SAVE_KEY)
    return v ? parseInt(v, 10) : 0
  } catch {
    return 0
  }
}

function recordLocalSave(ts: number) {
  try { localStorage.setItem(LAST_LOCAL_SAVE_KEY, String(ts)) } catch { /* ignore */ }
}

// Tracks the most recent save outcome so the UI can show a sync indicator.
// Subscribers are notified on change.
export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error'
interface SyncState {
  status: SyncStatus
  lastError?: string
  lastSavedAt?: number
}
let _syncState: SyncState = { status: 'idle' }
const _syncSubs = new Set<(s: SyncState) => void>()
function setSync(next: SyncState) {
  _syncState = next
  _syncSubs.forEach((s) => s(next))
}
export function getSyncState(): SyncState { return _syncState }
export function subscribeSync(fn: (s: SyncState) => void): () => void {
  _syncSubs.add(fn)
  fn(_syncState)
  return () => _syncSubs.delete(fn)
}

// Circuit breaker — after N consecutive failures, stop attempting saves for a
// cool-off period. Prevents the positive feedback loop we saw when the
// Supabase Postgres instance hung: every user interaction queued another
// doomed save, and 433+ requests/minute from one browser piled connection
// pressure on an already-dying DB, slowing recovery further. While the
// circuit is open, queueSave() still updates pendingState but skips network
// calls. The first attempt after the cooldown probes whether the backend
// recovered; on success the circuit resets, on failure it re-opens.
let consecutiveFailures = 0
let circuitOpenUntil = 0
const CIRCUIT_THRESHOLD = 3
const CIRCUIT_COOLDOWN_MS = 60_000

function isCircuitOpen(): boolean {
  return Date.now() < circuitOpenUntil
}

function trackFailure(): void {
  consecutiveFailures += 1
  if (consecutiveFailures >= CIRCUIT_THRESHOLD && !isCircuitOpen()) {
    circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS
    console.warn(`[GameStateSync] circuit opened — pausing saves for ${CIRCUIT_COOLDOWN_MS / 1000}s after ${consecutiveFailures} consecutive failures`)
  }
}

function trackSuccess(): void {
  if (consecutiveFailures > 0 || circuitOpenUntil > 0) {
    console.info('[GameStateSync] circuit reset — backend recovered')
  }
  consecutiveFailures = 0
  circuitOpenUntil = 0
}

// Telemetry: ship every failure to /api/log-sync-error so we can see patterns
// across users without relying on each user opening dev tools. Skipped while
// the circuit is open — that endpoint is usually backed by the same Supabase
// project so it's failing for the same reason; retrying just adds noise.
async function logSyncError(userId: string, payloadSize: number, error: { code?: string; message: string; details?: string; hint?: string; classification: 'transient' | 'permanent' | 'unknown' }): Promise<void> {
  if (isCircuitOpen()) return
  try {
    await fetch('/api/log-sync-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        error_code: error.code ?? null,
        error_message: error.message,
        error_details: [error.details, error.hint].filter(Boolean).join(' | ') || null,
        classification: error.classification,
        state_size: payloadSize,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch {
    // Telemetry failure is silent — don't recurse forever, don't disturb the user.
  }
}

// Classify Supabase errors to decide whether retrying is worth it.
function classifyError(code: string | undefined, message: string): 'transient' | 'permanent' | 'unknown' {
  // RLS denial, missing column, value-too-long, etc — retrying won't help.
  if (code === '42501' || code === '42703' || code === '22001' || code === '23505') return 'permanent'
  if (/row.level security|permission denied|policy/i.test(message)) return 'permanent'
  if (/value too long|payload too large|413/i.test(message)) return 'permanent'
  // Auth, network, timeouts — usually self-heal on retry.
  if (code === 'PGRST301' || code === '503' || code === '500') return 'transient'
  if (/network|timeout|fetch|aborted|503|502|504/i.test(message)) return 'transient'
  if (/jwt|expired|unauthor/i.test(message)) return 'transient'
  return 'unknown'
}

/** Save the full partialize state to Supabase for the current user */
export async function saveGameState(userId: string, state: Record<string, unknown>): Promise<boolean> {
  setSync({ status: 'saving' })
  const payloadSize = JSON.stringify(state).length
  try {
    const { error } = await supabase
      .from(TABLE)
      .upsert({
        user_id: userId,
        state,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (error) {
      const msg = `${error.code ?? ''} ${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`.trim()
      const classification = classifyError(error.code, error.message)
      console.error('[GameStateSync] save failed:', { ...error, classification, payloadSize })
      setSync({ status: 'error', lastError: msg || 'Unknown Supabase error' })
      trackFailure()
      logSyncError(userId, payloadSize, { code: error.code, message: error.message, details: error.details, hint: error.hint, classification })
      return false
    }
    const savedAt = Date.now()
    recordLocalSave(savedAt)
    setSync({ status: 'saved', lastSavedAt: savedAt })
    trackSuccess()
    return true
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[GameStateSync] save threw:', e)
    const classification = classifyError(undefined, msg)
    setSync({ status: 'error', lastError: msg })
    trackFailure()
    logSyncError(userId, payloadSize, { message: msg, classification })
    return false
  }
}

/** Load game state from Supabase for a given user, including the row's
 *  updated_at timestamp so callers can compare freshness against local. */
export async function loadGameState(userId: string): Promise<{ state: Record<string, unknown>; updatedAt: number } | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('state, updated_at')
      .eq('user_id', userId)
      .single()

    if (error || !data) return null
    const updatedAt = data.updated_at ? new Date(data.updated_at).getTime() : 0
    return { state: data.state as Record<string, unknown>, updatedAt }
  } catch (e) {
    console.error('Game state load error:', e)
    return null
  }
}

// ─── Debounced auto-save ───

let saveTimer: ReturnType<typeof setTimeout> | null = null
let pendingUserId: string | null = null
let pendingState: Record<string, unknown> | null = null

// 1.5s debounce. The old 5s window was a frequent footgun: if the user
// refreshed, navigated, or closed the tab within 5 seconds of creating a
// twin, the save never fired and the twin was lost on next hydrate. 1.5s is
// short enough that most realistic flows survive it, long enough to batch
// rapid changes (eg name+gender+bio edits in quick succession).
const DEBOUNCE_MS = 1500

// Exponential backoff for retries on transient failures.
// Total reach: 2 + 5 + 15 + 60 = ~82 seconds before giving up.
const RETRY_DELAYS_MS = [2_000, 5_000, 15_000, 60_000]
let retryAttempt = 0
let retryTimer: ReturnType<typeof setTimeout> | null = null

function scheduleRetry() {
  if (retryAttempt >= RETRY_DELAYS_MS.length) {
    console.warn('[GameStateSync] giving up after', RETRY_DELAYS_MS.length, 'retries')
    retryAttempt = 0
    return
  }
  // If circuit opened mid-retry-chain, schedule the retry to fire AFTER the
  // cooldown window so we don't keep hammering. The cooldown probe handles
  // the recovery test.
  const baseDelay = RETRY_DELAYS_MS[retryAttempt]
  const circuitWaitMs = isCircuitOpen() ? Math.max(0, circuitOpenUntil - Date.now()) : 0
  const delay = Math.max(baseDelay, circuitWaitMs)
  retryAttempt += 1
  if (retryTimer) clearTimeout(retryTimer)
  retryTimer = setTimeout(async () => {
    if (!pendingUserId || !pendingState) return
    const ok = await saveGameState(pendingUserId, pendingState)
    if (ok) {
      retryAttempt = 0
      retryTimer = null
      // Don't clear pending — the next queueSave call will replace with fresh state.
    } else {
      scheduleRetry()
    }
  }, delay)
}

/** Queue a debounced save */
export function queueSave(userId: string, state: Record<string, unknown>) {
  pendingUserId = userId
  pendingState = state
  // Cancel any in-flight retry — the new state supersedes whatever we were
  // going to retry. Reset the attempt counter so the new save gets a fresh
  // budget if it also fails.
  if (retryTimer) {
    clearTimeout(retryTimer)
    retryTimer = null
    retryAttempt = 0
  }
  if (saveTimer) clearTimeout(saveTimer)
  // If circuit is open, defer the save until the cooldown ends. Pending
  // state is still kept up to date — the recovery probe will pick it up.
  // Without this, every user interaction during a Supabase outage queued
  // another doomed retry chain (debounce 1.5s + 4 retries × backoff), which
  // is what created the retry storm we observed.
  const debounce = isCircuitOpen()
    ? Math.max(DEBOUNCE_MS, circuitOpenUntil - Date.now() + 100)
    : DEBOUNCE_MS
  saveTimer = setTimeout(async () => {
    saveTimer = null
    if (pendingUserId && pendingState) {
      const ok = await saveGameState(pendingUserId, pendingState)
      if (!ok) scheduleRetry()
    }
  }, debounce)
}

/** Flush any pending save immediately. Call before sign-out OR before
 *  navigation/refresh-prone moments (eg right after createCharacter). */
export async function flushPendingSave(): Promise<void> {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  if (pendingUserId && pendingState) {
    await saveGameState(pendingUserId, pendingState)
    pendingUserId = null
    pendingState = null
  }
}
