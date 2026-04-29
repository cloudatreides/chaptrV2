import { supabase } from './supabase'

// ─── Per-User Game State Sync ───
// Syncs the Zustand store to Supabase so state survives logout/login.
// Table: user_game_state (user_id UUID PK, state JSONB, updated_at TIMESTAMPTZ)

const TABLE = 'user_game_state'

/** Save the full partialize state to Supabase for the current user */
export async function saveGameState(userId: string, state: Record<string, unknown>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLE)
      .upsert({
        user_id: userId,
        state,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (error) {
      console.error('Failed to save game state:', error)
      return false
    }
    return true
  } catch (e) {
    console.error('Game state save error:', e)
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

/** Queue a debounced save */
export function queueSave(userId: string, state: Record<string, unknown>) {
  pendingUserId = userId
  pendingState = state
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (pendingUserId && pendingState) {
      saveGameState(pendingUserId, pendingState)
    }
    saveTimer = null
    pendingUserId = null
    pendingState = null
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
