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
    <div className="max-w-lg mx-auto py-6 space-y-4">
      <h2 className="text-xl font-semibold">历史记录</h2>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('全部')} className={`px-3 py-1 rounded-full text-sm ${filter === '全部' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>全部</button>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1 rounded-full text-sm ${filter === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{cat}</button>
        ))}
      </div>
      {records.length === 0 ? (
        <p className="text-gray-400 text-center py-8">暂无记录</p>
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <Link key={r.id} to={`/history/${r.id}`} className="block border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{r.question}</p>
                  <p className="text-sm text-gray-500">{new Date(r.timestamp).toLocaleDateString('zh-CN')} · {r.category}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full shrink-0 ml-2 bg-yellow-100 text-yellow-700">
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
