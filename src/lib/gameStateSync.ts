import { supabase } from './supabase'

// ─── Per-User Game State Sync ───
// Syncs the Zustand store to Supabase so state survives logout/login.
// Table: user_game_state (user_id UUID PK, state JSONB, updated_at TIMESTAMPTZ)

const TABLE = 'user_game_state'

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

// Telemetry: ship every failure to /api/log-sync-error so we can see patterns
// across users without relying on each user opening dev tools.
async function logSyncError(userId: string, payloadSize: number, error: { code?: string; message: string; details?: string; hint?: string; classification: 'transient' | 'permanent' | 'unknown' }): Promise<void> {
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
      logSyncError(userId, payloadSize, { code: error.code, message: error.message, details: error.details, hint: error.hint, classification })
      return false
    }
    setSync({ status: 'saved', lastSavedAt: Date.now() })
    return true
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[GameStateSync] save threw:', e)
    const classification = classifyError(undefined, msg)
    setSync({ status: 'error', lastError: msg })
    logSyncError(userId, payloadSize, { message: msg, classification })
    return false
  }
}

/** Load game state from Supabase for a given user */
export async function loadGameState(userId: string): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('state')
      .eq('user_id', userId)
      .single()

    if (error || !data) return null
    return data.state as Record<string, unknown>
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
  const delay = RETRY_DELAYS_MS[retryAttempt]
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
  saveTimer = setTimeout(async () => {
    saveTimer = null
    if (pendingUserId && pendingState) {
      const ok = await saveGameState(pendingUserId, pendingState)
      if (!ok) scheduleRetry()
    }
  }, DEBOUNCE_MS)
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
