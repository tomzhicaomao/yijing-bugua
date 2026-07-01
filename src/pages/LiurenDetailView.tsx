/**
 * 大六壬断卦详情页
 *
 * 展示框架层分析结果：
 * 课格、毕法赋、天将、六亲、综合信号
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { DivinationRecord } from '../types'
import { getRecordById } from '../db/records.js'
import { useAuth } from '../auth/AuthContext'
import Collapsible from '../components/liuren/Collapsible'
import TrendBadge from '../components/liuren/TrendBadge'

/** 信号类型徽章 */
function SignalBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    '吉': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    '凶': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    '中性': 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  }
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-xs border ${colors[type] || colors['中性']}`}>
      {type}
    </span>
  )
}

/** 主组件 */
export default function LiurenDetailView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [record, setRecord] = useState<DivinationRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !user) return
    getRecordById(id, user.id).then((r) => {
      setRecord(r)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-gray-500">记录不存在</div>
        <button onClick={() => navigate(-1)} className="text-blue-500 hover:underline">
          返回
        </button>
      </div>
    )
  }

  const framework = record.framework
  if (!framework) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-gray-500">该记录无框架层分析数据</div>
        <button onClick={() => navigate(-1)} className="text-blue-500 hover:underline">
          返回
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold">断卦详情</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* 课格卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              课格：{framework.keGe.keGe.name}
            </h2>
            <TrendBadge trend={framework.keGe.keGe.trend} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {framework.keGe.keGe.meaning}
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            分类：{framework.keGe.keGe.category} | 置信度：{(framework.keGe.confidence * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {framework.keGe.reasoning}
          </div>
        </div>

        {/* 毕法赋匹配 */}
        {framework.bifa.length > 0 && (
          <Collapsible
            title={`毕法赋匹配（${framework.bifa.length}条）`}
            defaultOpen={true}
          >
            {framework.bifa.map((b, idx) => (
              <div key={idx} className="border-l-2 border-blue-300 dark:border-blue-700 pl-3 py-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                    第{b.rule.id}法「{b.rule.title}」
                  </span>
                  <TrendBadge trend={b.rule.category} />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {b.rule.description}
                </p>
                {b.sceneJudgment && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    → {b.sceneJudgment}
                  </p>
                )}
              </div>
            ))}
          </Collapsible>
        )}

        {/* 天将分析 */}
        <Collapsible
          title="天将分析"
        >
          {framework.tianJiang.sanChuanJiang.map((item, idx) => {
            const names = ['初传', '中传', '末传']
            return (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 w-12">{names[idx]}</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{item.jiang}</span>
                <span className="text-gray-400">临</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{item.branch}</span>
              </div>
            )
          })}
          {framework.tianJiang.summary && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-line">
              {framework.tianJiang.summary}
            </p>
          )}
        </Collapsible>

        {/* 六亲分析 */}
        <Collapsible
          title="六亲分析"
        >
          <div className="text-sm mb-2">
            <span className="text-gray-500">用神：</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{framework.liuQin.yongShen}</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">
            {framework.liuQin.summary}
          </p>
        </Collapsible>

        {/* 综合信号 */}
        <Collapsible
          title={`综合信号（${framework.signals.length}条）`}
          defaultOpen={true}
        >
          {framework.signals.map((signal, idx) => (
            <div key={idx} className="flex items-start gap-2 py-1">
              <SignalBadge type={signal.type} />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {signal.source}
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {signal.description}
                </p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                w:{signal.weight.toFixed(1)}
              </span>
            </div>
          ))}
        </Collapsible>

        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="w-full py-3 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          返回
        </button>
      </div>
    </div>
  )
}
