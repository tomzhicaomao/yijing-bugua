import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllRecords, queryByCategory } from '../db/records.js'
import { CATEGORIES } from '../lib/constants'
import type { DivinationRecord, Category } from '../types'

export default function HistoryView() {
  const [records, setRecords] = useState<DivinationRecord[]>([])
  const [filter, setFilter] = useState<Category | '全部'>('全部')

  useEffect(() => {
    const load = filter === '全部' ? getAllRecords() : queryByCategory(filter)
    load.then(setRecords)
  }, [filter])

  return (
    <div className="max-w-lg mx-auto py-6 space-y-5">
      <h2 className="text-xl font-semibold text-ink">历史记录</h2>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('全部')} className={`px-3 py-1.5 rounded-full text-sm transition-colors ${filter === '全部' ? 'bg-vermillion text-white' : 'bg-parchment-dark text-stone-600 hover:bg-stone-300'}`}>全部</button>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1.5 rounded-full text-sm transition-colors ${filter === cat ? 'bg-vermillion text-white' : 'bg-parchment-dark text-stone-600 hover:bg-stone-300'}`}>{cat}</button>
        ))}
      </div>
      {records.length === 0 ? (
        <p className="text-stone-400 text-center py-10">暂无记录</p>
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <Link key={r.id} to={`/history/${r.id}`} className="block bg-white border border-stone-200 rounded-lg p-4 hover:border-vermillion/30 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink truncate">{r.question}</p>
                  <p className="text-sm text-stone-500 mt-0.5">{new Date(r.timestamp).toLocaleDateString('zh-CN')} · {r.category}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 ml-2 ${
                  r.feedback.status === 'accurate' ? 'bg-green-100 text-green-700' :
                  r.feedback.status === 'inaccurate' ? 'bg-red-100 text-red-700' :
                  r.feedback.status === 'unclear' ? 'bg-stone-200 text-stone-600' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {r.feedback.status === 'accurate' ? '准' : r.feedback.status === 'inaccurate' ? '不准' : r.feedback.status === 'unclear' ? '不清楚' : '待反馈'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
