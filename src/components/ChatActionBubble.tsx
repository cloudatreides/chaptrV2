import { memo } from 'react'

interface Props {
  label: string
  emoji: string
  gemCost: number
  jokeText?: string | null
  dareText?: string | null
}

// Action-specific particle emojis displayed around the main emoji
const ACTION_PARTICLES: Record<string, string[]> = {
  '👉': ['💫', '✨'],
  '😂': ['🤣', '💀'],
  '🎲': ['🔥', '⚡'],
  '🎮': ['🏆', '⚔️'],
  '☕': ['☁️', '✨'],
  '🎁': ['✨', '🎉'],
  '✨': ['💖', '🌟'],
  '🤗': ['💛', '🫂'],
  '🤫': ['👀', '🤐'],
  '📷': ['💭', '🕰️'],
  '💐': ['🌸', '🌷'],
  '🌹': ['❤️', '✨'],
  '🍪': ['🧡', '✨'],
  '💌': ['❤️', '💕'],
  '📝': ['💭', '✨'],
  '🎶': ['🎵', '💜'],
  '🎧': ['🎵', '✨'],
}

/** Renders a chat action as a styled sticker card in the message thread */
export const ChatActionBubble = memo(function ChatActionBubble({ label, emoji, gemCost, jokeText, dareText }: Props) {
  const particles = ACTION_PARTICLES[emoji] ?? ['✨']

  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${jokeText || dareText ? 'w-[220px]' : 'w-[140px]'}`}
      style={{
        background: 'linear-gradient(145deg, rgba(200,75,158,0.18) 0%, rgba(139,92,246,0.18) 50%, rgba(200,75,158,0.12) 100%)',
        border: '1px solid rgba(200,75,158,0.25)',
      }}
    >
      {/* Emoji showcase area */}
      <div className="relative flex items-center justify-center pt-5 pb-2">
        {/* Static decorative particles */}
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute text-[10px] opacity-40 pointer-events-none"
            style={{
              left: i === 0 ? '15%' : '75%',
              top: i === 0 ? '10%' : '55%',
            }}
          >
            {p}
          </span>
        ))}

        {/* Main emoji */}
        <span className="text-4xl relative z-10">{emoji}</span>
      </div>

      {/* Label + joke text */}
      <div className="px-3 pb-3 text-center">
        <span className="text-white/90 text-xs font-medium">{label}</span>
        {jokeText && (
          <p className="text-white/50 text-[10px] mt-1.5 leading-relaxed italic">"{jokeText}"</p>
        )}
        {dareText && (
          <p className="text-white/50 text-[10px] mt-1.5 leading-relaxed italic">"{dareText}"</p>
        )}
        {gemCost > 0 && (
          <span className="block text-[9px] mt-0.5" style={{ color: 'rgba(251,191,36,0.5)' }}>
            -{gemCost} gems
          </span>
        )}
      </div>
    </div>
  )
})
