/**
 * 大六壬结果详情页
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecordById } from '../db/records';
import { useAuth } from '../auth/AuthContext';
import type { DivinationRecord } from '../types';

export default function LiurenResultView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [record, setRecord] = useState<DivinationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;

    getRecordById(id, user.id)
      .then(r => {
        if (r) {
          setRecord(r);
        } else {
          setError('记录不存在');
        }
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : '加载失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-nothing-bg text-nothing-text-primary flex items-center justify-center">
        <div className="space-y-2 w-48">
          <div className="h-4 bg-nothing-bg-secondary rounded animate-pulse" />
          <div className="h-4 bg-nothing-bg-secondary rounded animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-nothing-bg text-nothing-text-primary flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-sm text-nothing-text-disabled mb-4">{error || '记录不存在'}</p>
          <button
            onClick={() => navigate('/history')}
            className="font-mono text-xs text-nothing-text-secondary hover:text-nothing-text-primary"
          >
            ← 返回历史
          </button>
        </div>
      </div>
    );
  }

  const pan = record.liurenPan;
  const interp = record.interpretation || record.interpretations?.[0];

  return (
    <div className="min-h-screen bg-nothing-bg text-nothing-text-primary">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 h-16 max-w-md mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="font-mono text-xs tracking-[0.1em] text-nothing-text-secondary hover:text-nothing-text-primary"
        >
          ← 返回
        </button>
        <span className="font-mono text-xs tracking-[0.1em] text-nothing-text-secondary">六壬详情</span>
        <div className="w-12" />
      </nav>

      <main className="px-6 max-w-md mx-auto pb-24">
        {/* 问题 */}
        <div className="mb-6">
          <p className="font-mono text-[11px] text-nothing-text-disabled tracking-wider mb-1">所问之事</p>
          <p className="text-sm text-nothing-text-primary">{record.question}</p>
          <p className="font-mono text-[10px] text-nothing-text-disabled mt-1">
            {new Date(record.timestamp).toLocaleString()}
          </p>
        </div>

        {/* 课式信息 */}
        {pan && (
          <>
            {/* 格局 */}
            <div className="mb-4 p-4 border border-nothing-border rounded-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl text-nothing-text-display">{pan.geJu}</span>
                <span className="font-mono text-[10px] text-nothing-text-disabled">{pan.dayGanZhi}</span>
              </div>
              <div className="mt-2 font-mono text-[10px] text-nothing-text-disabled">
                {pan.solarTerm} · 月将{pan.yueJiang} · {pan.isDaytime ? '昼' : '夜'}占{pan.shiZhi}时
              </div>
            </div>

            {/* 四课 */}
            <div className="mb-4">
              <div className="font-mono text-xs text-nothing-text-secondary tracking-[0.1em] mb-2">四课</div>
              <div className="grid grid-cols-2 gap-2">
                {pan.siKe.map((item, idx) => {
                  const rel = item.relation === '上克下' ? '↓' : item.relation === '下贼上' ? '↑' : '=';
                  const relColor = item.relation === '下贼上' ? 'text-red-400' : item.relation === '上克下' ? 'text-orange-400' : 'text-green-400';
                  return (
                    <div key={idx} className="border border-nothing-border rounded p-3 text-center">
                      <div className="font-mono text-lg text-nothing-text-display">{item.upperGod}</div>
                      <div className={`font-mono text-sm ${relColor}`}>{rel}</div>
                      <div className="font-mono text-lg text-nothing-text-primary">{item.lowerGod}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 三传 */}
            <div className="mb-4">
              <div className="font-mono text-xs text-nothing-text-secondary tracking-[0.1em] mb-2">三传</div>
              <div className="flex gap-2">
                {pan.sanChuan.map((item, idx) => (
                  <div key={idx} className="flex-1 border border-nothing-border rounded p-3 text-center">
                    <div className="font-mono text-[10px] text-nothing-text-disabled mb-1">
                      {['初传', '中传', '末传'][idx]}
                    </div>
                    <div className="font-mono text-xl text-nothing-text-display">{item.branch}</div>
                    <div className="font-mono text-[10px] text-nothing-text-disabled mt-1">
                      {item.tianJiang} · {item.liuQin}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 警告 */}
            {pan.warnings && pan.warnings.length > 0 && (
              <div className="mb-4 border border-orange-500/30 rounded-md overflow-hidden">
                <div className="px-4 py-2 bg-orange-500/10 border-b border-orange-500/30">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 text-sm">⚠️</span>
                    <span className="font-mono text-xs tracking-[0.1em] text-orange-400">注意事项</span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-orange-300/70">以下提示不影响起课结果，解读时留意即可</p>
                </div>
                <div className="p-3 space-y-2">
                  {pan.warnings.map((w: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-orange-400 text-[10px] mt-1 shrink-0">▸</span>
                      <span className="font-mono text-[11px] text-orange-200 leading-relaxed">{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* AI 解读 */}
        {interp && (
          <div className="mb-6">
            <div className="font-mono text-xs text-nothing-text-secondary tracking-[0.1em] mb-2">AI 解读</div>
            <div className="border border-nothing-border rounded-md p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                  interp.trend === '利' ? 'bg-green-500/10 text-green-400' :
                  interp.trend === '不利' ? 'bg-red-500/10 text-red-400' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {interp.trend}
                </span>
                <span className="font-mono text-[10px] text-nothing-text-disabled">
                  置信度：{interp.confidence}
                </span>
              </div>
              <div className="text-sm text-nothing-text-secondary leading-relaxed whitespace-pre-wrap">
                {interp.analysis}
              </div>
              <div className="mt-3 text-sm text-nothing-text-primary">
                {interp.answer}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
