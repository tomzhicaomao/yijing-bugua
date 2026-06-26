import { useLocation, Link, Outlet } from 'react-router-dom'

export default function AppShell() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-svh flex flex-col">
      <Outlet />

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-nothing-border bg-nothing-bg z-50">
        <div className="max-w-md mx-auto flex justify-around py-3">
          <Link to="/" className={`font-mono text-[10px] tracking-[0.1em] transition-colors ${pathname === '/' ? 'text-nothing-text-display' : 'text-nothing-text-disabled hover:text-nothing-text-primary'}`}>
            HOME
          </Link>
          <Link to="/divine" className={`font-mono text-[10px] tracking-[0.1em] transition-colors ${pathname === '/divine' ? 'text-nothing-text-display' : 'text-nothing-text-disabled hover:text-nothing-text-primary'}`}>
            DIVINE
          </Link>
          <Link to="/history" className={`font-mono text-[10px] tracking-[0.1em] transition-colors ${pathname.startsWith('/history') ? 'text-nothing-text-display' : 'text-nothing-text-disabled hover:text-nothing-text-primary'}`}>
            HISTORY
          </Link>
          <Link to="/stats" className={`font-mono text-[10px] tracking-[0.1em] transition-colors ${pathname === '/stats' ? 'text-nothing-text-display' : 'text-nothing-text-disabled hover:text-nothing-text-primary'}`}>
            STATS
          </Link>
        </div>
      </nav>
    </div>
  )
}
