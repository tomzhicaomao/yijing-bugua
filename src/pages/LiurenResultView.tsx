/**
 * 大六壬结果详情页
 *
 * 信息架构（渐进式披露）：
 *   Layer 1 — 结论层：问题 + 格局 + AI 判断（一眼可见）
 *   Layer 2 — 核心层：三传 → 四课（主要推导结果）
 *   Layer 3 — 参考层：天地盘、起课参数（可折叠）
 *   Layer 4 — 附加层：天将、神煞、警告（可折叠）
 *   Layer 5 — 反思层：AI 详细解读 + 反馈
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecordById } from '../db/records';
import { useAuth } from '../auth/AuthContext';
import LiurenPanTable from '../components/liuren/LiurenPanTable';
import Interpretation from '../components/result/Interpretation';
import FeedbackForm from '../components/feedback/FeedbackForm';
import type { DivinationRecord, LiurenPanData } from '../types';
import type { LiurenPan, TianJiangName } from '../engine/liuren/types';

// ─── Collapsible section ────────────────────────────────────────

function Collapsible({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-nothing-border rounded-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-nothing-bg-secondary hover:bg-nothing-raised transition-colors"
      >
        <span className="font-mono text-xs tracking-[0.15em] text-nothing-text-secondary">
          {title}
        </span>
        <span className="font-mono text-[10px] text-nothing-text-disabled">
          {open ? '收起' : '展开'}
        </span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

// ─── Trend badge ────────────────────────────────────────────────

function TrendBadge({ trend }: { trend: string }) {
  const style =
    trend === '利'
      ? 'bg-green-500/10 text-green-600 border-green-500/20'
      : trend === '不利'
        ? 'bg-red-500/10 text-red-600 border-red-500/20'
        : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';

  return (
    <span className={`inline-block font-mono text-xs px-3 py-1 rounded-full border ${style}`}>
      {trend}
    </span>
  );
}

// ─── SanChuan card (三传 — 最核心) ──────────────────────────────

function SanChuanCard({ items }: { items: LiurenPanData['sanChuan'] }) {
  const labels = ['初传', '中传', '末传'];
  const sublabels = ['发用', '传递', '归结'];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-xs tracking-[0.15em] text-nothing-text-secondary">三传</span>
        <span className="font-mono text-[10px] text-nothing-text-disabled">· 九宗门推导</span>
      </div>

      <div className="flex gap-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex-1 border rounded-md p-4 text-center ${
              idx === 0
                ? 'border-nothing-accent/30 bg-nothing-accent-subtle'
                : 'border-nothing-border'
            }`}
          >
            <div className="font-mono text-[10px] text-nothing-text-disabled mb-0.5">
              {labels[idx]}
            </div>
            <div className="font-mono text-[10px] text-nothing-text-disabled mb-2">
              {sublabels[idx]}
            </div>
            <div
              className={`font-mono text-2xl mb-2 ${
                idx === 0 ? 'text-nothing-accent' : 'text-nothing-text-display'
              }`}
            >
              {item.branch}
            </div>
            <div className="space-y-1">
              <div className="font-mono text-[11px] text-nothing-text-secondary">{item.tianJiang}</div>
              <div className="font-mono text-[11px] text-nothing-text-disabled">{item.liuQin}</div>
              <div className="font-mono text-[10px] text-nothing-text-disabled">
                遁{item.dunGan}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 三传走向指示 */}
      <div className="flex items-center justify-center gap-1 mt-2">
        <span className="font-mono text-[10px] text-nothing-text-disabled">发用</span>
        <span className="text-nothing-text-disabled">→</span>
        <span className="font-mono text-[10px] text-nothing-text-disabled">传递</span>
        <span className="text-nothing-text-disabled">→</span>
        <span className="font-mono text-[10px] text-nothing-text-disabled">归结</span>
      </div>
    </div>
  );
}

// ─── SiKe card (四课) ───────────────────────────────────────────

