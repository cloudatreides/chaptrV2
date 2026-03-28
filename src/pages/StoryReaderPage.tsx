import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu } from 'lucide-react'
import { useStore } from '../store/useStore'
import { SEOUL_TRANSFER_CHAPTERS } from '../data/storyData'
import { GemCounter } from '../components/GemCounter'
import { ChoiceButton } from '../components/ChoiceButton'
import { YourStorySheet } from '../components/YourStorySheet'
import { YourStorySidebar } from '../components/YourStorySidebar'
import { streamBeatProse, generateChoices } from '../lib/claudeStream'
import { useStreamingTypewriter, useTypewriter } from '../hooks/useTypewriter'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY ?? ''
const TOTAL_BEATS = 5

export function StoryReaderPage() {
  const {
    currentChapter, currentBeat,
    choices, addChoice, advanceChapter, advanceBeat,
    isStreaming, setIsStreaming,
    isGeneratingScene, setIsGeneratingScene,
    selectedChoiceIndex, setSelectedChoiceIndex,
    continuationProse, setContinuationProse,
    characterState, updateTrust,
    dynamicChoices, setDynamicChoices,
    selfieUrl,
  } = useStore()

  const [sheetOpen, setSheetOpen] = useState(false)

  const chapter = SEOUL_TRANSFER_CHAPTERS[Math.min(currentChapter - 1, SEOUL_TRANSFER_CHAPTERS.length - 1)]
  const displayChoices = dynamicChoices ?? chapter.choices
  const [activeSceneImage, setActiveSceneImage] = useState(chapter.sceneImage)
  const abortRef = useRef<AbortController | null>(null)

  // Typewriter for opening prose
  const { displayed: openingDisplayed, done: openingDone } = useTypewriter(chapter.openingProse, 20)
  // Streaming typewriter for continuation
  const { displayed: contDisplayed, isTyping, append, finish, reset: resetCont } = useStreamingTypewriter(18)

  // Reset continuation when chapter/beat changes
  useEffect(() => {
    resetCont()
    setContinuationProse('')
    setSelectedChoiceIndex(null)
    setIsStreaming(false)
    setIsGeneratingScene(false)
    setActiveSceneImage(chapter.sceneImage)
  }, [currentChapter, currentBeat])

  const handleChoice = async (index: number) => {
    if (selectedChoiceIndex !== null || isStreaming) return

    const choice = displayChoices[index]

    // Gem-gated check
    if (choice.gemCost) {
      const ok = useStore.getState().spendGems(choice.gemCost)
      if (!ok) return
    }

    setSelectedChoiceIndex(index)
    setDynamicChoices(null) // clear so next beat starts fresh until new ones are generated

    // Apply trust delta (only static chapter choices have trustDelta)
    if (!dynamicChoices) {
      const staticChoice = chapter.choices[index]
      if (staticChoice?.trustDelta) updateTrust(staticChoice.trustDelta)
    }

    // Record choice
    addChoice({ chapter: currentChapter, chapterTitle: chapter.title, text: choice.text })

    if (!API_KEY) {
      // Fallback static prose
      const fallbacks = [
        '"Hi," you say, before you can stop yourself.\n\n"I\'m Y/N."\n\nJunho blinks. Then, unexpectedly, smiles.',
        'You turn away as if the neon signs outside demand all your attention.\n\nBut you can feel him watching you anyway.',
        'You lean forward, heart hammering.\n\n"Can I have your number?" you hear yourself ask.\n\nHe pauses — one beat, two. Then he takes out his phone.',
      ]
      setIsGeneratingScene(true)
      await new Promise((r) => setTimeout(r, 2200))
      setIsGeneratingScene(false)
      const text = fallbacks[index % fallbacks.length]
      setContinuationProse(text)
      setIsStreaming(true)
      append(text)
      finish()
      setIsStreaming(false)
      return
    }

    // Streaming from Claude
    setIsGeneratingScene(true)
    await new Promise((r) => setTimeout(r, 800)) // brief scene generation feel
    setActiveSceneImage(chapter.continuationSceneImage)
    setIsGeneratingScene(false)
    setIsStreaming(true)
    resetCont()

    abortRef.current = new AbortController()
    try {
      let fullProse = ''
      const gen = streamBeatProse({
        chapter: currentChapter,
        chapterTitle: chapter.title,
        choiceText: choice.text,
        choiceHistory: choices,
        characterState,
        apiKey: API_KEY,
        signal: abortRef.current.signal,
      })
      for await (const chunk of gen) {
        append(chunk)
        fullProse += chunk
      }
      finish()

      // Generate dynamic choices for the next beat in the background
      generateChoices({
        chapter: currentChapter,
        chapterTitle: chapter.title,
        prose: fullProse,
        choiceHistory: choices,
        characterState,
        apiKey: API_KEY,
      }).then((generated) => {
        if (generated.length > 0) setDynamicChoices(generated)
      })
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') {
        append('The story continues...')
        finish()
      }
    } finally {
      setIsStreaming(false)
    }
  }

  const handleNextBeat = () => {
    if (currentBeat >= TOTAL_BEATS) {
      if (currentChapter < SEOUL_TRANSFER_CHAPTERS.length) {
        advanceChapter()
      }
    } else {
      advanceBeat()
    }
  }

  const isChapterStart = currentBeat === 1
  const showContinuation = selectedChoiceIndex !== null && !isGeneratingScene
  const continuationText = contDisplayed || continuationProse

  return (
    <div className="bg-bg min-h-screen">
      {/* ─── MOBILE ─── */}
      <div className="lg:hidden relative min-h-screen flex flex-col">
        {/* Scene image — full bleed */}
        <div
          className="absolute inset-0 bg-cover bg-top"
          style={{ backgroundImage: `url(${activeSceneImage})`, backgroundColor: '#1a1525', transition: 'background-image 0.6s ease' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(13,10,18,0) 0%, rgba(13,10,18,0.4) 45%, rgba(13,10,18,0.95) 65%, rgba(13,10,18,1) 100%)' }}
        />

        {/* Loading overlay */}
        <AnimatePresence>
          {isGeneratingScene && (
            <motion.div
              className="absolute inset-0 z-30 flex flex-col items-center justify-center"
              style={{ background: 'rgba(13,10,18,0.85)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <LoadingSpinner />
              <p className="text-textSecondary text-sm mt-4">Generating your scene...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-10 pb-3">
          <button onClick={() => setSheetOpen(true)} className="text-textSecondary hover:text-textPrimary transition-colors">
            <Menu size={22} />
          </button>
          <ProgressBar current={currentBeat} total={TOTAL_BEATS} />
          <div className="flex items-center gap-2">
            {selfieUrl && (
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 shrink-0" style={{ borderColor: '#c84b9e' }}>
                <img src={selfieUrl} alt="You" className="w-full h-full object-cover" />
              </div>
            )}
            <GemCounter />
          </div>
        </div>

        {/* Content area */}
        <div className="relative z-10 mt-auto px-5 pb-6 flex flex-col gap-4">
          {/* Chapter label */}
          <div className="flex items-center justify-between">
            <p className="text-textMuted text-xs">Chapter {currentChapter} — {chapter.title}</p>
            <p className="text-textMuted text-xs">{currentBeat}/{TOTAL_BEATS}</p>
          </div>

          {/* Prose */}
          <div className="space-y-3 min-h-[80px]">
            {isChapterStart ? (
              <p className="text-textPrimary text-base leading-relaxed whitespace-pre-line">
                {openingDisplayed}
                {!openingDone && <span className="cursor-blink text-accent">|</span>}
              </p>
            ) : (
              <p className="text-textPrimary text-base leading-relaxed whitespace-pre-line">
                {chapter.openingProse}
              </p>
            )}

            {/* Continuation */}
            <AnimatePresence>
              {showContinuation && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-textPrimary text-base leading-relaxed whitespace-pre-line">
                    {continuationText}
                    {isTyping && <span className="cursor-blink text-accent">|</span>}
                  </p>
                  {!isTyping && continuationText && !isStreaming && (
                    <p className="text-textMuted text-xs mt-1 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      Writing your story...
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Streaming placeholder */}
          {isStreaming && !contDisplayed && (
            <div className="space-y-2">
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-4/5" />
              <div className="skeleton h-3 w-3/4" />
            </div>
          )}

          {/* Choices */}
          <AnimatePresence mode="wait">
            {(!showContinuation || isTyping) && !isGeneratingScene && (
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {displayChoices.map((choice, i) => (
                  <ChoiceButton
                    key={i}
                    text={choice.text}
                    gemCost={choice.gemCost}
                    index={i}
                    selectedIndex={selectedChoiceIndex}
                    disabled={isStreaming}
                    onSelect={handleChoice}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Continue to next beat */}
          {showContinuation && !isTyping && !isStreaming && (
            <motion.button
              className="choice-btn justify-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNextBeat}
            >
              Continue →
            </motion.button>
          )}
        </div>

        {/* Your Story sheet */}
        <YourStorySheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      </div>

      {/* ─── DESKTOP ─── */}
      <div className="hidden lg:flex min-h-screen">
        <div className="page-container flex w-full mx-auto">
          {/* Left sidebar — Your Story */}
          <aside
            className="w-[260px] shrink-0 flex flex-col border-r border-border sticky top-0 h-screen overflow-y-auto"
            style={{ background: '#0f0c18' }}
          >
            {/* Logo */}
            <div className="flex items-center gap-2 px-5 pt-6 pb-4 border-b border-border">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}>
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-textPrimary font-semibold">chaptr</span>
            </div>
            <YourStorySidebar />
          </aside>

          {/* Main reading area — scene top, prose panel bottom */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">

            {/* Scene — top 45% */}
            <div className="relative flex-none" style={{ height: '45vh' }}>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${activeSceneImage})`, backgroundColor: '#1a1525', transition: 'background-image 0.6s ease' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,10,18,0.25) 0%, rgba(13,10,18,0) 35%, rgba(13,10,18,0.9) 85%, rgba(13,10,18,1) 100%)' }} />
              <AnimatePresence>
                {isGeneratingScene && (
                  <motion.div className="absolute inset-0 z-30 flex flex-col items-center justify-center" style={{ background: 'rgba(13,10,18,0.85)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <LoadingSpinner />
                    <p className="text-textSecondary text-sm mt-4">Generating your scene...</p>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Nav over scene */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 pt-5">
                <p className="text-textMuted text-xs uppercase tracking-widest">Chapter {currentChapter} — {chapter.title}</p>
                <ProgressBar current={currentBeat} total={TOTAL_BEATS} />
                <div className="flex items-center gap-3">
                  {selfieUrl && <div className="w-8 h-8 rounded-full overflow-hidden border-2 shrink-0" style={{ borderColor: '#c84b9e' }}><img src={selfieUrl} alt="You" className="w-full h-full object-cover" /></div>}
                  <GemCounter />
                </div>
              </div>
            </div>

            {/* Prose panel — scrollable */}
            <div className="flex-1 overflow-y-auto" style={{ background: '#0d0b12' }}>
              <div className="mx-auto w-full max-w-[680px] px-8 pt-6 pb-10 flex flex-col gap-5">
                <p className="text-textMuted text-xs text-right">{currentBeat}/{TOTAL_BEATS}</p>
                <div className="space-y-4 min-h-[80px]">
                  {isChapterStart ? (
                    <p className="text-textPrimary text-lg leading-relaxed whitespace-pre-line">{openingDisplayed}{!openingDone && <span className="cursor-blink text-accent">|</span>}</p>
                  ) : (
                    <p className="text-textPrimary text-lg leading-relaxed whitespace-pre-line">{chapter.openingProse}</p>
                  )}
                  <AnimatePresence>
                    {showContinuation && (
                      <motion.p className="text-textPrimary text-lg leading-relaxed whitespace-pre-line" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {continuationText}{isTyping && <span className="cursor-blink text-accent">|</span>}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  {isStreaming && !contDisplayed && <div className="space-y-2"><div className="skeleton h-4 w-full" /><div className="skeleton h-4 w-4/5" /><div className="skeleton h-4 w-3/4" /></div>}
                </div>
                <AnimatePresence mode="wait">
                  {(!showContinuation || isTyping) && !isGeneratingScene && (
                    <motion.div className="space-y-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      {displayChoices.map((choice, i) => (
                        <ChoiceButton key={i} text={choice.text} gemCost={choice.gemCost} index={i} selectedIndex={selectedChoiceIndex} disabled={isStreaming} onSelect={handleChoice} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {showContinuation && !isTyping && !isStreaming && (
                  <motion.button className="choice-btn justify-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onClick={handleNextBeat}>Continue →</motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const progress = (current / total) * 100
  return (
    <div className="flex-1 max-w-[200px] mx-4">
      <div className="h-0.5 rounded-full bg-border overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #c84b9e 0%, #8b5cf6 100%)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <motion.div
      className="w-12 h-12 rounded-full border-2 border-transparent border-t-accent"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  )
}
