import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const prevUserId = localStorage.getItem('chaptr-v2-uid')
        if (prevUserId && prevUserId !== data.session.user.id) {
          // Different user signed in — clear previous user's data
          localStorage.removeItem('chaptr-v2-story')
        }
        localStorage.setItem('chaptr-v2-uid', data.session.user.id)
      }
      setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const prevUserId = localStorage.getItem('chaptr-v2-uid')
        if (prevUserId && prevUserId !== session.user.id) {
          localStorage.removeItem('chaptr-v2-story')
          window.location.reload()
        }
        localStorage.setItem('chaptr-v2-uid', session.user.id)
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
    localStorage.removeItem('chaptr-v2-story')
    localStorage.removeItem('chaptr-v2-uid')
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
