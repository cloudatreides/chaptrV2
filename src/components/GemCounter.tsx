import { useStore } from '../store/useStore'

export function GemCounter() {
  const gemBalance = useStore((s) => s.gemBalance)
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border">
      <span className="text-gem text-sm">💎</span>
      <span className="text-textPrimary text-sm font-semibold">{gemBalance}</span>
    </div>
  )
}
