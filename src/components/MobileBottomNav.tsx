import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Plane, BookOpen, Camera } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getMomentConfig } from '../data/storyData'
import { getUniverseGenre } from '../data/storyHelpers'

const HIDDEN_PATHS = ['/story', '/travel/trip', '/free-chat', '/reveal', '/quest', '/login', '/terms', '/privacy', '/characters', '/create-character', '/edit-character']

export function MobileBottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedUniverse = useStore((s) => s.selectedUniverse)
  const albumLabel = getMomentConfig(getUniverseGenre(selectedUniverse)).albumTitle

  const hidden = location.pathname === '/' ||
    HIDDEN_PATHS.some((p) => location.pathname.startsWith(p)) ||
    location.pathname.startsWith('/cast/')

  if (hidden) return null

  const NAV = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Plane, label: 'Travel', path: '/travel' },
    { icon: BookOpen, label: 'Stories', path: '/stories' },
    { icon: Camera, label: albumLabel, path: '/album' },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around"
      style={{ height: 64, background: '#0F0D14', borderTop: '1px solid #2D2538', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV.map((item) => {
        const isActive = location.pathname === item.path ||
          (item.path === '/travel' && location.pathname.startsWith('/travel')) ||
          (item.path === '/stories' && location.pathname.startsWith('/stories')) ||
          (item.path === '/home' && (location.pathname === '/home' || location.pathname === '/cast' || location.pathname === '/account'))
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full cursor-pointer"
          >
            <item.icon
              size={20}
              style={{ color: isActive ? '#c84b9e' : 'rgba(255,255,255,0.4)' }}
            />
            <span
              className="text-[10px]"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
              }}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
