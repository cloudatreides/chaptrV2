import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { loadGameState, flushPendingSave, saveGameState, getLastLocalSaveTimestamp } from '../lib/gameStateSync'
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
 *  Strategy: each browser tracks its own `last-local-save` timestamp in
 *  localStorage. On hydrate, compare that against the cloud row's
 *  `updated_at`:
 *   - cloud meaningfully newer → another browser/device has updated since
 *     this one last saved. Pull cloud state in. (Self-heals cross-browser
 *     drift like wiping twins in Chrome → VS Code integrated browser still
 *     showing the old set.)
 *   - otherwise → this browser is up-to-date or has unsynced edits. Keep
 *     local.
 *
 *  Per-browser localStorage key avoids the previous "local always wins"
 *  trap where stale localStorage silently outranked cloud, AND avoids the
 *  inverse trap where same-browser refreshes mistakenly re-pull cloud
 *  (because we never bumped the in-store `lastSessionTimestamp` on saves). */
const CLOUD_WINS_THRESHOLD_MS = 30_000  // cloud must be ≥30s newer than this browser's last save

async function hydrateFromCloud(userId: string) {
  const result = await loadGameState(userId)
  if (!result) return

  const { state: cloudState, updatedAt: cloudUpdatedAt } = result
  const local = useStore.getState()
  const hasLocalData =
    (local.characters?.length ?? 0) > 0 ||
    Object.keys(local.storyProgress ?? {}).length > 0 ||
    Object.keys(local.travelTrips ?? {}).length > 0

  if (!hasLocalData) {
    useStore.setState(cloudState as Partial<typeof local>)
    return
  }

  const lastLocalSave = getLastLocalSaveTimestamp()
  if (cloudUpdatedAt - lastLocalSave > CLOUD_WINS_THRESHOLD_MS) {
    useStore.setState(cloudState as Partial<typeof local>)
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
        await hydrateFromCloud(data.session.user.id)
        useStore.getState().setMasterMode(data.session.user.email === MASTER_EMAIL)
      }
      setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const prevUserId = localStorage.getItem('chaptr-v2-uid')
        if (prevUserId && prevUserId !== session.user.id) {
          localStorage.removeItem('chaptr-v2-story')
          localStorage.removeItem('chaptr-v2-last-local-save')
          localStorage.setItem('chaptr-v2-uid', session.user.id)
          await hydrateFromCloud(session.user.id)
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
    // Save current state to cloud before clearing
    const userId = localStorage.getItem('chaptr-v2-uid')
    if (userId) {
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
