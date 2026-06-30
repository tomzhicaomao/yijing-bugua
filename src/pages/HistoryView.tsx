import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getAllRecords, queryByCategory } from '../db/records.js'
import { useAuth } from '../auth/AuthContext'
import { CATEGORIES } from '../lib/constants'
import GlassCard from '../components/ui/GlassCard'
import Tag from '../components/ui/Tag'
import { gsap } from '../lib/gsap.js'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import type { DivinationRecord, Category } from '../types'

export default function HistoryView() {
  const { user } = useAuth()
  const [records, setRecords] = useState<DivinationRecord[]>([])
  const [filter, setFilter] = useState<Category | '全部'>('全部')
  const prefersReducedMotion = useReducedMotion()
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    if (!user) return
    const load = filter === '全部' ? getAllRecords(user.id) : queryByCategory(filter, user.id)
    load.then(setRecords)
  }, [filter, user])

  // Animate list items entrance
  useEffect(() => {
    if (records.length === 0 || prefersReducedMotion) return
    
    const items = itemRefs.current.filter(Boolean)
    if (items.length === 0) return
    
    gsap.from(items, {
      opacity: 0,
      x: -30,
      duration: 0.4,
      stagger: 0.05,
      ease: "power2.out",
      delay: 0.2,
    })
  }, [records, prefersReducedMotion])

  return (
    <div className="min-h-screen bg-nothing-bg text-nothing-text-primary">
      {/* 导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-nothing-bg border-b border-nothing-border">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-nothing-text-secondary hover:text-nothing-text-primary transition-colors">
            ← 返回
          </Link>
          <span className="text-lg tracking-[0.2em] text-nothing-text-display">历史</span>
          <div className="w-10" />
        </div>
      </nav>

      {/* 主内容 */}
      <main className="pt-16 pb-20 px-6">
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
              <p className="text-nothing-text-secondary">暂无记录</p>
            </div>
          ) : (
            <div ref={listRef} className="space-y-4">
              {records.map((r, i) => (
                <Link
                  key={r.id}
                  ref={el => { itemRefs.current[i] = el }}
                  to={r.method.startsWith('liuren') ? `/liuren/${r.id}` : `/history/${r.id}`}
                  className="block"
                >
                  <GlassCard className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-light tracking-wide mb-2">{r.question}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-nothing-text-secondary">
                            {new Date(r.timestamp).toLocaleDateString('zh-CN')}
                          </span>
                          <span className="text-xs text-nothing-text-disabled">·</span>
                          <span className="text-xs text-nothing-text-secondary">{r.category}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full shrink-0 ml-2 ${
                        r.feedback.status === 'accurate'
                          ? 'bg-green-50 text-green-700'
                          : r.feedback.status === 'inaccurate'
                          ? 'bg-red-50 text-red-700'
                          : r.feedback.status === 'unclear'
                          ? 'bg-nothing-raised text-nothing-text-secondary'
                          : 'bg-nothing-accent-subtle text-nothing-accent'
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
        <div className="h-16" />
    </main>

  </div>
);
}
