import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllRecords } from '../db/records.js'
import { useAuth } from '../auth/AuthContext'
import { CATEGORIES } from '../lib/constants'
import GlassCard from '../components/ui/GlassCard'
import type { DivinationRecord } from '../types'

export default function StatsView() {
  const { user } = useAuth()
  const [records, setRecords] = useState<DivinationRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getAllRecords(user.id).then(r => { setRecords(r); setLoading(false) })
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian text-luxury-50 flex items-center justify-center">
        <p className="text-white/40">加载中...</p>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="min-h-screen bg-obsidian text-luxury-50">
        <nav className="fixed top-0 left-0 right-0 z-50">
          <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="text-white/40 hover:text-gold transition-colors">← 返回</Link>
            <span className="font-display text-lg tracking-[0.2em] text-gold">统计</span>
            <div className="w-10" />
          </div>
        </nav>
        <main className="pt-16 pb-24 px-6">
          <div className="max-w-md mx-auto py-16 text-center">
            <p className="text-white/30">暂无数据，开始你的第一次占卜吧</p>
          </div>
        </main>
      </div>
    )
  }

  const total = records.length
  const fed = records.filter(r => r.feedback.status !== 'pending')
  const fedRate = total > 0 ? Math.round(fed.length / total * 100) : 0
  const accurate = fed.filter(r => r.feedback.status === 'accurate').length
  const inaccurate = fed.filter(r => r.feedback.status === 'inaccurate').length
  const base = accurate + inaccurate
  const accuracy = base >= 5 ? Math.round(accurate / base * 100) : null

  const byCategory = CATEGORIES.map(c => {
    const catRecords = records.filter(r => r.category === c)
    const a = catRecords.filter(r => r.feedback.status === 'accurate').length
    const i = catRecords.filter(r => r.feedback.status === 'inaccurate').length
    return { category: c, total: catRecords.length, a, i, base: a + i }
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  return (
    <div className="min-h-screen bg-obsidian text-luxury-50">
      {/* 导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-white/40 hover:text-gold transition-colors">← 返回</Link>
          <span className="font-display text-lg tracking-[0.2em] text-gold">统计</span>
          <div className="w-10" />
        </div>
      </nav>

      {/* 主内容 */}
      <main className="pt-16 pb-24 px-6">
        <div className="max-w-md mx-auto py-8 space-y-6">
          {/* 数据卡片 */}
          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="p-5 text-center">
              <p className="text-3xl font-display text-gold mb-2">{total}</p>
              <p className="text-sm text-white/40 tracking-wide">总次数</p>
            </GlassCard>
            <GlassCard className="p-5 text-center">
              <p className="text-3xl font-display text-gold mb-2">{fedRate}%</p>
              <p className="text-sm text-white/40 tracking-wide">反馈率</p>
            </GlassCard>
            <GlassCard className="p-5 text-center">
              <p className="text-3xl font-display text-gold mb-2">{accuracy !== null ? `${accuracy}%` : '—'}</p>
              <p className="text-sm text-white/40 tracking-wide">准确率</p>
            </GlassCard>
            <GlassCard className="p-5 text-center">
              <p className="text-3xl font-display text-gold mb-2">{base}</p>
              <p className="text-sm text-white/40 tracking-wide">已反馈</p>
            </GlassCard>
          </div>

          {/* 按分类统计 */}
          {byCategory.length > 0 && (
            <GlassCard className="p-5">
              <h3 className="font-display text-lg tracking-wide mb-4">按分类</h3>
              <div className="space-y-3">
                {byCategory.map(c => (
                  <div key={c.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm tracking-wide">{c.category}</span>
                      <span className="text-sm text-white/40 font-mono">{c.total} 次</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold/40 rounded-full"
                        style={{ width: `${c.base >= 5 ? Math.round(c.a / c.base * 100) : 0}%` }}
                      />
                    </div>
                    <div className="text-xs text-white/30 mt-1">
                      {c.base >= 5 ? `准确率 ${Math.round(c.a / c.base * 100)}%` : `已反馈 ${c.base} 条`}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </main>
    </div>
  )
}
