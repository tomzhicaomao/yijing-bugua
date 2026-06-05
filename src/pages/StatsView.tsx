import { useState, useEffect } from "react"
import { getAllRecords } from "../db/records.js"
import { CATEGORIES } from "../lib/constants"
import type { DivinationRecord } from "../types"

export default function StatsView() {
  const [records, setRecords] = useState<DivinationRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { getAllRecords().then(r => { setRecords(r); setLoading(false) }) }, [])

  if (loading) return <div className="flex justify-center py-12 text-stone-400">加载中...</div>
  if (records.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-6 space-y-6">
        <h2 className="text-xl font-semibold text-ink">统计面板</h2>
        <p className="text-center py-10 text-stone-400">暂无数据，开始你的第一次占卜吧</p>
      </div>
    )
  }

  const total = records.length
  const fed = records.filter(r => r.feedback.status !== "pending")
  const fedRate = total > 0 ? Math.round(fed.length / total * 100) : 0
  const accurate = fed.filter(r => r.feedback.status === "accurate").length
  const inaccurate = fed.filter(r => r.feedback.status === "inaccurate").length
  const base = accurate + inaccurate
  const accuracy = base >= 5 ? Math.round(accurate / base * 100) : null

  const byCategory = CATEGORIES.map(c => {
    const catRecords = records.filter(r => r.category === c)
    const a = catRecords.filter(r => r.feedback.status === "accurate").length
    const i = catRecords.filter(r => r.feedback.status === "inaccurate").length
    return { category: c, total: catRecords.length, a, i, base: a+i }
  }).filter(c => c.total > 0).sort((a,b) => b.total - a.total)

  const allInterpretations = records.flatMap(r => r.interpretations)
  const defaultInts = allInterpretations.filter(it => it.type === "default")
  const deepInts = allInterpretations.filter(it => it.type === "deep")
  const promptVersions = [...new Set(allInterpretations.map(it => it.promptVersion))]
  const multiVersion = promptVersions.length > 1

  const recent = records.slice(0, Math.min(10, records.length))
  const recentA = recent.filter(r => r.feedback.status === "accurate").length
  const recentI = recent.filter(r => r.feedback.status === "inaccurate").length
  const recentBase = recentA + recentI
  const recentAcc = recentBase >= 5 ? Math.round(recentA / recentBase * 100) : null

  return (
    <div className="max-w-lg mx-auto py-6 space-y-6">
      <h2 className="text-xl font-semibold text-ink">统计面板</h2>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="总次数" value={String(total)} />
        <StatCard label="反馈率" value={fedRate + "% (" + fed.length + "/" + total + ")"} />
        <StatCard label="准确率" value={accuracy ? accuracy + "% (" + base + "条)" : "样本不足"} warn={!accuracy} />
        <StatCard label="最近10条" value={recentAcc ? recentAcc + "%" : "---"} warn={!recentAcc} />
      </div>

      <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
        <h3 className="font-medium mb-3 text-ink-light">按分类统计</h3>
        <div className="space-y-2">
          {byCategory.map(c => (
            <div key={c.category} className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink">{c.category}</span>
              <span className="text-stone-500">{c.total}条</span>
              <span className="text-ink-light">{c.base >= 5 ? "准确率 " + Math.round(c.a / c.base * 100) + "% (" + c.base + "条)" : "样本不足 (" + c.base + "条)"}</span>
            </div>
          ))}
        </div>
      </div>

      {allInterpretations.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-lg p-5 text-sm space-y-2 shadow-sm">
          <h3 className="font-medium text-ink-light">AI 解读统计</h3>
          <p className="text-ink">默认解读: {defaultInts.length} 次 | 深度分析: {deepInts.length} 次</p>
          {multiVersion && <p className="text-amber-600">样本包含 {promptVersions.length} 个 Prompt 版本（{promptVersions.join(", ")}），比较结果仅供参考</p>}
          {allInterpretations.length >= 20 ? (
            <p className="text-ink">置信度校准数据充足（{allInterpretations.length} 条），可进行模式分析</p>
          ) : allInterpretations.length > 0 ? (
            <p className="text-stone-400">再积累一些反馈数据后，这里会显示分析模式（当前 {allInterpretations.length} 条，需 ≥20）</p>
          ) : null}
          {records.some(r => r.duplicate) && <p className="text-vermillion">存在重复占问记录，可能影响准确率统计</p>}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4 text-center shadow-sm">
      <p className="text-2xl font-bold" style={{color: warn ? "#a8a29e" : "#2c1810"}}>{value}</p>
      <p className="text-xs text-stone-500 mt-1">{label}</p>
    </div>
  )
}
