import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LineValue, CastingMethod, Category, BeforeDivination } from '../types'
import { tossResultToLineValue, calculateHexagram } from '../engine/casting.js'
import { createRecord } from '../db/records.js'
import { calculateDefaultDueAt } from '../lib/feedback-due.js'
import { checkDuplicate } from '../engine/duplicate-check.js'
import { getAllRecords } from '../db/records.js'
import { useAuth } from '../auth/AuthContext'
import { v4 as uuidv4 } from 'uuid'
import type { DivinationRecord } from '../types'

type Step = 'question' | 'before-divination' | 'method' | 'casting' | 'result'

export function useDivination() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep] = useState<Step>('question')
  const [question, setQuestion] = useState('')
  const [category, setCategory] = useState<Category | null>(null)
  const [beforeDivination, setBeforeDivination] = useState<BeforeDivination>({})
  const [method, setMethod] = useState<CastingMethod>('virtual')
  const [castingTimestamp, setCastingTimestamp] = useState<string>('')
  const [lines, setLines] = useState<(LineValue | null)[]>([null, null, null, null, null, null])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null)

  const setQuestionAndCategory = useCallback((q: string, cat: Category) => {
    setQuestion(q)
    setCategory(cat)
    setStep('before-divination')
  }, [])

  const updateBeforeDivination = useCallback((bd: BeforeDivination) => {
    setBeforeDivination(bd)
  }, [])

  const setBeforeAndContinue = useCallback((bd: BeforeDivination) => {
    setBeforeDivination(bd)
    setStep('method')
  }, [])

  const startCasting = useCallback((m: CastingMethod) => {
    setMethod(m)
    setLines([null, null, null, null, null, null])
    setCurrentIndex(0)
    setCastingTimestamp('')
    setStep('casting')
  }, [])

  const completeCasting = useCallback(async () => {
    if (!category || !user) return

    const validLines = lines.filter((l): l is LineValue => l !== null)
    if (validLines.length !== 6) return

    const calc = calculateHexagram(validLines as [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue])
    // Check for duplicate questions in the last 24 hours
    const allRecords = await getAllRecords(user.id)
    const duplicate = checkDuplicate(question, allRecords, 24) ?? undefined
    const record: DivinationRecord = {
      schemaVersion: 1,
      id: uuidv4(),
      timestamp: castingTimestamp || new Date().toISOString(),
      question,
      category,
      method,
      beforeDivination: Object.keys(beforeDivination).length > 0 ? beforeDivination : undefined,
      hexagram: {
        original: calc.original,
        changed: calc.changed,
        changingLines: calc.changingLines,
        mutual: calc.mutual,
        cuoGua: calc.cuoGua,
        zongGua: calc.zongGua,
        tiYong: calc.tiYong,
        timeContext: calc.timeContext,
      },
      interpretations: [],
      feedback: {
        dueAt: calculateDefaultDueAt(castingTimestamp || new Date().toISOString(), category),
        status: 'pending',
      },
      duplicate,
    }

    try {
      await createRecord(record, user.id)
      setSavedRecordId(record.id)
      setStep('result')
      navigate(`/result/${record.id}`)
    } catch (err) {
      console.error('Failed to save record:', err)
      setSavedRecordId(record.id)
      setStep('result')
      navigate(`/result/${record.id}`)
    }
  }, [lines, category, question, method, beforeDivination, castingTimestamp, navigate, user])

  // 当 6 爻全部填满时自动触发完成（用 useEffect 避免闭包过期）
  const [shouldComplete, setShouldComplete] = useState(false)
  
  const setLineValue = useCallback((value: LineValue) => {
    if (currentIndex >= 6) return
    if (currentIndex === 0 && !castingTimestamp) {
      setCastingTimestamp(new Date().toISOString())
    }
    const newLines = [...lines]
    newLines[currentIndex] = value
    setLines(newLines)
    const newIndex = currentIndex + 1
    setCurrentIndex(newIndex)

    // 标记需要完成，让 useEffect 处理
    if (newIndex >= 6) {
      setShouldComplete(true)
    }
  }, [currentIndex, lines, castingTimestamp])

  const selectManualBack = useCallback((backCount: number) => {
    if (currentIndex >= 6) return

    if (currentIndex === 0 && !castingTimestamp) {
      setCastingTimestamp(new Date().toISOString())
    }

    const newLines = [...lines]
    newLines[currentIndex] = tossResultToLineValue(backCount)
    setLines(newLines)
    setCurrentIndex(currentIndex + 1)
  }, [currentIndex, lines, castingTimestamp])

  // useEffect: 当 shouldComplete 为 true 时触发 completeCasting
  // 此时 lines 已经是最新值，避免闭包过期
  const effectRan = useRef(false)
  useEffect(() => {
    if (shouldComplete && !effectRan.current) {
      effectRan.current = true
      setShouldComplete(false)
      completeCasting().finally(() => {
        effectRan.current = false
      })
    }
  }, [shouldComplete, completeCasting])

  return {
    step,
    question,
    category,
    beforeDivination,
    method,
    lines,
    currentIndex,
    savedRecordId,
    setQuestionAndCategory,
    updateBeforeDivination,
    setBeforeAndContinue,
    setLineValue,
    startCasting,
    selectManualBack,
    completeCasting,
    setStep,
    setQuestion,
    setCategory,
    setMethod,
  }
}
