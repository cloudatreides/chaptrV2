import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { loadGameState, flushPendingSave, saveGameState, getLastLocalSaveTimestamp, markHydrated, unmarkHydrated, isHydrated } from '../lib/gameStateSync'
import { useStore } from '../store/useStore'

const MASTER_EMAIL = 'nicholas@zentry.com'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  isMaster: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Hydrate the Zustand store from Supabase saved state.
 *
 *  Strategy: strict timestamp comparison between cloud `updated_at` and this
 *  browser's `last-local-save` (set after every successful save in
 *  gameStateSync.ts). Cloud wins when it is *strictly* newer than this
 *  browser's last save.
 *
 *  Why no slop / no threshold:
 *   - Same browser, same session: lastLocalSave is set after the cloud save
 *     completes (Date.now() includes the network round-trip), so it is
 *     ~200ms *later* than cloudUpdatedAt. Cloud loses the comparison →
 *     unsynced local edits survive a refresh. ✓
 *   - Different browsers, same user: B's lastLocalSave reflects B's last
 *     save, A's cloudUpdatedAt reflects A's save. If A is newer than B,
 *     even by 1ms, cloud wins → cross-browser drift heals. ✓
 *   - Brand-new browser (lastLocalSave = 0): cloud always wins. ✓
 *
 *  An earlier 30s threshold caused cross-browser writes within the same
 *  session to be ignored, because both browsers' timestamps fell inside the
 *  slop window. Removed — strict comparison is the correct rule. */
async function hydrateFromCloud(userId: string) {
  // Snapshot pre-fetch state so we can detect mutations during the
  // hydrate window. Render is not blocked on hydrate (snappy UX) so the
  // user can chat / advance days during the 200ms-1.5s round-trip. If
  // we apply cloud state via setState() after they've mutated, Zustand's
  // shallow merge replaces top-level keys (travelTrips, characters, etc)
  // and silently wipes their just-made changes. Reference equality on
  // the root state object is enough — every set() creates a new root.
  const preFetchState = useStore.getState()
  const result = await loadGameState(userId)
  if (!result) return

  const { state: cloudState, updatedAt: cloudUpdatedAt } = result
  const local = useStore.getState()
  const lastLocalSave = getLastLocalSaveTimestamp()

  // Cloud is strictly newer → another browser/device has updated since this
  // browser last saved. Pull cloud state in.
  if (cloudUpdatedAt > lastLocalSave) {
    if (local !== preFetchState) {
      // User mutated state during the fetch window — local is canonical.
      // Skip the cloud overwrite. The post-hydrate nudge below will push
      // the local state to cloud so the next session sees their work.
      console.warn('[hydrateFromCloud] skipping cloud override — local mutated during fetch window')
      return
    }
    // Clamp the active-pointer invariant before applying: activeTripId must
    // belong to activeCharacterId. Cloud rows can carry drifted pointers
    // (mismatched activeCharacterId / activeTripId) that, once applied,
    // make the travel page silently spawn an empty trip on the wrong twin.
    // See travel-bug.md.
    const cs = cloudState as Partial<typeof local> & { activeCharacterId?: string | null; activeTripId?: string | null }
    const tripCharPrefix = cs.activeTripId?.split(':')[0]
    if (cs.activeTripId && tripCharPrefix !== cs.activeCharacterId) {
      cs.activeTripId = null
    }
    useStore.setState(cs)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const prevUserId = localStorage.getItem('chaptr-v2-uid')
        if (prevUserId && prevUserId !== data.session.user.id) {
          // Different user is signing in. localStorage clear isn't enough —
          // the Zustand store was already hydrated from previous user's data
          // at module load, so the in-memory state still has the old user's
          // twins. Force a hard reload after clearing so the page rebuilds
          // from scratch with the new user's cloud state.
          localStorage.removeItem('chaptr-v2-story')
          localStorage.removeItem('chaptr-v2-last-local-save')
          localStorage.setItem('chaptr-v2-uid', data.session.user.id)
          window.location.reload()
          return
        }
        localStorage.setItem('chaptr-v2-uid', data.session.user.id)
        useStore.getState().setMasterMode(data.session.user.email === MASTER_EMAIL)
        // Hydrate cloud state in the background — don't block initial render
        // on the round-trip to Supabase. Local store hydrates synchronously
        // from localStorage; if cloud is newer, it'll override after the
        // fetch lands (brief re-render is much better UX than a multi-second
        // black spinner before the page is interactive).
        // Saves stay suppressed via the hydration gate (gameStateSync.ts)
        // until this resolves, so a fresh-browser empty store can never
        // race ahead of cloud and POST `characters: []` over real data.
        // After the gate flips, nudge the store so useGameStateSync's
        // subscriber fires with current state — this picks up any
        // mutations the user made during the hydrate window (which had
        // their queueSave calls dropped by the gate) and pushes them to
        // cloud.
        hydrateFromCloud(data.session.user.id).finally(() => {
          markHydrated()
          useStore.getState().updateLastSessionTimestamp()
        })
      } else {
        // No session → no hydrate fires → mark hydrated so the gate doesn't
        // block any save the unauthenticated landing page might trigger.
        markHydrated()
      }
      setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const prevUserId = localStorage.getItem('chaptr-v2-uid')
        if (prevUserId && prevUserId !== session.user.id) {
          unmarkHydrated()
          localStorage.removeItem('chaptr-v2-story')
          localStorage.removeItem('chaptr-v2-last-local-save')
          localStorage.setItem('chaptr-v2-uid', session.user.id)
          await hydrateFromCloud(session.user.id)
          markHydrated()
          useStore.getState().setMasterMode(session.user.email === MASTER_EMAIL)
          window.location.reload()
          return
        }
        localStorage.setItem('chaptr-v2-uid', session.user.id)
        useStore.getState().setMasterMode(session.user.email === MASTER_EMAIL)
      } else {
        useStore.getState().setMasterMode(false)
      }
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })
  }

  async function signOut() {
    // Save current state to cloud before clearing — but only if we
    // actually hydrated this session. Otherwise the "current state" is
    // the empty pre-hydrate store, and saving it would wipe cloud just
    // as surely as the race we're guarding against in queueSave.
    const userId = localStorage.getItem('chaptr-v2-uid')
    if (userId && isHydrated()) {
      await flushPendingSave()
      // Final save with current state
      const state = useStore.getState()
      const partialState = {
        characters: state.characters,
        activeCharacterId: state.activeCharacterId,
        selectedUniverse: state.selectedUniverse,
        storyProgress: state.storyProgress,
        gemBalance: state.gemBalance,
        globalAffinities: state.globalAffinities,
        playthroughHistory: state.playthroughHistory,
        ambientPings: state.ambientPings,
        lastSessionTimestamp: Date.now(),
        castChatThreads: state.castChatThreads,
        unlockedCastIds: state.unlockedCastIds,
        groupCastThreads: state.groupCastThreads,
        favoriteCastIds: state.favoriteCastIds,
        storyMoments: state.storyMoments,
        customCompanions: state.customCompanions,
        travelTrips: state.travelTrips,
        activeTripId: state.activeTripId,
      }
      await saveGameState(userId, partialState)
    }
    unmarkHydrated()
    localStorage.removeItem('chaptr-v2-story')
    localStorage.removeItem('chaptr-v2-uid')
    localStorage.removeItem('chaptr-v2-last-local-save')
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, isMaster: session?.user?.email === MASTER_EMAIL, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
