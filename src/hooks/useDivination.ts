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
  const [lines, setLines] = useState<(LineValue | null)[]>([null, null, null, null, null, null])
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null)

  // 用 ref 跟踪时间戳，避免闭包捕获过时值
  const castingTimestampRef = useRef<string>('')

  // 从 lines 派生 currentIndex，消除闭包中的 index 依赖
  function getNextIndex(currentLines: (LineValue | null)[]): number {
    return currentLines.filter(l => l !== null).length
  }

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
    castingTimestampRef.current = ''
    setStep('casting')
  }, [])

  const completingRef = useRef(false)
  const completeCasting = useCallback(async () => {
    if (completingRef.current) return
    completingRef.current = true

    if (!category || !user) {
      completingRef.current = false
      return
    }

    // 从 lines 派生有效行数
    const currentLines = lines.filter((l): l is LineValue => l !== null)
    if (currentLines.length !== 6) {
      completingRef.current = false
      return
    }

    const calc = calculateHexagram(currentLines as [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue])
    const allRecords = await getAllRecords(user.id)
    const duplicate = checkDuplicate(question, allRecords, 24) ?? undefined
    const timestamp = castingTimestampRef.current || new Date().toISOString()
    const record: DivinationRecord = {
      schemaVersion: 1,
      id: uuidv4(),
      timestamp,
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
        dueAt: calculateDefaultDueAt(timestamp, category),
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
    } finally {
      completingRef.current = false
    }
  }, [lines, category, question, method, beforeDivination, navigate, user])

  const [shouldComplete, setShouldComplete] = useState(false)

  // 修复过时闭包：使用函数式更新消除对 lines/currentIndex 的闭包依赖
  const setLineValue = useCallback((value: LineValue) => {
    setLines(prev => {
      const nextIndex = getNextIndex(prev)
      if (nextIndex >= 6) return prev
      // 首行投掷时记录时间戳（ref 不触发重渲染）
      if (nextIndex === 0 && !castingTimestampRef.current) {
        castingTimestampRef.current = new Date().toISOString()
      }
      const newLines = [...prev]
      newLines[nextIndex] = value
      // 如果满 6 行，触发完成
      if (nextIndex + 1 >= 6) {
        setShouldComplete(true)
      }
      return newLines
    })
  }, [])

  const selectManualBack = useCallback((backCount: number) => {
    setLines(prev => {
      const nextIndex = getNextIndex(prev)
      if (nextIndex >= 6) return prev
      if (nextIndex === 0 && !castingTimestampRef.current) {
        castingTimestampRef.current = new Date().toISOString()
      }
      const newLines = [...prev]
      newLines[nextIndex] = tossResultToLineValue(backCount)
      return newLines
    })
  }, [])

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

  // 从 lines 派生 currentIndex 供外部使用
  const currentIndex = getNextIndex(lines)

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
