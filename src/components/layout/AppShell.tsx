import { Outlet, NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: '首页' },
  { to: '/divine', label: '起卦' },
  { to: '/history', label: '历史' },
  { to: '/stats', label: '统计' },
  { to: '/settings', label: '设置' },
] as const

export default function AppShell() {
  return (
    <div className="min-h-svh flex flex-col">
      <header className="border-b border-gray-200">
        <nav className="flex items-center gap-4 px-4 h-12 max-w-3xl mx-auto">
          <span className="font-semibold text-lg mr-4">易经</span>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                isActive
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
