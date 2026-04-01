import { RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { CHARACTERS } from '../data/characters'

export function YourStorySidebar() {
  const navigate = useNavigate()
  const choiceDescriptions = useStore((s) => s.choiceDescriptions)
  const chatSummaries = useStore((s) => s.chatSummaries)
  const junhoTrust = useStore((s) => s.characterState.junhoTrust)
  const trustLabel = useStore((s) => s.trustStatusLabel)
  const selfieUrl = useStore((s) => s.selfieUrl)
  const resetStory = useStore((s) => s.resetStory)

  const summaryEntries = Object.entries(chatSummaries)

  return (
    <div className="flex flex-col h-full px-5 py-6">
      {/* You */}
      {selfieUrl && (
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 shrink-0" style={{ borderColor: '#c84b9e' }}>
            <img src={selfieUrl} alt="You" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-textPrimary text-xs font-semibold">You (Y/N)</p>
            <p className="text-textMuted text-xs">Main character</p>
          </div>
        </div>
      )}

      {/* Universe label */}
      <p className="text-textMuted text-xs font-semibold uppercase tracking-widest mb-3">The Seoul Transfer</p>

      {/* Trust bar */}
      <div className="mb-4 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-textMuted text-xs">Jiwon</span>
          <span className="text-textMuted text-xs">{junhoTrust}/100</span>
        </div>
        <div className="h-1 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${junhoTrust}%`,
              background: junhoTrust > 70 ? 'linear-gradient(90deg,#c84b9e,#8b5cf6)' : junhoTrust > 40 ? '#8b5cf6' : '#4b5563',
            }}
          />
        </div>
        <p className="text-textMuted text-[10px]">{trustLabel}</p>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {/* Choices made */}
        {choiceDescriptions.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-textMuted text-[10px] uppercase tracking-widest">Choices</p>
            {choiceDescriptions.map((c, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <p className="text-textSecondary text-xs">{c.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Chat summaries */}
        {summaryEntries.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-textMuted text-[10px] uppercase tracking-widest">Conversations</p>
            {summaryEntries.map(([stepId, summary]) => {
              // Extract character from step id (e.g. 'chat-1' -> jiwon, 'chat-2a' -> sora)
              const charId = stepId.includes('2a') ? 'sora' : 'jiwon'
              const char = CHARACTERS[charId]
              return (
                <div key={stepId} className="flex items-start gap-2">
                  <span className="text-xs shrink-0 mt-0.5">{char?.avatar ?? '💬'}</span>
                  <p className="text-textSecondary text-xs leading-relaxed">{summary}</p>
                </div>
              )
            })}
          </div>
        )}

        {choiceDescriptions.length === 0 && summaryEntries.length === 0 && (
          <p className="text-textMuted text-xs italic">Your story is just beginning...</p>
        )}
      </div>

      {/* Replay */}
      <button
        className="choice-btn justify-center gap-2 mt-4"
        onClick={() => { resetStory(); navigate('/story') }}
      >
        <RotateCcw size={14} className="text-textSecondary" />
        <span className="text-sm">Start over</span>
      </button>
    </div>
  )
}
