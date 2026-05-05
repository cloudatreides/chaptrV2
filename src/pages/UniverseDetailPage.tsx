import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, BookOpen, Users, Clock, Heart } from 'lucide-react'
import { UNIVERSES } from '../data/storyData'
import { STORY_REGISTRY } from '../data/stories'
import { CAST_ROSTER, getCastCharacter } from '../data/castRoster'

export function UniverseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const universe = UNIVERSES.find((u) => u.id === id)
  if (!universe) {
    return (
      <div className="min-h-screen min-h-dvh bg-bg flex items-center justify-center">
        <p className="text-textSecondary">Universe not found.</p>
      </div>
    )
  }

  const storyData = STORY_REGISTRY[universe.id]
  const storyCharacters = storyData ? Object.values(storyData.characters) : []
  const castMembers = CAST_ROSTER.filter((c) => c.universeId === universe.id)
  const stepCount = storyData?.steps.length ?? 0

  return (
    <div className="min-h-screen min-h-dvh bg-bg flex flex-col">
      <div className="flex flex-col flex-1 w-full max-w-[520px] mx-auto relative">
        {/* Hero Image */}
        <div className="relative h-[280px] w-full">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${universe.image})` }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(13,10,18,0) 30%, rgba(13,10,18,1) 100%)' }}
          />

          {/* Back button */}
          <button
            onClick={() => navigate('/home')}
            className="absolute top-[52px] left-4 w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors z-10"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Genre tag */}
          <div className="absolute bottom-5 left-5">
            <span
              className="text-[11px] font-bold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(200,75,158,0.4)', color: '#f0ecf8', backdropFilter: 'blur(4px)' }}
            >
              {universe.genreTag}
            </span>
          </div>
        </div>

        {/* Content */}
        <div
          className="px-5 flex flex-col gap-7 -mt-2"
          style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom))' }}
        >
          {/* Title Section */}
          <div className="flex flex-col gap-3">
            <motion.h1
              className="text-textPrimary font-extrabold text-[28px] leading-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {universe.title}
            </motion.h1>

            {/* Meta row */}
            <motion.div
              className="flex items-center gap-1.5 text-textSecondary text-[13px] flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 }}
            >
              <BookOpen size={14} />
              <span>{stepCount} chapters</span>
              <span className="mx-1">·</span>
              <Users size={14} />
              <span>{storyCharacters.length} characters</span>
              <span className="mx-1">·</span>
              <Clock size={14} />
              <span>~{Math.round(stepCount * 2.5)} min</span>
            </motion.div>

            {/* Chapter count */}
            {universe.chapters && universe.chapters > 1 && (
              <motion.div
                className="flex items-center gap-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <BookOpen size={14} className="text-accent" />
                <span className="text-accent text-[13px] font-semibold">
                  {universe.chapters} chapters available
                </span>
              </motion.div>
            )}

            {/* Trust metric hint */}
            {storyData && (
              <motion.div
                className="flex items-center gap-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <Heart size={14} className="text-accent" />
                <span className="text-accent text-[13px] font-semibold">
                  Track your {storyData.trustLabel}
                </span>
              </motion.div>
            )}
          </div>

          {/* Story Premise */}
          <motion.div
            className="flex flex-col gap-2.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-textSecondary text-[11px] font-bold tracking-widest">THE STORY</h2>
            <p className="text-[14px] leading-relaxed" style={{ color: '#c4b8d9' }}>
              {universe.description}
            </p>
            <p className="text-[14px] leading-relaxed" style={{ color: '#c4b8d9' }}>
              {universe.longDescription}
            </p>
          </motion.div>

          {/* Meet the Cast */}
          <motion.div
            className="flex flex-col gap-3.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-textSecondary text-[11px] font-bold tracking-widest">MEET THE CAST</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1" style={{ scrollbarWidth: 'none' }}>
              {castMembers.map((member) => (
                <div
                  key={member.id}
                  className="shrink-0 flex flex-col gap-2.5 p-4 rounded-2xl"
                  style={{ background: '#1a1525', border: '1px solid #2a2040', width: '140px' }}
                >
                  {/* Avatar */}
                  {(() => {
                    const char = getCastCharacter(member)
                    return char?.staticPortrait ? (
                      <div className="w-14 h-14 rounded-full overflow-hidden shrink-0" style={{ background: '#13101c' }}>
                        <img src={char.staticPortrait} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ background: '#13101c' }}>
                        {char?.avatar ?? '👤'}
                      </div>
                    )
                  })()}
                  <div>
                    <p className="text-textPrimary text-[14px] font-bold">{member.name}</p>
                    <p className="text-textSecondary text-[11px] font-medium mt-0.5">
                      {member.universeLabel}
                    </p>
                  </div>
                  <p className="text-[12px] leading-snug line-clamp-3" style={{ color: '#c4b8d9' }}>
                    {member.bio}
                  </p>
                </div>
              ))}

              {/* Mystery character */}
              <div
                className="shrink-0 flex flex-col gap-2.5 p-4 rounded-2xl"
                style={{ background: '#13101c', border: '1px dashed #2a2040', width: '140px' }}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#1a1525' }}>
                  <span className="text-2xl font-bold" style={{ color: '#9b8db844' }}>?</span>
                </div>
                <div>
                  <p className="text-[14px] font-bold" style={{ color: '#9b8db866' }}>???</p>
                  <p className="text-[11px] font-medium mt-0.5" style={{ color: '#9b8db844' }}>Locked</p>
                </div>
                <p className="text-[12px] leading-snug" style={{ color: '#9b8db866' }}>
                  Play to discover who else awaits you.
                </p>
              </div>
            </div>
          </motion.div>

          {/* What to Expect */}
          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-textSecondary text-[11px] font-bold tracking-widest">WHAT TO EXPECT</h2>
            <div className="flex flex-wrap gap-2">
              {universe.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3.5 py-2 rounded-full text-[12px] font-medium"
                  style={{ background: '#1a1525', border: '1px solid #2a2040', color: '#c4b8d9' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="flex flex-col gap-2.5 pt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              disabled
              className="flex items-center justify-center gap-2.5 h-[52px] rounded-[14px] text-base font-bold cursor-not-allowed"
              style={{
                background: '#1a1525',
                border: '1px solid #2a2040',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              <Clock size={18} />
              Coming soon
            </button>
            <p className="text-textSecondary text-[12px] text-center font-medium">
              Story mode launches soon — Travel mode is live
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
