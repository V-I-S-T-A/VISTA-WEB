import { NavLink, useNavigate } from 'react-router-dom'
import { Users, FileText, LogOut } from 'lucide-react'
import { getSidebarConfig } from '../config/navigation'

const ICON_MAP = {
  Users,
  FileText,
}

export default function Sidebar({ role = 'admin' }) {
  const config = getSidebarConfig(role)
  const navigate = useNavigate()

  if (!config) {
    return null
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[275px] flex-col bg-[#1f5aa9] text-white shadow-lg">
      {/* Logo + User Section */}
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-center gap-2.5">
          <img
            src={config.logo}
            alt=""
            className="h-12 w-12 object-contain"
            aria-hidden="true"
          />

          <span className="text-xl font-extrabold tracking-tight">
            {config.brand}
          </span>
        </div>

        <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.15em] text-white/60">
          {config.accessLabel}
        </p>

        <div className="mt-2 flex items-center gap-2.5">
          <img
            src={config.user.avatar}
            alt=""
            className="h-9 w-9 rounded-full object-cover"
            aria-hidden="true"
          />

          <div>
            <p className="text-[13px] font-semibold leading-tight">
              {config.user.name}
            </p>

            <p className="text-[10px] text-white/70">
              ID: {config.user.id}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex flex-1 flex-col">
        {config.navItems.map((item) => {
          const Icon = ICON_MAP[item.icon]

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                [
                  'flex h-10 items-center gap-2.5 px-6 text-[12px] font-bold uppercase tracking-wide transition-colors',
                  isActive || item.active
                    ? 'bg-[#ffc800] text-[#1f2937]'
                    : 'text-white hover:bg-white/10',
                ].join(' ')
              }
            >
              {Icon && (
                <Icon
                  className="h-4 w-4 shrink-0"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              )}

              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto px-6 py-4">
        <button
          type="button"
          onClick={() => navigate(config.logout.path)}
          className="flex w-full items-center gap-2.5 py-2 text-[12px] font-bold uppercase tracking-wide text-white transition-colors hover:text-gray-300"
        >
          <LogOut
            className="h-4 w-4 shrink-0"
            strokeWidth={2}
            aria-hidden="true"
          />

          <span>{config.logout.label}</span>
        </button>
      </div>
    </aside>
  )
}