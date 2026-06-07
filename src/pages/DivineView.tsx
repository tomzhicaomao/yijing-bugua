import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useDivination } from '../hooks/useDivination'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Tag from '../components/ui/Tag'
import StepIndicator from '../components/ui/StepIndicator'
import Coin from '../components/casting/Coin'
import HexagramBoard from '../components/casting/HexagramBoard'
import type { Category } from '../types'

const CATEGORIES: Category[] = ['工作', '人际', '财务', '健康', '其他']

export default function DivineView() {
  const {
    step,
    question,
    category,
    beforeDivination,
    method,
    lines,
    currentIndex,
    setQuestionAndCategory,
    updateBeforeDivination,
    setBeforeAndContinue,
    setLineValue,
    startCasting,
    completeCasting,
    setQuestion,
    setCategory,
    setMethod,
  } = useDivination()

  const completingRef = useRef(false)

  useEffect(() => {
    if (step === 'casting' && currentIndex >= 6 && !completingRef.current) {
      completingRef.current = true
      completeCasting().finally(() => { completingRef.current = false })
    }
  }, [step, currentIndex, completeCasting])

  const handleNext = () => {
    if (question.trim() && category) {
      setQuestionAndCategory(question.trim(), category)
    }
  }

  return (
    <div className="min-h-screen bg-obsidian text-luxury-50">
      {/* 导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-white/40 hover:text-gold transition-colors">
            ← 返回
          </Link>
          <span className="font-display text-lg tracking-[0.2em] text-gold">起卦</span>
          <div className="w-10" />
        </div>
      </nav>

      {/* 进度指示器 */}
      <div className="fixed top-16 left-0 right-0 z-40">
        <div className="max-w-md mx-auto px-6 py-6">
          <StepIndicator currentStep={step === 'question' ? 1 : step === 'before-divination' ? 2 : step === 'method' ? 3 : 4} totalSteps={4} />
        </div>
      </div>

      {/* 主内容 */}
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-md mx-auto">
          {/* 步骤 1: 输入问题 */}
          {step === 'question' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="font-display text-2xl font-light tracking-[0.15em] mb-3">你想问什么</h2>
                <p className="text-sm text-white/40 font-light tracking-wide">心中所想，即为所问</p>
              </div>

              <div>
                <textarea
                  className="input-luxury w-full h-32 px-5 py-4 resize-none"
                  placeholder="请输入你的问题..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <div className="text-right mt-3">
                  <span className="text-xs text-white/30 font-mono">{question.length}/100</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-white/40 mb-4 tracking-wide">问题分类</p>
                <div className="flex flex-wrap gap-3">
                  {CATEGORIES.map((cat) => (
                    <Tag
                      key={cat}
                      active={category === cat}
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </Tag>
                  ))}
                </div>
              </div>

              <Button onClick={handleNext} className="w-full py-4">
                下一步
              </Button>
            </div>
          )}

          {/* 步骤 2: 占前预判 */}
          {step === 'before-divination' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="font-display text-2xl font-light tracking-[0.15em] mb-3">记录你的判断</h2>
                <p className="text-sm text-white/40 font-light tracking-wide">全部可选，跳过即可</p>
              </div>

              <div>
                <label className="block text-sm text-white/40 mb-3 tracking-wide">你的预判</label>
                <Input
                  placeholder="你觉得结果会是怎样的？"
                  value={beforeDivination.userExpectation || ''}
                  onChange={(e) => updateBeforeDivination({ ...beforeDivination, userExpectation: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-white/40 mb-4 tracking-wide">信心程度</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      className={`flex-1 py-3 glass-card rounded-lg transition-colors ${
                        beforeDivination.userConfidence === n ? 'border-gold/50' : 'border-white/10'
                      }`}
                      onClick={() => updateBeforeDivination({ ...beforeDivination, userConfidence: n })}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/40 mb-3 tracking-wide">原本打算采取的行动</label>
                <Input
                  placeholder="你想怎么做？"
                  value={beforeDivination.intendedAction || ''}
                  onChange={(e) => updateBeforeDivination({ ...beforeDivination, intendedAction: e.target.value })}
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={() => setBeforeAndContinue(beforeDivination)} className="flex-1 py-4">
                  保存并继续
                </Button>
                <Button variant="ghost" onClick={() => setBeforeAndContinue(beforeDivination)} className="px-8 py-4">
                  跳过
                </Button>
              </div>
            </div>
          )}

          {/* 步骤 3: 选择方式 */}
          {step === 'method' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="font-display text-2xl font-light tracking-[0.15em] mb-3">选择起卦方式</h2>
                <p className="text-sm text-white/40 font-light tracking-wide">选择适合你的方式</p>
              </div>

              <div className="space-y-4">
                <GlassCard
                  hover
                  className={`p-6 cursor-pointer transition-all ${
                    method === 'virtual' ? 'border-gold/30' : ''
                  }`}
                  onClick={() => setMethod('virtual')}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
                      <span className="text-2xl">🪙</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium tracking-wide">虚拟摇卦</h3>
                      <p className="text-sm text-white/40 mt-1">三枚铜钱，逐爻起卦</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${method === 'virtual' ? 'border-gold' : 'border-white/20'}`} />
                  </div>
                </GlassCard>

                <GlassCard
                  hover
                  className={`p-6 cursor-pointer transition-all ${
                    method === 'manual' ? 'border-gold/30' : ''
                  }`}
                  onClick={() => setMethod('manual')}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                      <span className="text-2xl">✍️</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium tracking-wide">手动输入</h3>
                      <p className="text-sm text-white/40 mt-1">已知结果，直接输入</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border ${method === 'manual' ? 'border-gold' : 'border-white/20'}`} />
                  </div>
                </GlassCard>
              </div>

              <Button onClick={() => startCasting(method)} className="w-full py-4">
                开始起卦
              </Button>
            </div>
          )}

          {/* 步骤 4: 虚拟摇卦 */}
          {step === 'casting' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="font-display text-2xl font-light tracking-[0.15em] mb-3">虚拟摇卦</h2>
                <p className="text-sm text-white/40 font-light tracking-wide">
                  {currentIndex < 6 ? `${['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][currentIndex]} · 第 ${currentIndex + 1}/6 爻` : '起卦完成'}
                </p>
              </div>

              {method === 'virtual' && currentIndex < 6 && (
                <>
                  {/* 铜钱区域 */}
                  <div className="flex justify-center gap-8 py-10">
                    {[0, 1, 2].map((i) => (
                      <Coin key={i} onFlip={(backs) => {
                        const value = backs === 0 ? 6 : backs === 1 ? 7 : backs === 2 ? 8 : 9
                        setLineValue(value)
                      }} />
                    ))}
                  </div>
                </>
              )}

              {/* 卦象板 */}
              <GlassCard className="p-6">
                <p className="text-sm text-white/40 mb-5 tracking-wide">卦象</p>
                <HexagramBoard lines={lines} label="本卦" />
              </GlassCard>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
