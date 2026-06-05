import { useEffect, useRef } from "react"
import QuestionInput from "../components/casting/QuestionInput"
import BeforeDivination from "../components/casting/BeforeDivination"
import MethodToggle from "../components/casting/MethodToggle"
import HexagramBoard from "../components/casting/HexagramBoard"
import ManualInput from "../components/casting/ManualInput"
import VirtualCoins from "../components/casting/VirtualCoins"
import { useDivination } from "../hooks/useDivination"
import type { BeforeDivination as BeforeDivinationData } from "../types"

export default function DivineView() {
  const { step, question, category, beforeDivination, method, lines, currentIndex, setQuestionAndCategory, updateBeforeDivination, setBeforeAndContinue, setLineValue, startCasting, selectManualBack, completeCasting, setQuestion, setCategory, setMethod } = useDivination()
  const completingRef = useRef(false)

  useEffect(() => {
    if (step === "casting" && currentIndex >= 6 && !completingRef.current) {
      completingRef.current = true
      completeCasting().finally(() => { completingRef.current = false })
    }
  }, [step, currentIndex, completeCasting])

  return (
    <div className="max-w-lg mx-auto py-6 space-y-6">
      {step === "question" && (
        <QuestionInput question={question} category={category} onQuestionChange={setQuestion} onCategoryChange={setCategory} onNext={() => { if (question.trim() && category) setQuestionAndCategory(question.trim(), category) }} />
      )}
      {step === "before-divination" && (<BeforeDivination data={beforeDivination} onChange={(bd: BeforeDivinationData) => updateBeforeDivination(bd)} onNext={() => setBeforeAndContinue(beforeDivination)} onSkip={() => setBeforeAndContinue(beforeDivination)} />)}
      {step === "method" && (<div className="space-y-6"><h3 className="text-lg font-semibold text-ink">选择起卦方式</h3><MethodToggle method={method} onChange={setMethod} /><button onClick={() => startCasting(method)} className="w-full py-3 bg-vermillion text-white rounded-lg font-medium hover:bg-vermillion-dark shadow-md transition-all">开始起卦</button></div>)}
      {step === "casting" && (<div className="space-y-6"><HexagramBoard lines={lines} label="本卦" />{method === "virtual" && (<VirtualCoins currentIndex={currentIndex} onCast={setLineValue} />)}{method === "manual" && (<ManualInput lines={lines} currentIndex={currentIndex} onSelectBack={selectManualBack} onComplete={completeCasting} />)}</div>)}
    </div>
  )
}
