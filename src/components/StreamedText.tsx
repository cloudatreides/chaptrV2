import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface Props {
  text: string
  className?: string
  style?: React.CSSProperties
}

/** Renders text with each word fading + lifting in as it arrives. Stable per-index
 *  keys mean only newly appended words animate; existing words stay still. */
export function StreamedText({ text, className, style }: Props) {
  const tokens = useMemo(() => text.split(/(\s+)/), [text])

  return (
    <p className={className} style={{ whiteSpace: 'pre-wrap', ...style }}>
      {tokens.map((tok, i) => {
        if (/^\s+$/.test(tok)) return <span key={i}>{tok}</span>
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ display: 'inline-block' }}
          >
            {tok}
          </motion.span>
        )
      })}
    </p>
  )
}
