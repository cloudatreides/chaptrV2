import { useEffect, useRef, useState } from 'react'

export function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const isCancelledRef = useRef(false)

  useEffect(() => {
    isCancelledRef.current = false
    setDisplayed('')
    setDone(false)

    if (!text) return

    let i = 0
    function tick() {
      if (isCancelledRef.current) return
      if (i >= text.length) {
        setDone(true)
        return
      }
      setDisplayed(text.slice(0, i + 1))
      i++
      setTimeout(tick, speed)
    }
    setTimeout(tick, speed)

    return () => {
      isCancelledRef.current = true
    }
  }, [text, speed])

  return { displayed, done }
}

export function useStreamingTypewriter(speed = 18) {
  const [displayed, setDisplayed] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const queueRef = useRef<string[]>([])
  const tickingRef = useRef(false)

  const append = (chunk: string) => {
    queueRef.current.push(...chunk.split(''))
    if (!tickingRef.current) {
      setIsTyping(true)
      tick()
    }
  }

  const finish = () => {
    // drain remaining queue faster
    const remaining = queueRef.current.join('')
    queueRef.current = []
    setDisplayed((prev) => prev + remaining)
    setIsTyping(false)
  }

  const reset = () => {
    queueRef.current = []
    tickingRef.current = false
    setDisplayed('')
    setIsTyping(false)
  }

  function tick() {
    if (queueRef.current.length === 0) {
      tickingRef.current = false
      return
    }
    tickingRef.current = true
    const char = queueRef.current.shift()!
    setDisplayed((prev) => prev + char)
    setTimeout(tick, speed)
  }

  return { displayed, isTyping, append, finish, reset }
}
