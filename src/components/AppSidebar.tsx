import { useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, Users, Sparkles, Globe, LogOut, Star, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../store/useStore'
import { CAST_ROSTER, getCastCharacter } from '../data/castRoster'

const NAV_ITEMS = [
  { icon: BookOpen, label: 'My Story', path: '/home' },
  { icon: Users, label: 'Characters To Meet', path: '/cast' },
  { icon: Sparkles, label: 'Your Twins', path: '/characters' },
  { icon: Globe, label: 'Universes', path: '/universes' },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
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
      className="hidden md:flex flex-col shrink-0 h-screen sticky top-0"
      style={{ width: 260, background: '#0F0D14', borderRight: '1px solid #2D2538' }}
    >
      {/* Logo — click to go home */}
      <div
        className="flex items-center gap-2 px-6 h-[72px] cursor-pointer"
        onClick={() => navigate('/home')}
      >
        <div
          className="flex items-center justify-center shrink-0 relative"
          style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(225deg, #c84b9e 0%, #8b5cf6 100%)' }}
        >
          <span className="text-white font-bold" style={{ fontSize: 14, fontFamily: "'Syne', sans-serif" }}>C</span>
          <div className="absolute bg-white rounded-full" style={{ width: 5, height: 5, right: 2, bottom: 2, opacity: 0.9 }} />
        </div>
        <span className="text-white font-semibold" style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, letterSpacing: '-0.02em' }}>
          chaptr
        </span>
      </div>

      {/* Divider */}
      <div className="w-full h-px" style={{ background: '#2D2538' }} />

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
                style={{ color: isActive ? '#c84b9e' : 'rgba(255,255,255,0.33)' }}
              />
              <span
                className="text-[13px]"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.53)',
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
            <p className="text-white/20 text-[10px] font-semibold tracking-[1.5px] uppercase mb-2 px-3">Favorites</p>
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
                    {fav.isGroup ? (
                      <Users size={14} style={{ color: isActive ? '#8b5cf6' : 'rgba(255,255,255,0.25)' }} />
                    ) : fav.portrait ? (
                      <img src={fav.portrait} alt={fav.label} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <MessageCircle size={14} style={{ color: isActive ? '#c84b9e' : 'rgba(255,255,255,0.25)' }} />
                    )}
                    <span
                      className="text-[12px] truncate"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: isActive ? 600 : 400, color: isActive ? '#fff' : 'rgba(255,255,255,0.4)' }}
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

      {/* Logout */}
      <div className="mt-auto px-3 pb-5">
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
