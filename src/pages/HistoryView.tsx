import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllRecords, queryByCategory } from '../db/records.js'
import { useAuth } from '../auth/AuthContext'
import { CATEGORIES } from '../lib/constants'
import GlassCard from '../components/ui/GlassCard'
import Tag from '../components/ui/Tag'
import type { DivinationRecord, Category } from '../types'

export default function HistoryView() {
  const { user } = useAuth()
  const [records, setRecords] = useState<DivinationRecord[]>([])
  const [filter, setFilter] = useState<Category | '全部'>('全部')

  useEffect(() => {
    if (!user) return
    const load = filter === '全部' ? getAllRecords(user.id) : queryByCategory(filter, user.id)
    load.then(setRecords)
  }, [filter, user])

  return (
    <div className="min-h-screen bg-nothing-bg text-nothing-text-primary">
      {/* 导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-white/40 :text-gold transition-colors">
            ← 返回
          </Link>
          <span className="font-display text-lg tracking-[0.2em] text-gold">历史</span>
          <div className="w-10" />
        </div>
      </nav>

      {/* 主内容 */}
      <main className="pt-16 pb-24 px-6">
        <div className="max-w-md mx-auto py-8 space-y-6">
          {/* 筛选标签 */}
          <div className="flex gap-3 flex-wrap">
            <Tag active={filter === '全部'} onClick={() => setFilter('全部')}>全部</Tag>
            {CATEGORIES.map((cat) => (
              <Tag key={cat} active={filter === cat} onClick={() => setFilter(cat)}>
                {cat}
              </Tag>
            ))}
          </div>

          {/* 记录列表 */}
          {records.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/30">暂无记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((r) => (
                <Link key={r.id} to={`/history/${r.id}`} className="block">
                  <GlassCard className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-light tracking-wide mb-2">{r.question}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/30">
                            {new Date(r.timestamp).toLocaleDateString('zh-CN')}
                          </span>
                          <span className="text-xs text-gold/40">·</span>
                          <span className="text-xs text-white/30">{r.category}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full shrink-0 ml-2 ${
                        r.feedback.status === 'accurate'
                          ? 'bg-green-500/20 text-green-400'
                          : r.feedback.status === 'inaccurate'
                          ? 'bg-red-500/20 text-red-400'
                          : r.feedback.status === 'unclear'
                          ? 'bg-white/10 text-white/40'
                          : 'bg-gold/20 text-gold'
                      }`}>
                        {r.feedback.status === 'accurate' ? '准' :
                         r.feedback.status === 'inaccurate' ? '不准' :
                         r.feedback.status === 'unclear' ? '不清楚' : '待反馈'}
                      </span>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
