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
    <div className="flex flex-col items-center justify-center gap-6 py-16">
      <h1 className="text-3xl font-semibold">易经占卜</h1>
      <p className="text-gray-600 text-center max-w-md">周易古占 · 实验派个人决策辅助工具</p>
      {total > 0 && (<p className="text-sm text-gray-500">共 {total} 条记录，{pending} 条待反馈</p>)}
      <Link to="/divine" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-medium text-lg hover:bg-blue-700 shadow-lg">开始起卦</Link>
      <div className="flex gap-4 text-sm text-gray-500">
        <Link to="/history" className="hover:text-gray-700">历史</Link>
        <Link to="/stats" className="hover:text-gray-700">统计</Link>
        <Link to="/settings" className="hover:text-gray-700">设置</Link>
      </div>
    </div>
  )
}
