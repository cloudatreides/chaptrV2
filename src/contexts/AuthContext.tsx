import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { loadGameState, flushPendingSave, saveGameState } from '../lib/gameStateSync'
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

/** Hydrate the Zustand store from Supabase saved state */
async function hydrateFromCloud(userId: string) {
  const cloudState = await loadGameState(userId)
  if (!cloudState) return // No saved state — first-time user or never synced

  // Compare timestamps: use whichever is newer (cloud vs local)
  const localTimestamp = useStore.getState().lastSessionTimestamp ?? 0
  const cloudTimestamp = (cloudState.lastSessionTimestamp as number) ?? 0

  if (cloudTimestamp >= localTimestamp) {
    // Cloud is newer or equal — hydrate store from cloud
    useStore.setState(cloudState)
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
          // Different user signed in — clear previous user's local data
          localStorage.removeItem('chaptr-v2-story')
        }
        localStorage.setItem('chaptr-v2-uid', data.session.user.id)
        // Load cloud state for this user
        await hydrateFromCloud(data.session.user.id)
        // Enable master mode for admin account
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
      }
      await saveGameState(userId, partialState)
    }
    localStorage.removeItem('chaptr-v2-story')
    localStorage.removeItem('chaptr-v2-uid')
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
