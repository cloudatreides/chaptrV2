import { ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'

interface Props {
  text: string
  gemCost?: number
  index: number
  selectedIndex: number | null
  disabled: boolean
  onSelect: (index: number) => void
}

export function ChoiceButton({ text, gemCost, index, selectedIndex, disabled, onSelect }: Props) {
  const gemBalance = useStore((s) => s.gemBalance)
  const masterMode = useStore((s) => s.masterMode)
  const isSelected = selectedIndex === index
  const isDimmed = selectedIndex !== null && !isSelected
  const canAfford = masterMode || !gemCost || gemBalance >= gemCost
  const isLocked = !!gemCost && !canAfford

  let cls = 'choice-btn'
  if (isSelected) cls += ' selected'
  if (isDimmed) cls += ' dimmed'
  if (isLocked) cls += ' locked'

  return (
    <button
      className={cls}
      disabled={disabled || isDimmed || isLocked}
      onClick={() => onSelect(index)}
    >
      <span>{text}</span>
      <span className="flex items-center gap-1 shrink-0">
        {gemCost && (
          <span className="flex items-center gap-0.5 text-gem text-xs font-semibold mr-1">
            💎{gemCost}
          </span>
        )}
        <ChevronRight size={16} className="text-textMuted" />
      </span>
    </button>
  )
}
