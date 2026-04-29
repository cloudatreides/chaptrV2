import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { HIGHLIGHT_NAME_COLOR } from '../lib/highlightName'

interface Props {
  text: string
  className?: string
  style?: React.CSSProperties
  highlightWord?: string | null
}

/** Renders text with each word fading + lifting in as it arrives. Stable per-index
 *  keys mean only newly appended words animate; existing words stay still.
 *  If highlightWord is set, tokens matching the word (case-insensitive, ignoring
 *  surrounding punctuation) get the brand-highlight color. */
export function StreamedText({ text, className, style, highlightWord }: Props) {
  const tokens = useMemo(() => text.split(/(\s+)/), [text])
  const highlightLower = highlightWord?.trim().toLowerCase() || null

  return (
    <p className={className} style={{ whiteSpace: 'pre-wrap', ...style }}>
      {tokens.map((tok, i) => {
        if (/^\s+$/.test(tok)) return <span key={i}>{tok}</span>
        const stripped = tok.replace(/[^\p{L}\p{N}']/gu, '').toLowerCase()
        const isName = !!highlightLower && stripped === highlightLower
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              display: 'inline-block',
              color: isName ? HIGHLIGHT_NAME_COLOR : undefined,
              fontWeight: isName ? 600 : undefined,
            }}
          >
            {tok}
          </motion.span>
        )
      })}
    </p>
  )
}