function SiKeCard({ items }: { items: LiurenPanData['siKe'] }) {
  const labels = ['一课', '二课', '三课', '四课'];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-xs tracking-[0.15em] text-nothing-text-secondary">四课</span>
        <span className="font-mono text-[10px] text-nothing-text-disabled">· 日干支推演</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {items.map((item, idx) => {
          const relSymbol =
            item.relation === '上克下' ? '↓克' : item.relation === '下贼上' ? '↑贼' : '＝和';
          const relColor =
            item.relation === '下贼上'
              ? 'text-red-500'
              : item.relation === '上克下'
                ? 'text-orange-500'
                : 'text-green-500';

          return (
            <div key={idx} className="border border-nothing-border rounded-md p-3 text-center">
              <div className="font-mono text-[10px] text-nothing-text-disabled mb-2">{labels[idx]}</div>
              <div className="font-mono text-lg text-nothing-text-display">{item.upperGod}</div>
              <div className={`font-mono text-xs my-1 ${relColor}`}>{relSymbol}</div>
              <div className="font-mono text-lg text-nothing-text-secondary">{item.lowerGod}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Meta info row ──────────────────────────────────────────────

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="font-mono text-[11px] text-nothing-text-disabled">{label}</span>
      <span className="font-mono text-[11px] text-nothing-text-secondary">{value}</span>
    </div>
  );
}

// ─── ShenSha list (神煞) ───────────────────────────────────────

function ShenShaList({ items }: { items: NonNullable<LiurenPan['shenSha']> }) {
  if (!items || items.length === 0) return null;

  const grouped = {
    '吉': items.filter((s) => s.category === '吉'),
    '凶': items.filter((s) => s.category === '凶'),
    '中性': items.filter((s) => s.category === '中性'),
  };

  return (
    <div className="space-y-3">
      {(['吉', '凶', '中性'] as const).map((cat) => {
        const group = grouped[cat];
        if (group.length === 0) return null;
        const color = cat === '吉' ? 'text-green-600' : cat === '凶' ? 'text-red-500' : 'text-nothing-text-secondary';
        return (
          <div key={cat}>
            <div className={`font-mono text-[10px] tracking-wider mb-1.5 ${color}`}>
              {cat}神煞
            </div>
            <div className="flex flex-wrap gap-2">
              {group.map((s, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-mono ${
                    cat === '吉'
                      ? 'border-green-500/20 bg-green-500/5 text-green-700'
                      : cat === '凶'
                        ? 'border-red-500/20 bg-red-500/5 text-red-600'
                        : 'border-nothing-border bg-nothing-bg-secondary text-nothing-text-secondary'
                  }`}
                >
                  {s.name}
                  <span className="text-nothing-text-disabled">{s.branch}</span>
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Warnings ───────────────────────────────────────────────────

function WarningList({ warnings }: { warnings: string[] }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="border border-orange-500/30 rounded-md overflow-hidden">
      <div className="px-4 py-2 bg-orange-500/10 border-b border-orange-500/30">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 text-sm">⚠</span>
          <span className="font-mono text-xs tracking-[0.1em] text-orange-600">注意事项</span>
        </div>
        <p className="mt-0.5 font-mono text-[10px] text-orange-400">
          以下提示不影响起课结果，解读时留意即可
        </p>
      </div>
      <div className="p-3 space-y-2">
        {warnings.map((w, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-orange-400 text-[10px] mt-1 shrink-0">▸</span>
            <span className="font-mono text-[11px] text-orange-700 leading-relaxed">{w}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main view ──────────────────────────────────────────────────

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
      .then((r) => {
        if (r) {
          setRecord(r);
        } else {
          setError('记录不存在');
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : '加载失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, user]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-nothing-bg text-nothing-text-primary flex items-center justify-center">
        <div className="space-y-3 w-48">
          <div className="h-4 bg-nothing-bg-secondary rounded animate-pulse" />
          <div className="h-4 bg-nothing-bg-secondary rounded animate-pulse w-3/4" />
          <div className="h-4 bg-nothing-bg-secondary rounded animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  // ── Error state ──
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
      {/* ── Top bar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-nothing-bg/80 backdrop-blur-md border-b border-nothing-border">
        <div className="flex items-center justify-between px-6 h-16 max-w-md mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="font-mono text-xs tracking-[0.1em] text-nothing-text-secondary hover:text-nothing-text-primary transition-colors"
          >
            ← 返回
          </button>
          <span className="font-mono text-xs tracking-[0.15em] text-nothing-text-secondary">六壬详情</span>
          <div className="w-12" />
        </div>
      </nav>

      <main className="pt-16 pb-24 px-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* ════════════════════════════════════════════════════
              Layer 1 — 结论层：一眼看到"所以呢"
             ════════════════════════════════════════════════════ */}

          {/* 问题 + AI 结论 */}
          <div className="pt-4">
            <p className="font-mono text-[10px] text-nothing-text-disabled tracking-wider mb-1">
              所问之事
            </p>
            <h1 className="text-lg text-nothing-text-display leading-relaxed mb-3">
              {record.question}
            </h1>

            {/* AI 结论 — 最突出 */}
            {interp && (
              <div className="border border-nothing-border rounded-md p-4 bg-nothing-surface">
                <div className="flex items-center gap-3 mb-3">
                  <TrendBadge trend={interp.trend} />
                  <span className="font-mono text-[10px] text-nothing-text-disabled">
                    置信度 {interp.confidence}
                  </span>
                </div>
                <p className="text-sm text-nothing-text-primary leading-relaxed">{interp.answer}</p>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════════════
              Layer 1.5 — 格局概览
             ════════════════════════════════════════════════════ */}

          {pan && (
            <div className="border border-nothing-border rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xl text-nothing-text-display">{pan.geJu}</span>
                <span className="font-mono text-[11px] text-nothing-text-disabled">{pan.dayGanZhi}</span>
              </div>
              <div className="font-mono text-[10px] text-nothing-text-disabled">
                {pan.solarTerm} · 月将{pan.yueJiang} · {pan.isDaytime ? '昼' : '夜'}占{pan.shiZhi}时
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              Layer 2 — 核心层：三传 → 四课
             ════════════════════════════════════════════════════ */}

          {pan && (
            <div className="space-y-5">
              {/* 三传 — 最核心输出 */}
              <SanChuanCard items={pan.sanChuan} />

              {/* 四课 — 推导过程 */}
              <SiKeCard items={pan.siKe} />
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              Layer 3 — 参考层：天地盘、起课参数（可折叠）
             ════════════════════════════════════════════════════ */}

          {pan && pan.tianDiPan && (
            <Collapsible title="天地盘">
              <LiurenPanTable tianDiPan={pan.tianDiPan} />
            </Collapsible>
          )}

          {pan && (
            <Collapsible title="起课参数">
              <div className="divide-y divide-nothing-border">
                <MetaRow label="日干支" value={pan.dayGanZhi} />
                <MetaRow label="节气" value={pan.solarTerm} />
                <MetaRow label="月将" value={pan.yueJiang} />
                <MetaRow label="占时" value={pan.shiZhi} />
                <MetaRow label="昼夜" value={pan.isDaytime ? '昼占' : '夜占'} />
                <MetaRow label="格局" value={pan.geJu} />
              </div>
            </Collapsible>
          )}

          {/* ════════════════════════════════════════════════════
              Layer 4 — 附加层：天将、神煞、警告（可折叠）
             ════════════════════════════════════════════════════ */}

          {pan && pan.tianJiang && (
            <Collapsible title="天将排列">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-nothing-text-disabled">贵人所在</span>
                  <span className="font-mono text-[11px] text-nothing-text-secondary">
                    {pan.tianJiang.guiRenBranch} ({pan.tianJiang.direction}行)
                  </span>
                </div>
                {pan.tianJiang.branchToJiang && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {Object.entries(pan.tianJiang.branchToJiang).map(([branch, jiang]) => (
                      <div
                        key={branch}
                        className="flex items-center justify-between px-2 py-1.5 border border-nothing-border rounded text-[11px]"
                      >
                        <span className="font-mono text-nothing-text-display">{branch}</span>
                        <span className="font-mono text-nothing-text-disabled">{jiang as TianJiangName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Collapsible>
          )}

          {pan && pan.shenSha && pan.shenSha.length > 0 && (
            <Collapsible title={`神煞 (${pan.shenSha.length})`}>
              <ShenShaList items={pan.shenSha as NonNullable<LiurenPan['shenSha']>} />
            </Collapsible>
          )}

          {/* 警告 — 始终展示（如果有） */}
          {pan && pan.warnings && pan.warnings.length > 0 && (
            <WarningList warnings={pan.warnings} />
          )}

          {/* ════════════════════════════════════════════════════
              Layer 5 — 反思层：AI 详细解读 + 反馈
             ════════════════════════════════════════════════════ */}

          {interp && interp.analysis && (
            <Collapsible title="AI 详细解读" defaultOpen={false}>
              <div className="space-y-3">
                {interp.conditions && interp.conditions.length > 0 && (
                  <div>
                    <div className="font-mono text-[10px] text-nothing-text-disabled tracking-wider mb-1.5">
                      条件
                    </div>
                    <ul className="space-y-1">
                      {interp.conditions.map((c, i) => (
                        <li key={i} className="text-sm text-nothing-text-secondary flex items-start gap-2">
                          <span className="text-nothing-text-disabled shrink-0">·</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {interp.timeWindow && (
                  <div>
                    <div className="font-mono text-[10px] text-nothing-text-disabled tracking-wider mb-1">
                      时间窗口
                    </div>
                    <p className="text-sm text-nothing-text-secondary">{interp.timeWindow}</p>
                  </div>
                )}
                <div>
                  <div className="font-mono text-[10px] text-nothing-text-disabled tracking-wider mb-1">
                    详细分析
                  </div>
                  <p className="text-sm text-nothing-text-secondary leading-relaxed whitespace-pre-wrap">
                    {interp.analysis}
                  </p>
                </div>
              </div>
            </Collapsible>
          )}

          {/* 兼容：无 liurenPan 但有 interpretation 的记录 */}
          {!pan && interp && <Interpretation record={record} />}

          {/* 反馈 */}
          <FeedbackForm record={record} onUpdated={(r) => setRecord(r)} />

          {/* 反馈详情 */}
          {record.feedback.detail && (
            <Collapsible title="反馈详情">
              <div className="text-sm text-nothing-text-secondary space-y-2">
                {record.feedback.detail.actualResult && (
                  <p>实际结果：{record.feedback.detail.actualResult}</p>
                )}
                {record.feedback.detail.satisfaction !== undefined && (
                  <p>满意度：{record.feedback.detail.satisfaction}/5</p>
                )}
                {record.feedback.detail.actualDuration !== undefined && (
                  <p>实际耗时：{record.feedback.detail.actualDuration} 天</p>
                )}
                {record.feedback.detail.actionTaken && (
                  <p>实际行动：{record.feedback.detail.actionTaken}</p>
                )}
                {record.feedback.detail.notes && <p>备注：{record.feedback.detail.notes}</p>}
              </div>
            </Collapsible>
          )}

          {/* 记录元信息 */}
          <div className="pt-4 border-t border-nothing-border">
            <div className="font-mono text-[10px] text-nothing-text-disabled space-y-1">
              <p>记录 ID：{record.id}</p>
              <p>占卜时间：{new Date(record.timestamp).toLocaleString('zh-CN')}</p>
              <p>
                方式：
                {record.method === 'liuren-zhengshi'
                  ? '大六壬·正时'
                  : record.method === 'liuren-huoshi'
                    ? '大六壬·活时'
                    : record.method === 'virtual'
                      ? '虚拟摇卦'
                      : '手动输入'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
