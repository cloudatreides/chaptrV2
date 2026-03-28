import { Drawer } from 'vaul'
import { X, RotateCcw } from 'lucide-react'
import { useStore } from '../store/useStore'
import { SEOUL_TRANSFER_CHAPTERS } from '../data/storyData'

interface Props {
  open: boolean
  onClose: () => void
}

export function YourStorySheet({ open, onClose }: Props) {
  const choices = useStore((s) => s.choices)
  const currentChapter = useStore((s) => s.currentChapter)
  const junhoTrust = useStore((s) => s.characterState.junhoTrust)
  const selfieUrl = useStore((s) => s.selfieUrl)

  const grouped = SEOUL_TRANSFER_CHAPTERS.map((ch) => ({
    chapter: ch,
    choices: choices.filter((c) => c.chapter === ch.number),
    isCurrent: ch.number === currentChapter,
    isUnlocked: ch.number <= currentChapter,
  }))

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
                <p className="text-textPrimary text-sm font-semibold">You (Y/N)</p>
                <p className="text-textMuted text-xs">Main character</p>
              </div>
            </div>
          )}

          {/* Trust bar */}
          <div className="px-5 pb-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-textMuted text-xs">Junho</span>
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
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
            {grouped.map(({ chapter, choices: chChoices, isCurrent, isUnlocked }) => (
              <div key={chapter.number} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isUnlocked ? 'bg-accent' : 'bg-border'}`} />
                  <span className={`text-sm font-semibold ${isUnlocked ? 'text-textPrimary' : 'text-textMuted'}`}>
                    Chapter {chapter.number} — {chapter.title}
                  </span>
                  {isCurrent && (
                    <span className="text-xs px-1.5 py-0.5 rounded font-bold bg-accent text-white">NOW</span>
                  )}
                </div>
                {chChoices.length > 0 ? (
                  <div className="ml-4 space-y-1 border-l border-border pl-3">
                    {chChoices.map((c, i) => (
                      <p key={i} className="text-textSecondary text-sm">{c.text}</p>
                    ))}
                  </div>
                ) : isCurrent ? (
                  <p className="ml-4 pl-3 border-l border-border text-textMuted text-sm italic">Making a choice now...</p>
                ) : null}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 pb-6 pt-3 border-t border-border">
            <button className="choice-btn justify-center gap-2 w-full">
              <RotateCcw size={16} className="text-textSecondary" />
              <span>Replay a chapter</span>
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
