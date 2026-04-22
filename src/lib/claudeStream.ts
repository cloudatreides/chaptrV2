// Barrel re-export — all implementations live in src/lib/claude/
export {
  stripMarkdown,
  extractTrustData,
  streamSSE,
  makeClaudeRequest,
  buildMemoryPrompt,
  parseAffinityDelta,
  streamBeatProse,
  buildChatSystemPrompt,
  generateOpeningMessage,
  streamChatReply,
  summarizeChat,
  generateGroupReaction,
  extractMemories,
  generateRevealSignature,
  generateLoveLetter,
} from './claude'

export type {
  AffinityParseResult,
  StreamBeatParams,
  StreamChatParams,
  OpeningMessageParams,
  SummarizeChatParams,
  RevealSignatureParams,
} from './claude'
