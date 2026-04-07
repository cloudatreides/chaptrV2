import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const DEV_BYPASS_AUTH = import.meta.env.DEV

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (DEV_BYPASS_AUTH) return <>{children}</>

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!session) return <Navigate to="/" replace />

  return <>{children}</>
}
