import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ArrowRight } from 'lucide-react'
import { getCharacter, CHARACTERS } from '../data/characters'
import { useStore } from '../store/useStore'
import { useActiveStory } from '../hooks/useActiveStory'
import { streamChatReply, generateGroupReaction, extractMemories, generateLoveLetter } from '../lib/claudeStream'
import { generateCharacterPortrait, generateSceneImage } from '../lib/togetherAi'
import { trackEvent } from '../lib/supabase'
import { getAffinityGrowth } from '../lib/affinity'
import { parseAffinityDelta } from '../lib/claudeStream'
import { getUniverseGenre } from '../data/storyData'
import type { SceneCharacter } from '../data/storyData'
import { ChatActionTray } from './ChatActionTray'
import { ChatActionBubble } from './ChatActionBubble'
import { ChatReactionImage } from './ChatReactionImage'
import { useChatActions } from '../hooks/useChatActions'
import type { ChatAction } from '../data/chatActions'

// ─── Types ───

interface GroupMessage {
  id: string
  role: 'user' | 'character'
  content: string
  characterId?: string // for character messages
  actionData?: { label: string; emoji: string; gemCost: number; memeText?: string | null; dareText?: string | null }
  letterContent?: string
  reactionImageUrl?: string
}

interface Props {
  stepId: string
  characters: SceneCharacter[]
  minExchanges?: number
  storyContext: string
  onComplete: () => void
}

// ─── Component ───

