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
      <header className="bg-stone-900 shadow-md">
        <nav className="flex items-center gap-6 px-6 h-14 max-w-3xl mx-auto">
          <span className="font-bold text-lg text-gold tracking-wider mr-2">易经</span>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                isActive
                  ? 'text-gold font-medium border-b-2 border-gold pb-0.5'
                  : 'text-stone-400 hover:text-stone-200 transition-colors'
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
