import { Fragment } from 'react'

const HIGHLIGHT_COLOR = '#A78BFA'

export function highlightName(text: string, name: string | null | undefined): React.ReactNode {
  if (!name || !text) return text
  const trimmed = name.trim()
  if (!trimmed) return text

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`\\b(${escaped})\\b`, 'gi')

  const parts: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null = regex.exec(text)
  while (m !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push(
      <span key={`hl-${m.index}`} style={{ color: HIGHLIGHT_COLOR, fontWeight: 600 }}>
        {m[0]}
      </span>
    )
    last = m.index + m[0].length
    m = regex.exec(text)
  }
  if (last < text.length) parts.push(text.slice(last))

  return <Fragment>{parts}</Fragment>
}

export const HIGHLIGHT_NAME_COLOR = HIGHLIGHT_COLOR
