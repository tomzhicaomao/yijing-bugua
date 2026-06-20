import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllRecords, queryPendingDue } from '../db/records.js'
import { useAuth } from '../auth/AuthContext'
import Button from '../components/ui/Button'

export default function HomeView() {
  const { user } = useAuth()
  const [total, setTotal] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [pending, setPending] = useState(0)

  useEffect(() => {
    if (!user) return
    getAllRecords(user.id).then(r => {
      setTotal(r.length)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      setTodayCount(r.filter(rec => new Date(rec.timestamp) >= today).length)
    })
    queryPendingDue(user.id).then(r => setPending(r.length))
  }, [user])

  return (
    <div className="min-h-screen bg-nothing-bg text-nothing-text-primary">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 h-16 max-w-md mx-auto">
        <span className="font-mono text-xs tracking-[0.15em] text-nothing-text-secondary">易经</span>
        <span className="font-mono text-[10px] tracking-[0.1em] text-nothing-text-disabled">
          {todayCount > 0 ? `TODAY ${todayCount}` : ''}
        </span>
      </nav>

      {/* Main */}
      <main className="px-6 max-w-md mx-auto">
        {/* Hero section */}
        <div className="pt-12 pb-16">
          <h1 className="text-[24px] leading-[1.1] font-light tracking-[-0.02em] text-nothing-text-display">
            占卜
          </h1>
          <div className="mt-6 space-y-1">
            <p className="text-[15px] text-nothing-text-secondary leading-relaxed">
              周易古占 · 决策辅助
            </p>
            <p className="font-mono text-[11px] tracking-[0.08em] text-nothing-text-disabled">
              I CHING · DIVINATION
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mb-12">
          <Link to="/divine">
            <Button variant="primary" className="w-full">
              开始起卦
            </Button>
          </Link>
        </div>

        {/* Navigation links */}
        <div className="divide-y divide-nothing-border">
          <Link to="/history" className="flex items-center justify-between py-4 group">
            <span className="text-[15px] text-nothing-text-primary">历史记录</span>
            <span className="font-mono text-[11px] tracking-[0.08em] text-nothing-text-disabled group-hover:text-nothing-text-secondary transition-colors">
              {total > 0 ? `${total}` : '—'}
            </span>
          </Link>
          <Link to="/stats" className="flex items-center justify-between py-4 group">
            <span className="text-[15px] text-nothing-text-primary">统计分析</span>
            <span className="font-mono text-[11px] tracking-[0.08em] text-nothing-text-disabled group-hover:text-nothing-text-secondary transition-colors">
              STATS
            </span>
          </Link>
          <Link to="/settings" className="flex items-center justify-between py-4 group">
            <span className="text-[15px] text-nothing-text-primary">设置</span>
            <span className="font-mono text-[11px] tracking-[0.08em] text-nothing-text-disabled group-hover:text-nothing-text-secondary transition-colors">
              SETTINGS
            </span>
          </Link>
        </div>

        {/* Pending feedback */}
        {pending > 0 && (
          <div className="mt-10 pt-6 border-t border-nothing-border">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[11px] tracking-[0.08em] text-nothing-accent">
                待反馈 · {pending}
              </span>
            </div>
            <Link to="/stats" className="text-[14px] text-nothing-text-secondary hover:text-nothing-text-primary transition-colors">
              查看待反馈记录 →
            </Link>
          </div>
        )}

        {/* Bottom spacer for fixed nav */}
        <div className="h-24" />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-nothing-border bg-nothing-bg">
        <div className="max-w-md mx-auto flex justify-around py-3">
          <span className="font-mono text-[10px] tracking-[0.1em] text-nothing-text-display">[ HOME ]</span>
          <Link to="/divine" className="font-mono text-[10px] tracking-[0.1em] text-nothing-text-disabled hover:text-nothing-text-primary transition-colors">
            DIVINE
          </Link>
          <Link to="/history" className="font-mono text-[10px] tracking-[0.1em] text-nothing-text-disabled hover:text-nothing-text-primary transition-colors">
            HISTORY
          </Link>
          <Link to="/stats" className="font-mono text-[10px] tracking-[0.1em] text-nothing-text-disabled hover:text-nothing-text-primary transition-colors">
            STATS
          </Link>
        </div>
      </nav>
    </div>
  )
}
