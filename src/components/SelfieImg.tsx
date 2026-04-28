import { useState, useEffect } from 'react'

export function SelfieImg({ src, alt, className, style, fallback }: {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  fallback: React.ReactNode
}) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])
  if (failed) return <>{fallback}</>
  return <img src={src} alt={alt} className={className} style={style} onError={() => setFailed(true)} />
}
