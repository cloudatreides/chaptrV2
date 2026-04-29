import { MessageSquarePlus } from 'lucide-react'
import { useLocation } from 'react-router-dom'

interface FeedbackFabProps {
  onClick: () => void
}

const HIDDEN_PATHS = ['/story', '/travel/trip', '/free-chat', '/reveal', '/quest', '/login', '/terms', '/privacy', '/characters', '/create-character', '/edit-character']

export function FeedbackFab({ onClick }: FeedbackFabProps) {
  const { pathname } = useLocation()
  const hidden = pathname === '/' ||
    HIDDEN_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/cast/')

  if (hidden) return null

  return (
    <button
      onClick={onClick}
      className="fixed bottom-28 md:bottom-5 right-5 z-40 flex items-center gap-1.5 px-4 py-3 min-h-[44px] rounded-full border border-[#3d3060] shadow-lg transition-all hover:scale-105 active:scale-95"
      style={{
        background: 'rgba(30, 24, 50, 0.85)',
        backdropFilter: 'blur(12px)',
      }}
      aria-label="Send feedback"
    >
      <MessageSquarePlus size={14} className="text-textSecondary" />
      <span className="text-textSecondary text-xs font-medium">Feedback</span>
    </button>
  )
}
