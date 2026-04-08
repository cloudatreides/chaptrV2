import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useActiveStory } from '../hooks/useActiveStory'
import { getQuestById } from '../data/quests'
import { resolveLoveInterestId } from '../data/storyData'
import { ChatScene } from '../components/ChatScene'
import { streamBeatProse, extractTrustData } from '../lib/claudeStream'
import { useStreamingTypewriter } from '../hooks/useTypewriter'
import { trackEvent } from '../lib/supabase'

export function QuestPage() {
  const { questId } = useParams<{ questId: string }>()
  const navigate = useNavigate()
  const quest = questId ? getQuestById(questId) : null

  const {
    loveInterest, bio, selectedUniverse, characterState,
    choiceDescriptions, chatSummaries, questProgress, activeCharacter,
  } = useActiveStory()
  const advanceQuest = useStore((s) => s.advanceQuest)
  const updateTrust = useStore((s) => s.updateTrust)
  const setTrustStatusLabel = useStore((s) => s.setTrustStatusLabel)
  const summariesList = Object.values(chatSummaries)

  const progress = questId ? questProgress[questId] : undefined
  const stepIndex = progress?.currentStep ?? 0

  const [beatDone, setBeatDone] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const { displayed, isTyping, append, finish, reset: resetStream } = useStreamingTypewriter(18)
  const abortRef = useRef<AbortController | null>(null)

  if (!quest || !questId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-textMuted">Quest not found.</p>
      </div>
    )
  }

  if (progress?.completed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 gap-4">
        <p className="text-textPrimary text-lg font-semibold">{quest.title}</p>
        <p className="text-textSecondary text-sm text-center">You've completed this side story.</p>
        <button
          className="choice-btn justify-center"
          onClick={() => navigate(-1)}
        >
          Go back
        </button>
      </div>
    )
  }

  const currentStep = quest.steps[stepIndex]
  if (!currentStep) {
    // All steps done — complete quest
    return <QuestComplete questId={questId} quest={quest} />
  }

  const resolvedCharId = quest.characterId === 'jiwon'
    ? resolveLoveInterestId(loveInterest)
    : quest.characterId

  const storyContext = `SIDE STORY: "${quest.title}". ${quest.contextBrief}` +
    (summariesList.length > 0 ? `\n\nMain story context: ${summariesList.slice(-3).join(' ')}` : '')

  const handleAdvanceStep = () => {
    advanceQuest(questId)
    setBeatDone(false)
    resetStream()
    setIsStreaming(false)
  }

  // Beat generation
  useEffect(() => {
    if (currentStep.type !== 'beat' || beatDone || isStreaming) return

    setIsStreaming(true)
    resetStream()
    abortRef.current = new AbortController()

    const run = async () => {
      try {
        let fullProse = ''
        let jsonBuffer = ''
        const gen = streamBeatProse({
          beatTitle: currentStep.title,
          arcBrief: currentStep.arcBrief,
          choiceHistory: choiceDescriptions,
          chatSummaries: summariesList,
          characterState,
          bio,
          playerName: activeCharacter?.name ?? null,
          loveInterest,
          universeId: selectedUniverse,
          signal: abortRef.current!.signal,
        })

        for await (const chunk of gen) {
          fullProse += chunk
          const text = jsonBuffer + chunk
          const braceIdx = text.lastIndexOf('{')
          if (braceIdx >= 0) {
            const safe = text.slice(0, braceIdx)
            if (safe) append(safe)
            jsonBuffer = text.slice(braceIdx)
          } else {
            append(text)
            jsonBuffer = ''
          }
        }

        if (jsonBuffer && !jsonBuffer.includes('"trustDelta"')) append(jsonBuffer)
        finish()

        const { prose: cleanProse, trustDelta, statusLabel } = extractTrustData(fullProse)
        if (trustDelta !== 0) updateTrust(trustDelta)
        if (statusLabel) setTrustStatusLabel(statusLabel)

        resetStream()
        append(cleanProse)
        finish()
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          append('The story continues...')
          finish()
        }
      } finally {
        setIsStreaming(false)
        setBeatDone(true)
      }
    }
    run()
  }, [stepIndex, currentStep.id])

  return (
    <div className="flex flex-col h-screen h-dvh bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border safe-top">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surfaceAlt transition-colors"
        >
          <ArrowLeft size={18} className="text-textSecondary" />
        </button>
        <div>
          <p className="text-accent text-[10px] font-semibold uppercase tracking-wider">Side Story</p>
          <p className="text-textPrimary text-sm font-medium">{quest.title}</p>
        </div>
      </div>

      {currentStep.type === 'beat' ? (
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <p className="text-textMuted text-xs uppercase tracking-widest mb-4">{currentStep.title}</p>
          <div className="space-y-3 min-h-[80px]">
            {displayed && (
              <p className="text-textPrimary text-base leading-relaxed whitespace-pre-line">
                {displayed}
                {isTyping && <span className="cursor-blink text-accent">|</span>}
              </p>
            )}
          </div>
          {beatDone && !isTyping && (
            <motion.button
              className="choice-btn justify-center mt-6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleAdvanceStep}
            >
              Continue →
            </motion.button>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col" style={{ background: '#0d0a12' }}>
          <ChatScene
            stepId={currentStep.id}
            characterId={resolvedCharId}
            maxExchanges={currentStep.maxExchanges ?? 6}
            minExchanges={currentStep.minExchanges ?? 2}
            storyContext={storyContext}
            onComplete={handleAdvanceStep}
          />
        </div>
      )}
    </div>
  )
}

// ─── Quest completion screen ───

function QuestComplete({ questId, quest }: { questId: string; quest: { title: string; contextBrief: string; characterId: string } }) {
  const navigate = useNavigate()
  const completeQuest = useStore((s) => s.completeQuest)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Generate a brief summary and complete
    const summary = `Side story "${quest.title}" completed. ${quest.contextBrief.slice(0, 120)}...`
    completeQuest(questId, summary)
    setDone(true)
    trackEvent('quest_completed', { questId })
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 gap-5">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <p className="text-accent text-xs font-semibold uppercase tracking-wider mb-2">Side Story Complete</p>
        <p className="text-textPrimary text-xl font-semibold">{quest.title}</p>
        <p className="text-textSecondary text-sm mt-2">This moment will stay with them.</p>
      </motion.div>
      {done && (
        <motion.button
          className="choice-btn justify-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate(-1)}
        >
          Back to story
        </motion.button>
      )}
    </div>
  )
}
