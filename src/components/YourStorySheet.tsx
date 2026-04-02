import { Drawer } from 'vaul'
import { X, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useActiveStory } from '../hooks/useActiveStory'
import { CHARACTERS } from '../data/characters'
import { resolveLoveInterestId } from '../data/storyData'

interface Props {
  open: boolean
  onClose: () => void
}

export function YourStorySheet({ open, onClose }: Props) {
  const navigate = useNavigate()
  const { selfieUrl, loveInterest, choiceDescriptions, chatSummaries, characterState, trustStatusLabel, activeCharacter, primaryNpcName } = useActiveStory()
  const resetStory = useStore((s) => s.resetStory)
  const junhoTrust = characterState.junhoTrust
  const trustLabel = trustStatusLabel
  const liName = primaryNpcName

  const summaryEntries = Object.entries(chatSummaries)

  return (
    <Drawer.Root open={open} onOpenChange={(v) => !v && onClose()} snapPoints={[0.55, 1]}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl overflow-hidden" style={{ background: '#13101c', border: '1px solid #2a2040', borderBottom: 'none' }}>
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-textPrimary font-semibold text-lg">Your Story</h2>
            <button onClick={onClose} className="text-textMuted hover:text-textPrimary transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* You */}
          {selfieUrl && (
            <div className="flex items-center gap-3 px-5 pb-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 shrink-0" style={{ borderColor: '#c84b9e' }}>
                <img src={selfieUrl} alt="You" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-textPrimary text-sm font-semibold">{activeCharacter?.name ?? 'You'}</p>
                <p className="text-textMuted text-xs">Main character</p>
              </div>
            </div>
          )}

          {/* Trust bar */}
          <div className="px-5 pb-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-textMuted text-xs">{liName}</span>
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
          <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
            {/* Choices */}
            {choiceDescriptions.length > 0 && (
              <div className="space-y-2">
                <p className="text-textMuted text-[10px] uppercase tracking-widest">Choices Made</p>
                {choiceDescriptions.map((c, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent mt-1 shrink-0" />
                    <div>
                      <p className="text-textPrimary text-sm font-medium">{c.label}</p>
                      <p className="text-textSecondary text-xs">{c.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chat summaries */}
            {summaryEntries.length > 0 && (
              <div className="space-y-2">
                <p className="text-textMuted text-[10px] uppercase tracking-widest">Conversations</p>
                {summaryEntries.map(([stepId, summary]) => {
                  const charId = stepId.includes('2a') ? 'sora' : resolveLoveInterestId(loveInterest)
                  const char = CHARACTERS[charId]
                  return (
                    <div key={stepId} className="flex items-start gap-2">
                      <span className="text-sm shrink-0">{char?.avatar ?? '💬'}</span>
                      <div>
                        <p className="text-textPrimary text-sm font-medium">{char?.name ?? charId}</p>
                        <p className="text-textSecondary text-xs leading-relaxed">{summary.replace(/^#\s*Summary\s*/i, '')}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {choiceDescriptions.length === 0 && summaryEntries.length === 0 && (
              <p className="text-textMuted text-sm italic">Your story is just beginning...</p>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pb-6 pt-3 border-t border-border">
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-textPrimary text-sm font-medium transition-all"
              style={{ background: 'rgba(26, 21, 37, 0.85)', border: '1px solid rgba(42, 32, 64, 0.8)' }}
              onClick={() => { resetStory(); onClose(); navigate('/story') }}
            >
              <RotateCcw size={16} className="text-textSecondary" />
              <span>Start over</span>
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
