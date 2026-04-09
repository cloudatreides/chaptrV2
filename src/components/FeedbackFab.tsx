import { MessageSquarePlus } from 'lucide-react'

interface FeedbackFabProps {
  onClick: () => void
}

export function FeedbackFab({ onClick }: FeedbackFabProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full flex items-center justify-center border border-border/50 shadow-lg transition-all hover:scale-105 active:scale-95"
      style={{
        background: 'linear-gradient(135deg, rgba(200,75,158,0.2) 0%, rgba(139,92,246,0.2) 100%)',
        backdropFilter: 'blur(12px)',
      }}
      aria-label="Send feedback"
    >
      <MessageSquarePlus size={18} className="text-textSecondary" />
    </button>
  )
}
