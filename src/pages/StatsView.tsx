import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getAllRecords } from '../db/records.js'
import { useAuth } from '../auth/AuthContext'
import { CATEGORIES } from '../lib/constants'
import GlassCard from '../components/ui/GlassCard'
import { gsap, ScrollTrigger } from '../lib/gsap.js'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import type { DivinationRecord } from '../types'

export default function StatsView() {
  const { user } = useAuth()
  const [records, setRecords] = useState<DivinationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const prefersReducedMotion = useReducedMotion()
  
  // Refs for animations
  const statsRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const counterRefs = useRef<(HTMLParagraphElement | null)[]>([])

  useEffect(() => {
    if (!user) return
    getAllRecords(user.id).then(r => { setRecords(r); setLoading(false) })
  }, [user])

  // GSAP animations
  useEffect(() => {
    if (loading || records.length === 0 || prefersReducedMotion) return

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger)

    // Animate stats cards entrance
    const cards = cardRefs.current.filter(Boolean)
    if (cards.length > 0) {
      gsap.from(cards, {
        opacity: 0,
        y: 30,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
          end: "bottom 20%",
        }
      })
    }

    // Animate counter numbers
    counterRefs.current.forEach((counter) => {
      if (!counter) return
      
      const finalValue = parseInt(counter.textContent || '0')
      if (isNaN(finalValue)) return
      
      gsap.from(counter, {
        textContent: 0,
        duration: 1.5,
        ease: "power2.out",
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: counter,
          start: "top 90%",
        }
      })
    })

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [loading, records, prefersReducedMotion])

  if (loading) {
    return (
      <div className="min-h-screen bg-nothing-bg text-nothing-text-primary flex items-center justify-center">
        <p className="text-nothing-text-secondary">加载中...</p>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="min-h-screen bg-nothing-bg text-nothing-text-primary">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-nothing-bg border-b border-nothing-border">
          <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="text-nothing-text-secondary hover:text-nothing-text-primary transition-colors">← 返回</Link>
            <span className="text-lg tracking-[0.2em] text-nothing-text-display">统计</span>
            <div className="w-10" />
          </div>
        </nav>
        <main className="pt-16 pb-20 px-6">
          <div className="max-w-md mx-auto py-16 text-center">
            <p className="text-nothing-text-secondary">暂无数据，开始你的第一次占卜吧</p>
          </div>
          <div className="h-16" />
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
    <div className="min-h-screen bg-nothing-bg text-nothing-text-primary">
      {/* 导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-nothing-bg border-b border-nothing-border">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-nothing-text-secondary hover:text-nothing-text-primary transition-colors">← 返回</Link>
          <span className="text-lg tracking-[0.2em] text-nothing-text-display">统计</span>
          <div className="w-10" />
        </div>
      </nav>

      {/* 主内容 */}
      <main className="pt-16 pb-20 px-6">
        <div ref={statsRef} className="max-w-md mx-auto py-8 space-y-6">
          {/* 数据卡片 */}
          <div className="grid grid-cols-2 gap-4">
            <GlassCard ref={el => { cardRefs.current[0] = el }} className="p-5 text-center">
              <p ref={el => { counterRefs.current[0] = el }} className="text-3xl text-nothing-text-display mb-2">{total}</p>
              <p className="text-sm text-nothing-text-secondary tracking-wide">总次数</p>
            </GlassCard>
            <GlassCard ref={el => { cardRefs.current[1] = el }} className="p-5 text-center">
              <p ref={el => { counterRefs.current[1] = el }} className="text-3xl text-nothing-text-display mb-2">{fedRate}%</p>
              <p className="text-sm text-nothing-text-secondary tracking-wide">反馈率</p>
            </GlassCard>
            <GlassCard ref={el => { cardRefs.current[2] = el }} className="p-5 text-center">
              <p ref={el => { counterRefs.current[2] = el }} className="text-3xl text-nothing-text-display mb-2">{accuracy !== null ? `${accuracy}%` : '—'}</p>
              <p className="text-sm text-nothing-text-secondary tracking-wide">准确率</p>
            </GlassCard>
            <GlassCard ref={el => { cardRefs.current[3] = el }} className="p-5 text-center">
              <p ref={el => { counterRefs.current[3] = el }} className="text-3xl text-nothing-text-display mb-2">{base}</p>
              <p className="text-sm text-nothing-text-secondary tracking-wide">已反馈</p>
            </GlassCard>
          </div>

          {/* 按分类统计 */}
          {byCategory.length > 0 && (
            <GlassCard className="p-5">
              <h3 className="text-lg tracking-wide mb-4">按分类</h3>
              <div className="space-y-3">
                {byCategory.map(c => (
                  <div key={c.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm tracking-wide">{c.category}</span>
                      <span className="text-sm text-nothing-text-secondary font-mono">{c.total} 次</span>
                    </div>
                    <div className="h-1 bg-nothing-raised rounded-full overflow-hidden">
                      <div
                        className="h-full bg-nothing-accent rounded-full"
                        style={{ width: `${c.base >= 5 ? Math.round(c.a / c.base * 100) : 0}%` }}
                      />
                    </div>
                    <div className="text-xs text-nothing-text-secondary mt-1">
                      {c.base >= 5 ? `准确率 ${Math.round(c.a / c.base * 100)}%` : `已反馈 ${c.base} 条`}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-nothing-border bg-nothing-bg">
        <div className="max-w-md mx-auto flex justify-around py-3">
          <Link to="/" className="font-mono text-[10px] tracking-[0.1em] text-nothing-text-disabled hover:text-nothing-text-primary transition-colors">HOME</Link>
          <Link to="/divine" className="font-mono text-[10px] tracking-[0.1em] text-nothing-text-disabled hover:text-nothing-text-primary transition-colors">DIVINE</Link>
          <Link to="/history" className="font-mono text-[10px] tracking-[0.1em] text-nothing-text-disabled hover:text-nothing-text-primary transition-colors">HISTORY</Link>
          <Link to="/stats" className="font-mono text-[10px] tracking-[0.1em] text-nothing-text-disabled hover:text-nothing-text-primary transition-colors">STATS</Link>
        </div>
      </nav>
    </div>
  )
}
