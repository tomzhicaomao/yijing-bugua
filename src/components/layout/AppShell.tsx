import { useLocation, Link, Outlet } from 'react-router-dom'
import { FEATURE_LIUREN_ENABLED } from '../../lib/constants'

export default function AppShell() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-svh flex flex-col">
      <Outlet />

      {/* Bottom nav — 触摸目标 ≥ 44px (WCAG 2.5.5) */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-nothing-border bg-nothing-bg z-50" role="navigation" aria-label="主导航">
        <div className="max-w-md mx-auto flex justify-around py-2">
          <Link to="/" className={`flex items-center justify-center min-h-[44px] px-3 font-mono text-[10px] tracking-[0.1em] transition-colors ${pathname === '/' ? 'text-nothing-text-display' : 'text-nothing-text-secondary hover:text-nothing-text-primary'}`} aria-current={pathname === '/' ? 'page' : undefined}>
            首页
          </Link>
          <Link to="/divine" className={`flex items-center justify-center min-h-[44px] px-3 font-mono text-[10px] tracking-[0.1em] transition-colors ${pathname === '/divine' ? 'text-nothing-text-display' : 'text-nothing-text-secondary hover:text-nothing-text-primary'}`} aria-current={pathname === '/divine' ? 'page' : undefined}>
            起卦
          </Link>
          {FEATURE_LIUREN_ENABLED && (
            <Link to="/liuren" className={`flex items-center justify-center min-h-[44px] px-3 font-mono text-[10px] tracking-[0.1em] transition-colors ${pathname.startsWith('/liuren') ? 'text-nothing-text-display' : 'text-nothing-text-secondary hover:text-nothing-text-primary'}`} aria-current={pathname.startsWith('/liuren') ? 'page' : undefined}>
              六壬
            </Link>
          )}
          <Link to="/history" className={`flex items-center justify-center min-h-[44px] px-3 font-mono text-[10px] tracking-[0.1em] transition-colors ${pathname.startsWith('/history') ? 'text-nothing-text-display' : 'text-nothing-text-secondary hover:text-nothing-text-primary'}`} aria-current={pathname.startsWith('/history') ? 'page' : undefined}>
            历史
          </Link>
          <Link to="/stats" className={`flex items-center justify-center min-h-[44px] px-3 font-mono text-[10px] tracking-[0.1em] transition-colors ${pathname === '/stats' ? 'text-nothing-text-display' : 'text-nothing-text-secondary hover:text-nothing-text-primary'}`} aria-current={pathname === '/stats' ? 'page' : undefined}>
            统计
          </Link>
        </div>
      </nav>
    </div>
  )
}
