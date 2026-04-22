import { useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, Users, Sparkles, Camera, LogOut, Star, MessageCircle, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../store/useStore'
import { CAST_ROSTER, getCastCharacter } from '../data/castRoster'
import { getMomentConfig } from '../data/storyData'
import { getUniverseGenre } from '../data/storyHelpers'

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const characters = useStore((s) => s.characters)
  const activeCharacterId = useStore((s) => s.activeCharacterId)
  const activeChar = characters.find((c) => c.id === activeCharacterId)
  const selectedUniverse = useStore((s) => s.selectedUniverse)
  const albumLabel = getMomentConfig(getUniverseGenre(selectedUniverse)).albumTitle
  const NAV_ITEMS = [
    { icon: BookOpen, label: 'Home', path: '/home' },
    { icon: Sparkles, label: 'Travel Mode', path: '/travel' },
    { icon: BookOpen, label: 'Story Mode', path: '/stories' },
    { icon: Users, label: 'Characters To Meet', path: '/cast' },
    { icon: Camera, label: albumLabel, path: '/album' },
  ]
  const favoriteCastIds = useStore((s) => s.favoriteCastIds)
  const castChatThreads = useStore((s) => s.castChatThreads)
  const groupCastThreads = useStore((s) => s.groupCastThreads)

  // Build favorite items
  const favoriteItems = favoriteCastIds.map((id) => {
    const isGroup = id.includes('+')
    if (isGroup) {
      const charIds = id.split('+')
      const members = charIds.map((cid) => CAST_ROSTER.find((c) => c.id === cid)).filter(Boolean)
      const names = members.map((m) => m!.name).join(' & ')
      const hasMessages = (groupCastThreads[id]?.length ?? 0) > 0
      return { id, label: names, path: `/cast/group/${id}`, isGroup: true, hasMessages, portrait: null, members }
    }
    const cast = CAST_ROSTER.find((c) => c.id === id)
    const charData = cast ? getCastCharacter(cast) : null
    const hasMessages = (castChatThreads[id]?.length ?? 0) > 0
    return { id, label: charData?.name ?? id, path: `/cast/${id}`, isGroup: false, hasMessages, portrait: charData?.staticPortrait ?? null, members: null }
  }).filter((f) => f.hasMessages)

  return (
    <div
      className="hidden md:flex flex-col shrink-0 h-full"
      style={{ width: 260, background: '#0F0D14', borderRight: '1px solid #2D2538' }}
    >
      {/* Logo — click to go home */}
      <div
        className="flex items-center gap-2 px-6 h-[72px] cursor-pointer"
        onClick={() => navigate('/home')}
      >
        <div className="relative shrink-0" style={{ width: 28, height: 28 }}>
          <div className="absolute" style={{ width: 17, height: 21, borderRadius: 3, background: '#7C3AED', transform: 'rotate(8deg)', top: 0, left: 5 }} />
          <div className="absolute" style={{ width: 17, height: 21, borderRadius: 3, background: '#A78BFA', transform: 'rotate(3deg)', top: 1.5, left: 3.5 }} />
          <div className="absolute" style={{ width: 17, height: 21, borderRadius: 3, background: '#E9D5FF', top: 3, left: 2 }} />
        </div>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, letterSpacing: '-0.02em', background: 'linear-gradient(180deg, #D4C4F0 0%, #B8A5E0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="font-semibold">
          chaptr
        </span>
      </div>

      {/* Divider */}
      <div className="w-full h-px" style={{ background: '#2D2538' }} />

      {/* Scrollable middle section */}
      <div className="flex-1 overflow-y-auto">
      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/cast' && location.pathname.startsWith('/cast'))
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="cursor-pointer flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors"
              style={{
                background: isActive ? 'rgba(200,75,158,0.08)' : 'transparent',
              }}
            >
              <item.icon
                size={18}
                style={{ color: isActive ? '#c84b9e' : 'rgba(255,255,255,0.5)' }}
              />
              <span
                className="text-[13px]"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Favorites */}
      {favoriteItems.length > 0 && (
        <>
          <div className="w-full h-px mx-auto mt-2" style={{ background: '#2D2538' }} />
          <div className="px-3 py-3">
            <p className="text-white/40 text-[10px] font-semibold tracking-[1.5px] uppercase mb-2 px-3">Favorites</p>
            <div className="flex flex-col gap-0.5">
              {favoriteItems.map((fav) => {
                const isActive = location.pathname === fav.path
                return (
                  <button
                    key={fav.id}
                    onClick={() => navigate(fav.path)}
                    className="cursor-pointer flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.03]"
                    style={{ background: isActive ? 'rgba(139,92,246,0.08)' : 'transparent' }}
                  >
                    {fav.isGroup && fav.members && fav.members.length > 0 ? (
                      <div className="flex -space-x-1.5 shrink-0">
                        {fav.members.slice(0, 3).map((m) => {
                          const charData = getCastCharacter(m!)
                          return charData?.staticPortrait ? (
                            <img key={m!.id} src={charData.staticPortrait} alt={m!.name} className="w-5 h-5 rounded-full object-cover" style={{ border: '1.5px solid #0F0D14' }} />
                          ) : (
                            <div key={m!.id} className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] text-white/60" style={{ background: '#2D2538', border: '1.5px solid #0F0D14' }}>{m!.name[0]}</div>
                          )
                        })}
                      </div>
                    ) : fav.portrait ? (
                      <img src={fav.portrait} alt={fav.label} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <MessageCircle size={14} style={{ color: isActive ? '#c84b9e' : 'rgba(255,255,255,0.5)' }} />
                    )}
                    <span
                      className="text-[12px] truncate"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: isActive ? 600 : 400, color: isActive ? '#fff' : 'rgba(255,255,255,0.6)' }}
                    >
                      {fav.label}
                    </span>
                    <Star size={10} className="ml-auto text-yellow-400/50 fill-yellow-400/50 shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      </div>{/* end scrollable middle */}

      {/* Account + Logout — pinned to bottom */}
      <div className="shrink-0 px-3 pb-5">
        <div className="w-full h-px mb-3" style={{ background: '#2D2538' }} />
        <button
          onClick={() => navigate('/account')}
          className="cursor-pointer flex items-center gap-2.5 rounded-lg px-3 py-2.5 w-full text-left transition-colors hover:bg-white/[0.03]"
          style={{ background: location.pathname === '/account' ? 'rgba(200,75,158,0.08)' : 'transparent' }}
        >
          {activeChar?.selfieUrl ? (
            <img src={activeChar.selfieUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
          ) : user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <User size={18} style={{ color: location.pathname === '/account' ? '#c84b9e' : 'rgba(255,255,255,0.33)' }} />
          )}
          <span
            className="text-[13px] truncate"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: location.pathname === '/account' ? 600 : 500,
              color: location.pathname === '/account' ? '#fff' : 'rgba(255,255,255,0.53)',
            }}
          >
            {user?.user_metadata?.full_name?.split(' ')[0] ?? 'Account'}
          </span>
        </button>
        <button
          onClick={() => signOut()}
          className="cursor-pointer flex items-center gap-2.5 rounded-lg px-3 py-2.5 w-full text-left transition-colors hover:bg-white/[0.03]"
        >
          <LogOut size={18} style={{ color: 'rgba(255,255,255,0.33)' }} />
          <span
            className="text-[13px]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, color: 'rgba(255,255,255,0.53)' }}
          >
            Log out
          </span>
        </button>
      </div>
    </div>
  )
}
