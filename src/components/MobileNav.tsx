import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Plane, BookOpen, Camera } from 'lucide-react'

const SG = "'Space Grotesk', sans-serif"

const TABS = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/travel', label: 'Travel', icon: Plane },
  { path: '/stories', label: 'Stories', icon: BookOpen },
  { path: '/album', label: 'Album', icon: Camera },
]

const HIDDEN_PATHS = ['/story', '/travel/trip', '/free-chat', '/reveal', '/quest', '/login', '/terms', '/privacy', '/characters', '/create-character', '/edit-character']

const ACTIVE = '#c84b9e'
const INACTIVE = 'rgba(255,255,255,0.3)'

export function MobileNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const hidden = pathname === '/' ||
    HIDDEN_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/cast/')

  if (hidden) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-around"
      style={{ height: 64, borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0D0B12', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map((tab) => {
        const active = pathname === tab.path ||
          (tab.path === '/travel' && pathname.startsWith('/travel')) ||
          (tab.path === '/stories' && pathname.startsWith('/stories')) ||
          (tab.path === '/home' && (pathname === '/home' || pathname === '/cast' || pathname === '/account'))
        const color = active ? ACTIVE : INACTIVE
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full cursor-pointer"
          >
            <tab.icon size={20} style={{ color }} />
            <span
              className={`text-[10px] ${active ? 'font-semibold' : 'font-medium'}`}
              style={{ color: active ? '#fff' : 'rgba(255,255,255,0.45)', fontFamily: SG }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
