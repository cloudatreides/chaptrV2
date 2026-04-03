import { Navigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return (
    <>
      {children}
      <button
        onClick={signOut}
        className="fixed bottom-5 left-5 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-textMuted hover:text-textSecondary transition-colors z-50"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <LogOut size={13} />
        Sign out
      </button>
    </>
  )
}
