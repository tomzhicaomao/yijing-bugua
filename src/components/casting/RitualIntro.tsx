/**
 * 开卦仪式引导页 — Nothing Design 极简风格
 *
 * 三阶段:
 *   1. enter: 环境提醒 (2s)
 *   2. breathing: 3 轮呼吸引导 (~14s/轮)
 *   3. ready: "准备好了" 按钮
 */

import { useState, useEffect } from 'react'

interface Props { onReady: () => void; onSkip: () => void }

type Phase = 'enter' | 'breathing' | 'ready'

export function RitualIntro({ onReady, onSkip }: Props) {
  const [phase, setPhase] = useState<Phase>('enter')
  const [cycle, setCycle] = useState(0)
  const [breath, setBreath] = useState<'in' | 'hold' | 'out'>('in')

  useEffect(() => { const t = setTimeout(() => setPhase('breathing'), 2000); return () => clearTimeout(t) }, [])

  useEffect(() => {
    if (phase !== 'breathing') return
    const id = setInterval(() => {
      setCycle(p => { const n = p + 1; if (n >= 3) { clearInterval(id); setPhase('ready') }; return n })
    }, 14000)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'breathing') return
    const t1 = setTimeout(() => setBreath('hold'), 0)
    const t2 = setTimeout(() => setBreath('out'), 4000)
    const t3 = setTimeout(() => setBreath('in'), 10000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [phase, cycle])

  if (phase === 'enter') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 animate-fade-in">
      <p className="text-nothing-text-secondary text-sm tracking-wider mb-8 leading-relaxed">建议找一个安静的地方<br/>让心神沉静下来</p>
      <button className="text-nothing-text-tertiary text-xs tracking-widest underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity" onClick={onSkip}>跳过</button>
    </div>
  )

  if (phase === 'breathing') {
    const scale = breath === 'in' ? 1 : breath === 'hold' ? 1.15 : 0.85
    const label = breath === 'in' ? '吸气' : breath === 'hold' ? '屏息' : '呼气'
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-20 h-20 rounded-full border border-nothing-accent/40 mb-12 transition-all duration-[4000ms] ease-in-out" style={{ transform: `scale(${scale})` }} />
        <p className="text-nothing-text-secondary text-sm tracking-wider mb-8">静心存诚 · 观其所感</p>
        <p className="text-nothing-text-tertiary text-xs tracking-widest mb-2">{label} <span className="text-nothing-accent/60">{cycle + 1}/3</span></p>
        <div className="flex gap-1.5 mb-8">
          {[0, 1, 2].map(i => <span key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i < cycle ? 'bg-nothing-accent' : 'bg-nothing-border'}`} />)}
        </div>
        <button className="text-nothing-text-tertiary text-xs tracking-widest underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity" onClick={onSkip}>跳过</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 animate-fade-in">
      <p className="text-nothing-text-secondary text-sm tracking-wider mb-2 leading-relaxed">"当你准备好了，问出心中所想"</p>
      <div className="mt-12 flex flex-col items-center gap-4">
        <button className="px-8 py-3 border border-nothing-accent/60 text-nothing-text-primary text-sm tracking-widest hover:bg-nothing-accent/5 transition-all duration-300" onClick={onReady}>我已准备好</button>
        <button className="text-nothing-text-tertiary text-xs tracking-widest underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity" onClick={onSkip}>跳过</button>
      </div>
    </div>
  )
}