export function GroupChatScene({ stepId: _stepId, characters, minExchanges = 2, storyContext, onComplete }: Props) {
  const { bio, loveInterest, selectedUniverse, selfieUrl, characterState, characterPortraits, characterAffinities, characterMemories } = useActiveStory()
  const addChatMessage = useStore((s) => s.addChatMessage)
  const setCharacterPortrait = useStore((s) => s.setCharacterPortrait)
  const updateAffinity = useStore((s) => s.updateAffinity)
  const addCharacterMemory = useStore((s) => s.addCharacterMemory)
  const globalAffinities = useStore((s) => s.globalAffinities)
  const playthroughHistory = useStore((s) => s.playthroughHistory)
  const addStoryMoment = useStore((s) => s.addStoryMoment)
  const previousPlaythroughs = playthroughHistory.filter((pt) => pt.universeId === selectedUniverse)
  const playerCharacter = useStore((s) => s.characters[0])
  const playerGender = playerCharacter?.gender ?? 'male'

  const primaryCharIdForActions = characters[0]?.characterId ?? ''
  const primaryCharDataForActions = getCharacter(primaryCharIdForActions, selectedUniverse) ?? CHARACTERS[primaryCharIdForActions]
  const primaryCharGender = primaryCharDataForActions?.gender ?? 'unknown'
  const { executeAction, checkCooldown, gemBalance, isLetterAction } = useChatActions({
    characterId: primaryCharIdForActions,
    universeId: selectedUniverse,
    characterMemories: characterMemories[primaryCharIdForActions] ?? [],
  })

  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamingCharId, setStreamingCharId] = useState<string | null>(null)
  const [streamedReply, setStreamedReply] = useState('')
  const [exchangeCount, setExchangeCount] = useState(0)
  const [primaryCharIndex, setPrimaryCharIndex] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const canContinue = exchangeCount >= minExchanges && !isTyping
  const [showContinue, setShowContinue] = useState(false)

  // Delay showing the continue button so it doesn't interrupt active chatting
  useEffect(() => {
    if (!canContinue) { setShowContinue(false); return }
    const timer = setTimeout(() => setShowContinue(true), 10000)
    return () => clearTimeout(timer)
  }, [canContinue])

  // ─── Generate character portraits ───

  useEffect(() => {
    for (const sc of characters) {
      const p = characterPortraits[sc.characterId]
      const charData = getCharacter(sc.characterId, selectedUniverse) ?? CHARACTERS[sc.characterId]
      if (charData?.staticPortrait) {
        if (p !== charData.staticPortrait) setCharacterPortrait(sc.characterId, charData.staticPortrait)
        continue
      }
      if (p) continue
      if (charData?.portraitPrompt) {
        generateCharacterPortrait(charData.portraitPrompt).then(url => {
          if (url) setCharacterPortrait(sc.characterId, url)
        })
      }
    }
  }, [])

  // ─── Auto-scroll ───

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
    return () => clearTimeout(timer)
  }, [messages, streamedReply])

  // ─── Build thread context for group prompts ───

  function buildThreadContext(msgs: GroupMessage[]): string {
    return msgs.slice(-8).map(m => {
      if (m.role === 'user') return `Protagonist: ${m.content}`
      const charData = getCharacter(m.characterId ?? '', selectedUniverse) ?? CHARACTERS[m.characterId ?? '']
      const name = charData?.name ?? m.characterId ?? 'Character'
      return `${name}: ${m.content}`
    }).join('\n')
  }

  function buildGroupContext(forCharId: string): string {
    const others = characters.filter(sc => sc.characterId !== forCharId)
    const otherNames = others.map(sc => {
      const charData = getCharacter(sc.characterId, selectedUniverse) ?? CHARACTERS[sc.characterId]
      return charData?.name ?? sc.characterId
    }).join(', ')
    const threadCtx = buildThreadContext(messages)
    return `GROUP SCENE — Multiple characters are present: ${otherNames} and others. Everyone is talking together in the same space. Keep your response short — this is a group conversation, not a one-on-one.${threadCtx ? `\n\nRecent conversation:\n${threadCtx}` : ''}`
  }

  // ─── Send message ───

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMsg = input.trim()
    setInput('')

    const userMessage: GroupMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMsg,
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    addChatMessage({ role: 'user', content: userMsg, characterId: 'user', timestamp: Date.now() })

    setIsTyping(true)
    setStreamedReply('')

    const newExchange = exchangeCount + 1

    // Pick primary responder via rotation
    const primaryIdx = primaryCharIndex % characters.length
    const primaryChar = characters[primaryIdx]
    const primaryCharId = primaryChar.characterId
    const maxEx = primaryChar.maxExchanges ?? 999

    setStreamingCharId(primaryCharId)

    // Build message history: user-only messages as 'user', everything else as 'assistant'
    const claudeMessages = newMessages.map(m => ({
      role: m.role === 'user' ? 'user' as const : 'character' as const,
      content: m.content,
      characterId: m.characterId ?? 'user',
      timestamp: Date.now(),
    }))

    const groupCtx = buildGroupContext(primaryCharId)

    abortRef.current = new AbortController()
    try {
      let fullReply = ''
      const gen = streamChatReply({
        characterId: primaryCharId,
        messages: claudeMessages,
        storyContext,
        exchangeNumber: newExchange,
        maxExchanges: maxEx,
        characterState,
        bio,
        loveInterest,
        universeId: selectedUniverse,
        signal: abortRef.current.signal,
        sceneContext: groupCtx,
        affinityScore: characterAffinities[primaryCharId] ?? 0,
        characterMemories: characterMemories[primaryCharId] ?? [],
        globalAffinityScore: globalAffinities[primaryCharId] ?? 0,
        previousPlaythroughs,
        genre: getUniverseGenre(selectedUniverse),
      })

      for await (const chunk of gen) {
        fullReply += chunk
        setStreamedReply(fullReply)
      }

      const { content: cleanReply } = parseAffinityDelta(fullReply)
      const primaryMsg: GroupMessage = {
        id: `char-${primaryCharId}-${Date.now()}`,
        role: 'character',
        content: cleanReply,
        characterId: primaryCharId,
      }

      const messagesAfterPrimary = [...newMessages, primaryMsg]
      setMessages(messagesAfterPrimary)
      addChatMessage({ role: 'character', content: cleanReply, characterId: primaryCharId, timestamp: Date.now() })
      setStreamedReply('')
      setStreamingCharId(null)
      updateAffinity(primaryCharId, getAffinityGrowth(newExchange))
      trackEvent('group_chat_exchange', { primaryCharId, exchange: newExchange })

      // Advance rotation
      const nextIdx = (primaryIdx + 1) % characters.length
      setPrimaryCharIndex(nextIdx)
      setExchangeCount(newExchange)

      // Extract memories every 2nd exchange
      if (newExchange % 2 === 0) {
        const msgsForExtraction = [
          ...claudeMessages,
          { role: 'character' as const, content: fullReply, characterId: primaryCharId, timestamp: Date.now() },
        ]
        extractMemories({ characterId: primaryCharId, messages: msgsForExtraction })
          .then((facts) => facts.forEach((f) => addCharacterMemory(primaryCharId, f)))
          .catch(() => {})
      }

      // AI-to-AI reaction (30% chance if multiple characters)
      if (characters.length > 1 && Math.random() < 0.3) {
        const reactorChar = characters[(nextIdx) % characters.length]
        const reactorId = reactorChar.characterId
        if (reactorId !== primaryCharId) {
          const threadCtx = buildThreadContext(messagesAfterPrimary)
          const reaction = await generateGroupReaction({
            characterId: reactorId,
            threadContext: threadCtx,
            storyContext,
            universeId: selectedUniverse,
            loveInterest,
          })
          if (reaction) {
            const reactionMsg: GroupMessage = {
              id: `char-${reactorId}-reaction-${Date.now()}`,
              role: 'character',
              content: reaction,
              characterId: reactorId,
            }
            setMessages(prev => [...prev, reactionMsg])
            addChatMessage({ role: 'character', content: reaction, characterId: reactorId, timestamp: Date.now() })
          }
        }
      }

    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        const fallback: GroupMessage = {
          id: `char-err-${Date.now()}`,
          role: 'character',
          content: '...',
          characterId: primaryCharId,
        }
        setMessages(prev => [...prev, fallback])
        setStreamedReply('')
        setStreamingCharId(null)
      }
    } finally {
      setIsTyping(false)
      setStreamingCharId(null)
    }
  }

  // ─── Handle action ───

  const handleAction = async (action: ChatAction) => {
    if (isTyping) return
    const result = executeAction(action)
    if (!result) return

    // For love-letter actions, generate letter content first
    let letterContent: string | null = null
    if (isLetterAction(action.id)) {
      setIsTyping(true)
      const primaryCharId = characters[0]?.characterId ?? ''
      const primaryChar = getCharacter(primaryCharId, selectedUniverse) ?? CHARACTERS[primaryCharId]
      letterContent = await generateLoveLetter({
        characterName: primaryChar?.name ?? '',
        bio,
        characterMemories: characterMemories[primaryCharId] ?? [],
        affinityScore: characterAffinities[primaryCharId] ?? 0,
        isNote: action.label === 'Slip a Note',
        recentMessages: messages.slice(-10).map(m => ({ role: m.role === 'user' ? 'user' : 'character', content: m.content })),
      })
      result.promptInjection = `wrote you a heartfelt ${action.label === 'Slip a Note' ? 'note' : 'letter'}. Here is what it says: "${letterContent}"\n\nRead this carefully and react with deep, genuine emotion. Quote specific parts that moved you. This is vulnerable and real.`
      setIsTyping(false)
    }

    const actionMessage: GroupMessage = {
      id: `action-${Date.now()}`,
      role: 'user',
      content: `[ACTION: ${result.label}]`,
      actionData: { label: result.label, emoji: result.emoji, gemCost: result.gemCost, memeText: result.memeText, dareText: result.dareText },
      letterContent: letterContent ?? undefined,
    }
    const newMessages = [...messages, actionMessage]
    setMessages(newMessages)
    addChatMessage({ role: 'user', content: letterContent ? `[ACTION: ${result.label}]\n${letterContent}` : `[ACTION: ${result.label}]`, characterId: 'user', timestamp: Date.now() })

    setIsTyping(true)
    setStreamedReply('')
    const newExchange = exchangeCount + 1
    const primaryIdx = primaryCharIndex % characters.length
    const primaryChar = characters[primaryIdx]
    const primaryCharId = primaryChar.characterId
    setStreamingCharId(primaryCharId)

    const claudeMessages = newMessages.map(m => ({
      role: m.role === 'user' ? 'user' as const : 'character' as const,
      content: m.content,
      characterId: m.characterId ?? 'user',
      timestamp: Date.now(),
    }))
    const groupCtx = buildGroupContext(primaryCharId)

    abortRef.current = new AbortController()
    try {
      let fullReply = ''
      const gen = streamChatReply({
        characterId: primaryCharId,
        messages: claudeMessages,
        storyContext: storyContext + `\n\nACTION CONTEXT: The protagonist just ${result.promptInjection}\nReact naturally and in character. Do NOT include an [AFFINITY] tag.`,
        exchangeNumber: newExchange,
        maxExchanges: primaryChar.maxExchanges ?? 999,
        characterState, bio, loveInterest,
        universeId: selectedUniverse,
        signal: abortRef.current.signal,
        sceneContext: groupCtx,
        affinityScore: characterAffinities[primaryCharId] ?? 0,
        characterMemories: characterMemories[primaryCharId] ?? [],
        globalAffinityScore: globalAffinities[primaryCharId] ?? 0,
        previousPlaythroughs,
        genre: getUniverseGenre(selectedUniverse),
      })
      for await (const chunk of gen) { fullReply += chunk; setStreamedReply(fullReply) }

      const cleanReply = fullReply.replace(/\n?\[AFFINITY:[+-]?\d+\]\s*$/, '').trim()
      const primaryMsg: GroupMessage = { id: `char-${primaryCharId}-${Date.now()}`, role: 'character', content: cleanReply, characterId: primaryCharId }
      setMessages(prev => [...prev, primaryMsg])
      addChatMessage({ role: 'character', content: cleanReply, characterId: primaryCharId, timestamp: Date.now() })
      setStreamedReply('')
      setStreamingCharId(null)
      updateAffinity(primaryCharId, result.affinityBoost)
      setPrimaryCharIndex((primaryIdx + 1) % characters.length)
      setExchangeCount(newExchange)
      trackEvent('chat_action', { characterId: primaryCharId, actionId: action.id, affinityBoost: result.affinityBoost })

      // Generate reaction image for romantic actions
      if (result.reactionImagePrompt) {
        generateCharacterPortrait(result.reactionImagePrompt).then((imgUrl) => {
          if (imgUrl) {
            setMessages(prev => [...prev, { id: `reaction-${Date.now()}`, role: 'character', content: '', characterId: primaryCharId, reactionImageUrl: imgUrl }])
          }
        })
      }

      // Generate scene image with both characters (e.g. coffee) using Kontext
      if (result.sceneImagePrompt && selfieUrl) {
        generateSceneImage({
          prompt: result.sceneImagePrompt,
          referenceImageUrl: selfieUrl,
          protagonistGender: playerGender,
          width: 768,
          height: 576,
        }).then((imgUrl) => {
          if (imgUrl) {
            setMessages(prev => [...prev, { id: `scene-${Date.now()}`, role: 'character', content: '', characterId: primaryCharId, reactionImageUrl: imgUrl }])
          }
        })
      }
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: 'character', content: '...', characterId: primaryCharId }])
        setStreamedReply('')
        setStreamingCharId(null)
      }
    } finally { setIsTyping(false); setStreamingCharId(null) }
  }

  // ─── Render helpers ───

  function CharAvatar({ characterId, size = 'sm' }: { characterId: string; size?: 'sm' | 'md' }) {
    const charData = getCharacter(characterId, selectedUniverse) ?? CHARACTERS[characterId]
    const portrait = characterPortraits[characterId] ?? null
    const dim = size === 'md' ? 'w-8 h-8' : 'w-7 h-7'
    return (
      <div className={`${dim} rounded-full overflow-hidden shrink-0`} style={{ background: 'rgba(200,75,158,0.15)' }}>
        {portrait
          ? <img src={portrait} alt={charData?.name} className="w-full h-full object-cover" />
          : <span className="w-full h-full flex items-center justify-center text-xs">{charData?.avatar ?? '💬'}</span>}
      </div>
    )
  }

  // ─── Render ───

  return (
    <div className="flex flex-col h-full">
      {/* Header — all characters listed */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border flex-wrap">
        {characters.map(sc => {
          const charData = getCharacter(sc.characterId, selectedUniverse) ?? CHARACTERS[sc.characterId]
          return (
            <div key={sc.characterId} className="flex items-center gap-1.5">
              <CharAvatar characterId={sc.characterId} size="md" />
              <div>
                <p className="text-textPrimary text-xs font-semibold leading-tight">{charData?.name ?? sc.characterId}</p>
                {/* Affinity shown in sidebar */}
              </div>
            </div>
          )
        })}
        <span className="ml-auto text-[10px] text-textMuted italic">group chat</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const charData = msg.characterId ? (getCharacter(msg.characterId, selectedUniverse) ?? CHARACTERS[msg.characterId]) : null
          return (
            <motion.div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Character name label */}
              {msg.role === 'character' && charData && (
                <span className="text-[10px] text-textMuted mb-0.5 ml-9">{charData.name}</span>
              )}
              <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'character' && msg.characterId && (
                  <CharAvatar characterId={msg.characterId} />
                )}
                {msg.reactionImageUrl ? (
                  <ChatReactionImage
                    imageUrl={msg.reactionImageUrl}
                    characterName={charData?.name ?? ''}
                    onSaveToAlbum={() => addStoryMoment({
                      id: `reaction-${Date.now()}`,
                      imageUrl: msg.reactionImageUrl!,
                      characterIds: [msg.characterId ?? ''],
                      universeId: selectedUniverse ?? '',
                      beatLabel: `${charData?.name ?? 'Character'} reacted`,
                      note: '',
                      timestamp: Date.now(),
                    })}
                  />
                ) : msg.actionData ? (
                  <div className="flex flex-col items-end gap-1.5">
                    <ChatActionBubble label={msg.actionData.label} emoji={msg.actionData.emoji} gemCost={msg.actionData.gemCost} memeText={msg.actionData.memeText} dareText={msg.actionData.dareText} />
                    {msg.letterContent && (
                      <div
                        className="max-w-[300px] px-4 py-3 rounded-2xl text-[13px] leading-relaxed italic"
                        style={{
                          background: 'linear-gradient(135deg, rgba(200,75,158,0.12), rgba(139,92,246,0.12))',
                          border: '1px solid rgba(200,75,158,0.2)',
                          color: 'rgba(255,255,255,0.85)',
                        }}
                      >
                        <span className="text-[10px] not-italic font-medium block mb-1.5" style={{ color: 'rgba(200,75,158,0.6)' }}>
                          💌 Your letter
                        </span>
                        {msg.letterContent}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-character'}`}>
                    {msg.content}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}

        {/* Streaming reply */}
        {isTyping && streamedReply && streamingCharId && (
          <motion.div className="flex flex-col items-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {(() => {
              const charData = getCharacter(streamingCharId, selectedUniverse) ?? CHARACTERS[streamingCharId]
              return (
                <>
                  <span className="text-[10px] text-textMuted mb-0.5 ml-9">{charData?.name ?? streamingCharId}</span>
                  <div className="flex items-end gap-2 justify-start">
                    <CharAvatar characterId={streamingCharId} />
                    <div className="chat-bubble chat-bubble-character">
                      {streamedReply.replace(/\n?\[AFFINITY:[+-]?\d+\]\s*$/, '')}
                      <span className="cursor-blink text-accent ml-0.5">|</span>
                    </div>
                  </div>
                </>
              )
            })()}
          </motion.div>
        )}

        {/* Typing dots */}
        {isTyping && !streamedReply && streamingCharId && (
          <motion.div className="flex flex-col items-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {(() => {
              const charData = getCharacter(streamingCharId, selectedUniverse) ?? CHARACTERS[streamingCharId]
              return (
                <>
                  <span className="text-[10px] text-textMuted mb-0.5 ml-9">{charData?.name ?? streamingCharId}</span>
                  <div className="flex items-end gap-2 justify-start">
                    <CharAvatar characterId={streamingCharId} />
                    <div className="chat-bubble chat-bubble-character flex gap-1">
                      <span className="typing-dot" style={{ animationDelay: '0ms' }} />
                      <span className="typing-dot" style={{ animationDelay: '150ms' }} />
                      <span className="typing-dot" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </>
              )
            })()}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 pb-6 pt-3 border-t border-border safe-bottom space-y-2">
        <AnimatePresence>
          {showContinue && (
            <motion.button
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium border border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 transition-colors"
              onClick={onComplete}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              Continue the story <ArrowRight size={14} />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="flex gap-2 relative">
          <ChatActionTray
            playerGender={playerGender}
            characterGender={primaryCharGender}
            affinityScore={characterAffinities[primaryCharIdForActions] ?? 0}
            gemBalance={gemBalance}
            genre={getUniverseGenre(selectedUniverse)}
            isOnCooldown={checkCooldown}
            onAction={handleAction}
            disabled={isTyping}
          />
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Say something..."
            className="flex-1 bg-surfaceAlt border border-border rounded-xl px-4 py-3 text-textPrimary text-base placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors"
            disabled={isTyping}
            autoFocus
            enterKeyHint="send"
            autoComplete="off"
            autoCorrect="off"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
