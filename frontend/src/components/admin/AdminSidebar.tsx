// frontend/src/components/admin/AdminSidebar.tsx
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, BarChart2, Megaphone, ClipboardList, Settings as SettingsIcon, LogOut } from 'lucide-react'
import { useAdminStore } from '../../store/admin'

const NAV_ITEMS = [
  { to: `/${__ADMIN_PATH__}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
  { to: `/${__ADMIN_PATH__}/members`, label: 'Members', icon: Users },
  { to: `/${__ADMIN_PATH__}/data-viz`, label: 'Data Visualization', icon: BarChart2 },
  { to: `/${__ADMIN_PATH__}/announcements`, label: 'Announcements', icon: Megaphone },
  { to: `/${__ADMIN_PATH__}/audit-log`, label: 'Audit Log', icon: ClipboardList },
  { to: `/${__ADMIN_PATH__}/settings`, label: 'Settings', icon: SettingsIcon },
]

export function AdminSidebar() {
  const navigate = useNavigate()
  const { logout } = useAdminStore()

  async function handleLogout() {
    await logout()
    navigate(`/${__ADMIN_PATH__}/login`, { replace: true })
  }

  return (
    <aside
      style={{ width: '240px', minWidth: '240px' }}
      className="flex flex-col h-full bg-sbg-surface border-r border-white/[0.06]"
    >
      {/* Logo + Title */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <img src="/sbg-logo-white.svg" alt="SBG" className="h-7 w-7 flex-shrink-0" />
        <div>
          <p className="font-sans font-bold text-white text-sm leading-tight">Student Builder Group</p>
          <p className="text-sbg-text-muted text-xs font-mono">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors',
                isActive
                  ? 'bg-white text-sbg-black font-semibold'
                  : 'text-sbg-text-muted hover:text-white hover:bg-white/5',
              ].join(' ')
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/[0.06] flex flex-col gap-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-sbg-text-muted hover:text-red-400 hover:bg-red-900/10 transition-colors w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  )
}
