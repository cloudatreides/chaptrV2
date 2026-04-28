import { MessageSquarePlus } from 'lucide-react'

interface FeedbackFabProps {
  onClick: () => void
}

export function FeedbackFab({ onClick }: FeedbackFabProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 md:bottom-5 right-5 z-40 flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#3d3060] shadow-lg transition-all hover:scale-105 active:scale-95"
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
