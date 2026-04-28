import { useNavigate, useLocation } from 'react-router-dom'
import { Sparkles, Compass, BookOpen, Image } from 'lucide-react'

const SG = "'Space Grotesk', sans-serif"

const TABS = [
  { path: '/', label: 'Home', icon: Sparkles },
  { path: '/travel', label: 'Travel', icon: Compass },
  { path: '/stories', label: 'Stories', icon: BookOpen },
  { path: '/album', label: 'Album', icon: Image },
]

const ACTIVE = '#c84b9e'
const INACTIVE = 'rgba(255,255,255,0.3)'

export function MobileNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-center px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: '#0D0B12' }}
    >
      <div className="flex items-center gap-10">
        {TABS.map((tab) => {
          const active = pathname === tab.path
          const color = active ? ACTIVE : INACTIVE
          return (
            <button
              key={tab.path}
              onClick={() => !active && navigate(tab.path)}
              className="cursor-pointer flex flex-col items-center gap-1"
            >
              <tab.icon size={20} style={{ color }} />
              <span
                className={`text-[10px] ${active ? 'font-semibold' : 'font-medium'}`}
                style={{ color, fontFamily: SG }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
