import { Link } from 'react-router-dom'
import { useDivination } from '../hooks/useDivination'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Tag from '../components/ui/Tag'
import StepIndicator from '../components/ui/StepIndicator'
import VirtualCoins from '../components/casting/VirtualCoins'
import ManualInput from '../components/casting/ManualInput'
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
    selectManualBack,
    setQuestion,
    setCategory,
    setMethod,
  } = useDivination()

  const handleNext = () => {
    if (question.trim() && category) {
      setQuestionAndCategory(question.trim(), category)
    }
  }

  return (
    <div className="min-h-screen bg-nothing-bg text-nothing-text-primary">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 h-14 max-w-md mx-auto bg-nothing-bg">
        <Link to="/" className="font-mono text-[11px] tracking-[0.1em] text-nothing-text-disabled hover:text-nothing-text-primary transition-colors">
          ← 返回
        </Link>
        <span className="font-mono text-[10px] tracking-[0.15em] text-nothing-text-secondary">起卦</span>
        <div className="w-12" />
      </nav>

      {/* Step indicator */}
      <div className="px-6 py-5 max-w-md mx-auto">
        <StepIndicator
          currentStep={step === 'question' ? 1 : step === 'before-divination' ? 2 : step === 'method' ? 3 : 4}
          totalSteps={4}
        />
      </div>

      {/* Content */}
      <main className="px-6 pb-28 max-w-md mx-auto">
        {/* Step 1: Question */}
        {step === 'question' && (
          <div className="space-y-8 pt-4">
            <div>
              <h1 className="text-[24px] leading-[1.1] font-light tracking-[-0.02em] text-nothing-text-display">
                你想问什么
              </h1>
              <p className="font-mono text-[11px] tracking-[0.08em] text-nothing-text-disabled mt-3">
                STATE YOUR QUESTION
              </p>
            </div>

            <div>
              <textarea
                className="input-nothing min-h-[120px] resize-none"
                placeholder="请输入你的问题..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <div className="text-right mt-2">
                <span className="font-mono text-[11px] text-nothing-text-disabled">{question.length}/100</span>
              </div>
            </div>

            <div>
              <p className="font-mono text-[11px] tracking-[0.08em] text-nothing-text-secondary mb-4">
                CATEGORY
              </p>
              <div className="flex flex-wrap gap-2">
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

            <Button onClick={handleNext} className="w-full">
              下一步 → NEXT
            </Button>
          </div>
        )}

        {/* Step 2: Before Divination */}
        {step === 'before-divination' && (
          <div className="space-y-8 pt-4">
            <div>
              <h1 className="text-[24px] leading-[1.1] font-light tracking-[-0.02em] text-nothing-text-display">
                记录你的判断
              </h1>
              <p className="font-mono text-[11px] tracking-[0.08em] text-nothing-text-disabled mt-3">
                OPTIONAL · ALL FIELDS OPTIONAL
              </p>
            </div>

            <div>
              <p className="font-mono text-[11px] tracking-[0.08em] text-nothing-text-secondary mb-3">
                YOUR EXPECTATION
              </p>
              <Input
                placeholder="你觉得结果会是怎样的？"
                value={beforeDivination.userExpectation || ''}
                onChange={(e) => updateBeforeDivination({ ...beforeDivination, userExpectation: e.target.value })}
              />
            </div>

            <div>
              <p className="font-mono text-[11px] tracking-[0.08em] text-nothing-text-secondary mb-4">
                CONFIDENCE
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    className={`font-mono text-[14px] w-12 h-12 rounded-full border transition-colors ${
                      beforeDivination.userConfidence === n
                        ? 'border-nothing-text-primary bg-nothing-text-primary text-nothing-bg'
                        : 'border-nothing-border-visible text-nothing-text-secondary hover:border-nothing-text-primary'
                    }`}
                    onClick={() => updateBeforeDivination({ ...beforeDivination, userConfidence: n })}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-mono text-[11px] tracking-[0.08em] text-nothing-text-secondary mb-3">
                INTENDED ACTION
              </p>
              <Input
                placeholder="你想怎么做？"
                value={beforeDivination.intendedAction || ''}
                onChange={(e) => updateBeforeDivination({ ...beforeDivination, intendedAction: e.target.value })}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setBeforeAndContinue(beforeDivination)} className="flex-1">
                保存并继续
              </Button>
              <Button variant="ghost" onClick={() => setBeforeAndContinue(beforeDivination)}>
                跳过
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Method Selection */}
        {step === 'method' && (
          <div className="space-y-8 pt-4">
            <div>
              <h1 className="text-[24px] leading-[1.1] font-light tracking-[-0.02em] text-nothing-text-display">
                选择起卦方式
              </h1>
              <p className="font-mono text-[11px] tracking-[0.08em] text-nothing-text-disabled mt-3">
                CHOOSE METHOD
              </p>
            </div>

            <div className="space-y-3">
              <GlassCard
                className={`p-5 cursor-pointer transition-colors ${
                  method === 'virtual' ? 'border-nothing-text-primary border' : 'border border-nothing-border'
                }`}
                onClick={() => setMethod('virtual')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border border-nothing-border-visible flex items-center justify-center font-mono text-[14px]">
                    *
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px]">虚拟摇卦</p>
                    <p className="font-mono text-[10px] tracking-[0.08em] text-nothing-text-secondary mt-0.5">
                      THREE COINS
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${method === 'virtual' ? 'border-nothing-text-primary bg-nothing-text-primary' : 'border-nothing-border-visible'}`} />
                </div>
              </GlassCard>

              <GlassCard
                className={`p-5 cursor-pointer transition-colors ${
                  method === 'manual' ? 'border-nothing-text-primary border' : 'border border-nothing-border'
                }`}
                onClick={() => setMethod('manual')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border border-nothing-border-visible flex items-center justify-center font-mono text-[14px]">
                    #
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px]">手动输入</p>
                    <p className="font-mono text-[10px] tracking-[0.08em] text-nothing-text-secondary mt-0.5">
                      MANUAL ENTRY
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${method === 'manual' ? 'border-nothing-text-primary bg-nothing-text-primary' : 'border-nothing-border-visible'}`} />
                </div>
              </GlassCard>
            </div>

            <Button onClick={() => startCasting(method)} className="w-full">
              开始起卦 → CAST
            </Button>
          </div>
        )}

        {/* Step 4: Casting */}
        {step === 'casting' && (
          <div className="space-y-8 pt-4">
            <div>
              <h1 className="text-[24px] leading-[1.1] font-light tracking-[-0.02em] text-nothing-text-display">
                {method === 'virtual' ? '虚拟摇卦' : '手动输入'}
              </h1>
              <p className="font-mono text-[11px] tracking-[0.08em] text-nothing-text-secondary mt-3">
                {currentIndex < 6
                  ? `LINE ${currentIndex + 1} / 6 · ${['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][currentIndex]}`
                  : 'COMPLETE'}
              </p>
            </div>

            {method === 'virtual' && (
              <VirtualCoins currentIndex={currentIndex} onCast={setLineValue} />
            )}

            {method === 'manual' && (
              <ManualInput
                lines={lines}
                currentIndex={currentIndex}
                onSelectBack={selectManualBack}
                onComplete={() => {
                  if (currentIndex >= 6) {
                    completeCasting()
                  }
                }}
              />
            )}

            <GlassCard>
              <p className="font-mono text-[10px] tracking-[0.08em] text-nothing-text-secondary mb-4">
                HEXAGRAM BOARD
              </p>
              <HexagramBoard lines={lines} label="本卦" />
            </GlassCard>
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-28" />
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
