import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LineValue, CastingMethod, Category, BeforeDivination } from '../types'
import { castLine, tossResultToLineValue, calculateHexagram } from '../engine/casting.js'
import { createRecord } from '../db/records.js'
import { calculateDefaultDueAt } from '../lib/feedback-due.js'
import { v4 as uuidv4 } from 'uuid'
import type { DivinationRecord } from '../types'

type Step = 'question' | 'before-divination' | 'method' | 'casting' | 'result'

export function useDivination() {
  const navigate = useNavigate()

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

  const setLineValue = useCallback((value: LineValue) => {
    if (currentIndex >= 6) return
    if (currentIndex === 0 && !castingTimestamp) {
      setCastingTimestamp(new Date().toISOString())
    }
    const newLines = [...lines]
    newLines[currentIndex] = value
    setLines(newLines)
    setCurrentIndex(currentIndex + 1)
  }, [currentIndex, lines, castingTimestamp])

  const castNextLine = useCallback(() => {
    if (currentIndex >= 6) return

    // Record first click timestamp for Phase B
    if (currentIndex === 0 && !castingTimestamp) {
      setCastingTimestamp(new Date().toISOString())
    }

    const newLines = [...lines]
    newLines[currentIndex] = castLine()
    setLines(newLines)
    setCurrentIndex(currentIndex + 1)

    // Auto-complete on 6th line
    if (currentIndex + 1 >= 6) {
      // Will be handled by DivineView observing currentIndex
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

  const completeCasting = useCallback(async () => {
    if (!category) return

    const validLines = lines.filter((l): l is LineValue => l !== null)
    if (validLines.length !== 6) return

    const calc = calculateHexagram(validLines as [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue])
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
      },
      interpretations: [],
      feedback: {
        dueAt: calculateDefaultDueAt(castingTimestamp || new Date().toISOString(), category),
        status: 'pending',
      },
      duplicate: undefined, // TODO: check duplicate
    }

    try {
      await createRecord(record)
      setSavedRecordId(record.id)
      setStep('result')
      navigate(`/result/${record.id}`)
    } catch (err) {
      console.error('Failed to save record:', err)
      setSavedRecordId(record.id)
      setStep('result')
      navigate(`/result/${record.id}`)
    }
  }, [lines, category, question, method, beforeDivination, castingTimestamp, navigate])

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
    castNextLine,
    selectManualBack,
    completeCasting,
    setStep,
    setQuestion,
    setCategory,
    setMethod,
  }
}
