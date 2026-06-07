import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllRecords, queryPendingDue } from '../db/records.js'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

export default function HomeView() {
  const [total, setTotal] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [pending, setPending] = useState(0)

  useEffect(() => {
    getAllRecords().then(r => {
      setTotal(r.length)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      setTodayCount(r.filter(rec => new Date(rec.timestamp) >= today).length)
    })
    queryPendingDue().then(r => setPending(r.length))
  }, [])

  return (
    <div className="min-h-screen bg-obsidian text-luxury-50">
      {/* 导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-lg tracking-[0.2em] text-gold">易经</span>
          <Link to="/settings" className="text-white/40 hover:text-gold transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="pt-16 pb-24 px-6">
        <div className="max-w-md mx-auto">
          {/* 标题区域 */}
          <div className="py-20 text-center">
            {/* 八卦符号 */}
            <div className="mb-10">
              <svg className="w-28 h-28 mx-auto" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="48" stroke="url(#goldGradient)" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="36" stroke="url(#goldGradient)" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="24" stroke="url(#goldGradient)" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="12" stroke="url(#goldGradient)" strokeWidth="0.5" />
                <line x1="50" y1="2" x2="50" y2="98" stroke="url(#goldGradient)" strokeWidth="0.3" />
                <line x1="2" y1="50" x2="98" y2="50" stroke="url(#goldGradient)" strokeWidth="0.3" />
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d4a843" />
                    <stop offset="50%" stopColor="#e8c878" />
                    <stop offset="100%" stopColor="#d4a843" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h1 className="font-display text-4xl font-light tracking-[0.15em] mb-4">易经占卜</h1>
            <p className="text-white/40 font-light tracking-[0.3em] text-sm">周易古占 · 决策辅助</p>

            {/* 分割线 */}
            <div className="divider w-24 mx-auto my-10" />

            {/* 主要操作 */}
            <Link to="/divine">
              <Button className="w-full py-4">开始起卦</Button>
            </Link>

            {/* 次要信息 */}
            <p className="mt-8 text-xs text-white/30 tracking-widest">
              {todayCount > 0 ? `今日已占 ${todayCount} 次` : '开始你的第一次占卜'}
            </p>
          </div>

          {/* 功能入口 */}
          <div className="space-y-3 mt-8">
            <Link to="/history" className="block">
              <GlassCard hover className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-gold/60 text-lg font-display">/</span>
                    <span className="font-light tracking-wide">历史记录</span>
                  </div>
                  <span className="text-white/30 text-sm">{total} 条</span>
                </div>
              </GlassCard>
            </Link>

            <Link to="/stats" className="block">
              <GlassCard hover className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-gold/60 text-lg font-display">/</span>
                    <span className="font-light tracking-wide">统计分析</span>
                  </div>
                  <span className="text-white/30 text-sm">—</span>
                </div>
              </GlassCard>
            </Link>

            <Link to="/settings" className="block">
              <GlassCard hover className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-gold/60 text-lg font-display">/</span>
                    <span className="font-light tracking-wide">设置</span>
                  </div>
                  <span className="text-white/30 text-sm"></span>
                </div>
              </GlassCard>
            </Link>
          </div>

          {/* 待反馈提示 */}
          {pending > 0 && (
            <GlassCard className="p-5 mt-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/60 tracking-wide">待反馈</span>
                <span className="text-xs text-gold/60">{pending} 条</span>
              </div>
              <div className="text-center">
                <Link to="/stats" className="text-sm text-gold hover:text-gold-light transition-colors">
                  查看待反馈记录
                </Link>
              </div>
            </GlassCard>
          )}
        </div>
      </main>

      {/* 底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-white/5">
        <div className="max-w-md mx-auto flex justify-around py-4">
          <Link to="/" className="flex flex-col items-center gap-2 text-gold">
            <span className="text-lg">/</span>
            <span className="text-xs tracking-widest">首页</span>
          </Link>
          <Link to="/divine" className="flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors">
            <span className="text-lg">/divine</span>
            <span className="text-xs tracking-widest">起卦</span>
          </Link>
          <Link to="/history" className="flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors">
            <span className="text-lg">/history</span>
            <span className="text-xs tracking-widest">历史</span>
          </Link>
          <Link to="/stats" className="flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors">
            <span className="text-lg">/stats</span>
            <span className="text-xs tracking-widest">统计</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
