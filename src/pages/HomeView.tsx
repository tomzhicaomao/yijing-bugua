import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getAllRecords, queryPendingDue } from "../db/records.js"
import FeedbackList from "../components/feedback/FeedbackList"

export default function HomeView() {
  const [showFeedback, setShowFeedback] = useState(false)
  const [total, setTotal] = useState(0)
  const [pending, setPending] = useState(0)

  useEffect(() => {
    getAllRecords().then(r => setTotal(r.length))
    queryPendingDue().then(r => {
      setPending(r.length)
      if (r.length > 0) setShowFeedback(true)
    })
  }, [])

  if (showFeedback) return <FeedbackList onAllDone={() => setShowFeedback(false)} />

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-ink tracking-widest">易经占卜</h1>
        <div className="w-16 h-0.5 bg-gold mx-auto rounded-full" />
        <p className="text-ink-light text-center max-w-md mt-3">周易古占 · 实验派个人决策辅助工具</p>
      </div>
      {total > 0 && (
        <p className="text-sm text-stone-500 bg-parchment-dark px-4 py-1.5 rounded-full">
          共 {total} 条记录，{pending} 条待反馈
        </p>
      )}
      <Link
        to="/divine"
        className="inline-block px-10 py-4 bg-vermillion text-white rounded-lg font-medium text-lg hover:bg-vermillion-dark shadow-lg hover:shadow-xl transition-all active:scale-95"
      >
        开始起卦
      </Link>
      <div className="flex gap-6 text-sm text-stone-500">
        <Link to="/history" className="hover:text-vermillion transition-colors">历史</Link>
        <Link to="/stats" className="hover:text-vermillion transition-colors">统计</Link>
        <Link to="/settings" className="hover:text-vermillion transition-colors">设置</Link>
      </div>
    </div>
  )
}
