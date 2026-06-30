/**
 * 大六壬结果详情页
 *
 * 排版原则：
 *   1. 阅读顺序 = 推导顺序：天地盘 → 四课 → 三传 → 解读
 *   2. 移动端单列全宽，不横向挤压中文字符
 *   3. 每个区块必须有内容或明确的空状态提示，杜绝空白
 *   4. AI 结论始终显示（即使无数据也给提示）
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

// ─── Section header ─────────────────────────────────────────────

function SectionLabel({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="font-mono text-xs tracking-[0.15em] text-nothing-text-secondary">{label}</span>
      {sub && <span className="font-mono text-[10px] text-nothing-text-disabled">· {sub}</span>}
    </div>
  );
}

// ─── Collapsible section ────────────────────────────────────────

function Collapsible({
  title,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  badge?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-nothing-border rounded-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-nothing-bg-secondary hover:bg-nothing-raised transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-[0.15em] text-nothing-text-secondary">
            {title}
          </span>
          {badge !== undefined && badge > 0 && (
            <span className="font-mono text-[9px] text-nothing-text-disabled bg-nothing-raised px-1.5 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>
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

// ─── SanChuan — 竖排，每传一行 ─────────────────────────────────

function SanChuanCard({ items }: { items: LiurenPanData['sanChuan'] }) {
  const labels = ['初传', '中传', '末传'];
  const sublabels = ['发用', '传递', '归结'];

  if (!items || items.length === 0) {
    return (
      <div>
        <SectionLabel label="三传" sub="九宗门推导" />
        <div className="border border-nothing-border rounded-md p-4 text-center">
          <span className="font-mono text-[11px] text-nothing-text-disabled">暂无三传数据</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionLabel label="三传" sub="九宗门推导" />
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-4 border rounded-md px-4 py-3 ${
              idx === 0
                ? 'border-nothing-accent/30 bg-nothing-accent-subtle'
                : 'border-nothing-border'
            }`}
          >
            {/* 左侧：地支 */}
            <div className="text-center shrink-0 w-12">
              <div
                className={`font-mono text-2xl leading-none ${
                  idx === 0 ? 'text-nothing-accent' : 'text-nothing-text-display'
                }`}
              >
                {item.branch || '—'}
              </div>
              {item.dunGan && (
                <div className="font-mono text-[9px] text-nothing-text-disabled mt-1">
                  遁{item.dunGan}
                </div>
              )}
            </div>

            {/* 右侧：标签 + 天将 + 六亲 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[11px] text-nothing-text-secondary">{labels[idx]}</span>
                <span className="font-mono text-[9px] text-nothing-text-disabled">{sublabels[idx]}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-nothing-text-primary">
                  {item.tianJiang || '—'}
                </span>
                <span className="font-mono text-[11px] text-nothing-text-disabled">
                  {item.liuQin || ''}
                </span>
              </div>
            </div>

            {/* 流向箭头 */}
            {idx < items.length - 1 && (
              <div className="text-nothing-text-disabled text-[10px] shrink-0">↓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SiKe — 2×2 网格 ───────────────────────────────────────────

function SiKeCard({ items }: { items: LiurenPanData['siKe'] }) {
  const labels = ['一课', '二课', '三课', '四课'];

  if (!items || items.length === 0) {
    return (
      <div>
        <SectionLabel label="四课" sub="日干支推演" />
        <div className="border border-nothing-border rounded-md p-4 text-center">
          <span className="font-mono text-[11px] text-nothing-text-disabled">暂无四课数据</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionLabel label="四课" sub="日干支推演" />
      <div className="grid grid-cols-2 gap-2">
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
              <div className="font-mono text-xl text-nothing-text-display">
                {item.upperGod || '—'}
              </div>
              <div className={`font-mono text-sm my-1 ${relColor}`}>{relSymbol}</div>
              <div className="font-mono text-xl text-nothing-text-secondary">
                {item.lowerGod || '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MetaRow ────────────────────────────────────────────────────

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="font-mono text-[11px] text-nothing-text-disabled">{label}</span>
      <span className="font-mono text-[11px] text-nothing-text-secondary">{value || '—'}</span>
    </div>
  );
}

// ─── ShenSha ────────────────────────────────────────────────────

function ShenShaList({ items }: { items: NonNullable<LiurenPan['shenSha']> }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-3">
        <span className="font-mono text-[11px] text-nothing-text-disabled">暂无神煞数据</span>
      </div>
    );
  }

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
        const color =
          cat === '吉' ? 'text-green-600' : cat === '凶' ? 'text-red-500' : 'text-nothing-text-secondary';
        return (
          <div key={cat}>
            <div className={`font-mono text-[10px] tracking-wider mb-1.5 ${color}`}>{cat}神煞</div>
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

// ─── Empty state helper ─────────────────────────────────────────

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="text-center py-4">
      <span className="font-mono text-[11px] text-nothing-text-disabled">{text}</span>
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
        if (r) setRecord(r);
        else setError('记录不存在');
      })
      .catch((err) => setError(err instanceof Error ? err.message : '加载失败'))
      .finally(() => setLoading(false));
  }, [id, user]);

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

  // 计算天将/神煞是否有实际内容
  const hasTianJiang = pan?.tianJiang?.branchToJiang && Object.keys(pan.tianJiang.branchToJiang).length > 0;
  const hasShenSha = pan?.shenSha && pan.shenSha.length > 0;

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

      <main className="pt-16 pb-24 px-5">
        <div className="max-w-md mx-auto">

          {/* ══════════════════════════════════════════════════════
              ① 问题 + 课式概览
             ══════════════════════════════════════════════════════ */}

          <div className="pt-5 pb-4 border-b border-nothing-border mb-6">
            <p className="font-mono text-[10px] text-nothing-text-disabled tracking-wider mb-1">
              所问之事
            </p>
            <h1 className="text-base text-nothing-text-display leading-relaxed mb-4">
              {record.question}
            </h1>

            {pan ? (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-lg text-nothing-text-display">{pan.geJu}</span>
                <span className="text-nothing-text-disabled">·</span>
                <span className="font-mono text-[11px] text-nothing-text-secondary">{pan.dayGanZhi}</span>
                <span className="text-nothing-text-disabled">·</span>
                <span className="font-mono text-[11px] text-nothing-text-disabled">
                  {pan.solarTerm} 月将{pan.yueJiang} {pan.isDaytime ? '昼' : '夜'}占{pan.shiZhi}时
                </span>
              </div>
            ) : (
              <div className="font-mono text-[11px] text-nothing-text-disabled">
                {record.method === 'liuren-zhengshi' ? '大六壬·正时' :
                 record.method === 'liuren-huoshi' ? '大六壬·活时' : '六壬占卜'}
                {' · '}
                {new Date(record.timestamp).toLocaleString('zh-CN')}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════
              ② AI 结论（始终显示，最优先）
             ══════════════════════════════════════════════════════ */}

          <div className="mb-6">
            {interp ? (
              <div className="border border-nothing-border rounded-md p-4 bg-nothing-surface">
                <div className="flex items-center gap-3 mb-3">
                  <TrendBadge trend={interp.trend} />
                  <span className="font-mono text-[10px] text-nothing-text-disabled">
                    置信度 {interp.confidence}
                  </span>
                </div>
                <p className="text-sm text-nothing-text-primary leading-relaxed">{interp.answer}</p>
              </div>
            ) : (
              <div className="border border-nothing-border rounded-md p-4 bg-nothing-surface">
                <EmptyHint text="暂无 AI 解读" />
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════
              ③ 天地盘
             ══════════════════════════════════════════════════════ */}

          {pan?.tianDiPan ? (
            <div className="mb-6">
              <LiurenPanTable tianDiPan={pan.tianDiPan} />
            </div>
          ) : pan ? (
            <div className="mb-6">
              <SectionLabel label="天地盘" />
              <EmptyHint text="暂无天地盘数据" />
            </div>
          ) : null}

          {/* ══════════════════════════════════════════════════════
              ④ 四课
             ══════════════════════════════════════════════════════ */}

          {pan && (
            <div className="mb-6">
              <SiKeCard items={pan.siKe} />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              ⑤ 三传
             ══════════════════════════════════════════════════════ */}

          {pan && (
            <div className="mb-6">
              <SanChuanCard items={pan.sanChuan} />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              ⑥ 警告（始终展示，如果有）
             ══════════════════════════════════════════════════════ */}

          {pan?.warnings && pan.warnings.length > 0 && (
            <div className="mb-6">
              <WarningList warnings={pan.warnings} />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              ⑦ 天将与神煞（合并折叠）
             ══════════════════════════════════════════════════════ */}

          {(hasTianJiang || hasShenSha) && (
            <div className="mb-6">
              <Collapsible
                title="天将与神煞"
                badge={(hasShenSha ? pan!.shenSha!.length : 0)}
              >
                <div className="space-y-5">
                  {/* 天将 */}
                  {hasTianJiang && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] text-nothing-text-disabled tracking-wider">
                          天将排列
                        </span>
                        <span className="font-mono text-[10px] text-nothing-text-disabled">
                          贵人 {pan!.tianJiang!.guiRenBranch} ({pan!.tianJiang!.direction}行)
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {Object.entries(pan!.tianJiang!.branchToJiang!).map(([branch, jiang]) => (
                          <div
                            key={branch}
                            className="flex items-center justify-between px-2 py-1.5 border border-nothing-border rounded text-[11px]"
                          >
                            <span className="font-mono text-nothing-text-display">{branch}</span>
                            <span className="font-mono text-nothing-text-disabled">
                              {jiang as TianJiangName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 神煞 */}
                  {hasShenSha && (
                    <div>
                      <ShenShaList items={pan!.shenSha as NonNullable<LiurenPan['shenSha']>} />
                    </div>
                  )}
                </div>
              </Collapsible>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              ⑧ AI 详细解读
             ══════════════════════════════════════════════════════ */}

          {interp && interp.analysis && (
            <div className="mb-6">
              <Collapsible title="AI 详细解读">
                <div className="space-y-4">
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
            </div>
          )}

          {/* 兼容：无 liurenPan 但有 interpretation */}
          {!pan && interp && (
            <div className="mb-6">
              <Interpretation record={record} />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              ⑨ 反馈
             ══════════════════════════════════════════════════════ */}

          <div className="mb-6">
            <FeedbackForm record={record} onUpdated={(r) => setRecord(r)} />
          </div>

          {record.feedback.detail && (
            <div className="mb-6">
              <Collapsible title="反馈详情">
                <div className="text-sm text-nothing-text-secondary space-y-2">
                  {record.feedback.detail.actualResult && <p>实际结果：{record.feedback.detail.actualResult}</p>}
                  {record.feedback.detail.satisfaction !== undefined && (
                    <p>满意度：{record.feedback.detail.satisfaction}/5</p>
                  )}
                  {record.feedback.detail.actualDuration !== undefined && (
                    <p>实际耗时：{record.feedback.detail.actualDuration} 天</p>
                  )}
                  {record.feedback.detail.actionTaken && <p>实际行动：{record.feedback.detail.actionTaken}</p>}
                  {record.feedback.detail.notes && <p>备注：{record.feedback.detail.notes}</p>}
                </div>
              </Collapsible>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              ⑩ 起课参数 + 元信息
             ══════════════════════════════════════════════════════ */}

          {pan && (
            <div className="mb-6">
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
            </div>
          )}

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
