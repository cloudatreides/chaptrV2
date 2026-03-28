import { RotateCcw } from 'lucide-react'
import { useStore } from '../store/useStore'
import { SEOUL_TRANSFER_CHAPTERS } from '../data/storyData'

export function YourStorySidebar() {
  const choices = useStore((s) => s.choices)
  const currentChapter = useStore((s) => s.currentChapter)

  const grouped = SEOUL_TRANSFER_CHAPTERS.map((ch) => ({
    chapter: ch,
    choices: choices.filter((c) => c.chapter === ch.number),
    isCurrent: ch.number === currentChapter,
    isUnlocked: ch.number <= currentChapter,
  }))

  return (
    <div className="flex flex-col h-full px-5 py-6">
      {/* Universe label */}
      <p className="text-textMuted text-xs font-semibold uppercase tracking-widest mb-4">The Seoul Transfer</p>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {grouped.map(({ chapter, choices: chChoices, isCurrent, isUnlocked }) => (
          <div key={chapter.number} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full shrink-0 ${isUnlocked ? 'bg-accent' : 'bg-border'}`} />
              <span className={`text-xs font-semibold ${isUnlocked ? 'text-textPrimary' : 'text-textMuted'}`}>
                Ch.{chapter.number} — {chapter.title}
              </span>
              {isCurrent && (
                <span className="text-xs px-1.5 py-0.5 rounded font-bold bg-accent text-white">NOW</span>
              )}
            </div>
            {chChoices.length > 0 ? (
              <div className="ml-4 space-y-1 border-l border-border pl-3">
                {chChoices.map((c, i) => (
                  <p key={i} className="text-textSecondary text-xs">{c.text}</p>
                ))}
              </div>
            ) : isCurrent ? (
              <p className="ml-4 pl-3 border-l border-border text-textMuted text-xs italic">Making a choice now...</p>
            ) : null}
          </div>
        ))}
      </div>

      {/* Replay */}
      <button className="choice-btn justify-center gap-2 mt-4">
        <RotateCcw size={14} className="text-textSecondary" />
        <span className="text-sm">Replay a chapter</span>
      </button>
    </div>
  )
}
