# 修复方案 — 对抗性审查 + 第一性原理综合修复

**依据**: `docs/ADVERSARIAL-REVIEW-2026-07-01.md` + `docs/FIRST-PRINCIPLES-REVIEW.md`
**生成日期**: 2026-07-01
**执行策略**: 5 个优先级层级，按风险和依赖关系排序
**总预计工时**: ~50h

---

## 修复状态总览

| 优先级 | 总数 | 已完成 | 待修复 |
|--------|------|--------|--------|
| P0 构建阻断 | 1 | 0 | 1 |
| P1 本迭代必修 | 8 | 0 | 8 |
| P2 下迭代 | 14 | 0 | 14 |
| P3 技术债务 | 10 | 0 | 10 |
| **合计** | **33** | **0** | **33** |

---

## P0 — 构建阻断 (立即修复)

### P0-1. serialize.ts 缺失 (构建级故障)

**文件**: `src/engine/liuren/serialize.ts` (不存在)
**引用方**:
- `src/pages/LiurenResultView.tsx:20` — `import { deserializePan } from '../engine/liuren/serialize'`
- `src/hooks/useLiuren.ts:12` — `import { serializePan } from '../engine/liuren/serialize.js'`

**问题**: 两个文件导入了不存在的模块。TypeScript 编译会失败，Vercel 构建也会失败。

**修复方案**: 创建 `src/engine/liuren/serialize.ts`，包含:

```typescript
import type { LiurenPan, Branch, Gan, WuXing, SolarTermName, GeJu, ShenShaItem } from './types.js';
import type { LiurenPanData } from '../../types/index.js';

const VALID_BRANCHES = new Set(['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']);
const VALID_GANS = new Set(['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']);
const VALID_WUXING = new Set(['金','木','水','火','土']);

function assertBranch(value: string, field: string): Branch {
  if (!VALID_BRANCHES.has(value)) throw new Error(`deserializePan: 无效的地支 "${value}" in ${field}`);
  return value as Branch;
}

function assertGan(value: string, field: string): Gan {
  if (!VALID_GANS.has(value)) throw new Error(`deserializePan: 无效的天干 "${value}" in ${field}`);
  return value as Gan;
}

function assertWuxing(value: string, field: string): WuXing {
  if (!VALID_WUXING.has(value)) throw new Error(`deserializePan: 无效的五行 "${value}" in ${field}`);
  return value as WuXing;
}

/** 引擎类型 → 持久化类型 */
export function serializePan(pan: LiurenPan): LiurenPanData {
  return {
    dateTime: pan.dateTime.toISOString(),
    solarTerm: pan.solarTerm,
    yueJiang: pan.yueJiang,
    shiZhi: pan.shiZhi,
    dayGanZhi: `${pan.dayGanZhi[0]}${pan.dayGanZhi[1]}`,
    isDaytime: pan.isDaytime,
    geJu: pan.geJu,
    siKe: pan.siKe,
    sanChuan: pan.sanChuan.map(sc => ({
      branch: sc.branch,
      tianJiang: sc.tianJiang,
    })),
    tianDiPan: {
      diPan: pan.tianDiPan.diPan,
      tianPan: pan.tianDiPan.tianPan,
    },
    tianJiang: {
      guiRenBranch: pan.tianJiang.guiRenBranch,
      direction: pan.tianJiang.direction,
    },
    shenSha: pan.shenSha,
    warnings: pan.warnings,
  };
}

/** 持久化类型 → 引擎类型（带运行时验证） */
export function deserializePan(data: LiurenPanData): LiurenPan {
  // 验证必需字段
  if (!data.dayGanZhi || data.dayGanZhi.length < 2) {
    throw new Error('deserializePan: dayGanZhi 格式无效');
  }
  const dayGan = assertGan(data.dayGanZhi[0], 'dayGanZhi[0]');
  const dayZhi = assertBranch(data.dayGanZhi[1], 'dayGanZhi[1]');
  const shiZhi = assertBranch(data.shiZhi, 'shiZhi');
  const yueJiang = assertBranch(data.yueJiang, 'yueJiang');

  // 验证五行 (如有)
  if (data.geJu && typeof data.geJu === 'object') {
    const geJu = data.geJu as Record<string, unknown>;
    if (geJu.dayWuXing) assertWuxing(geJu.dayWuXing as string, 'geJu.dayWuXing');
    if (geJu.zhiWuXing) assertWuxing(geJu.zhiWuXing as string, 'geJu.zhiWuXing');
  }

  // 构建 LiurenPan
  return {
    dateTime: new Date(data.dateTime),
    solarTerm: data.solarTerm as SolarTermName,
    yueJiang,
    shiZhi,
    dayGanZhi: [dayGan, dayZhi],
    isDaytime: data.isDaytime,
    geJu: data.geJu as GeJu,
    siKe: data.siKe,
    sanChuan: data.sanChuan.map(sc => ({
      branch: assertBranch(sc.branch, `sanChuan.branch`),
      tianJiang: sc.tianJiang,
    })),
    tianDiPan: {
      diPan: data.tianDiPan.diPan as Record<string, Branch>,
      tianPan: data.tianDiPan.tianPan as Record<string, Branch>,
    },
    tianJiang: {
      guiRenBranch: assertBranch(data.tianJiang.guiRenBranch, 'tianJiang.guiRenBranch'),
      direction: data.tianJiang.direction,
    },
    shenSha: data.shenSha as ShenShaItem[],
    warnings: data.warnings ?? [],
  };
}
```

**验证**: `npx tsc --noEmit` 编译通过，`npm run test` 无回归。

---

## P1 — 本迭代必修 (安全性 + 数据完整性 + 无障碍)

### P1-1. LiurenResultView 反序列化无保护 (HIGH — 白屏风险)

**文件**: `src/pages/LiurenResultView.tsx:295`
**问题**: `deserializePan(pan)` 无 try/catch，损坏数据导致 React 组件树崩溃 → 白屏。
**修复方案**:

```typescript
// LiurenResultView.tsx:295 附近
const [deserializedPan, setDeserializedPan] = useState<LiurenPan | null>(null);
const [deserError, setDeserError] = useState<string | null>(null);

useEffect(() => {
  if (!pan) { setDeserializedPan(null); return; }
  try {
    setDeserializedPan(deserializePan(pan));
    setDeserError(null);
  } catch (err) {
    console.error('反序列化失败:', err);
    setDeserError('数据格式损坏，无法显示');
    setDeserializedPan(null);
  }
}, [pan]);

// JSX 中:
if (deserError) {
  return <div className="text-nothing-text-secondary p-6">{deserError}</div>;
}
```

### P1-2. GAN_HE 常量重复定义 (HIGH — 违反红线)

**文件**: `src/engine/liuren/shensha.ts:41-44`
**问题**: 本地定义 `GAN_HE`，`constants.ts:126` 已有同名导出。
**修复方案**:

```typescript
// 删除 shensha.ts:41-44 的本地 GAN_HE 定义
// 修改导入 (line 11):
import { CHONG_MAP, GAN_HE } from './constants.js';
```

**验证**: `npm run test -- tests/engine/liuren/shensha.test.ts` 无回归。

### P1-3. useDivination.ts 幻影数据 (HIGH — 用户信任)

**文件**: `src/hooks/useDivination.ts:104-116`
**问题**: catch 块与 try 块执行相同操作，DB 保存失败仍导航到结果页 → 用户看到从未持久化的结果。
**修复方案**:

```typescript
try {
  await createRecord(record, user.id);
  setSavedRecordId(record.id);
  setStep('result');
  navigate(`/result/${record.id}`);
} catch (err) {
  console.error('Failed to save record:', err);
  // 保存失败：记录到 localStorage 草稿，显示提示
  try {
    localStorage.setItem(`draft_${record.id}`, JSON.stringify(record));
  } catch { /* quota exceeded, ignore */ }
  setSaveError('保存失败，结果已暂存本地');
  setStep('result');
  navigate(`/result/${record.id}`);
} finally {
  completingRef.current = false;
}
```

### P1-4. WCAG 对比度不足 (HIGH — 全应用影响)

**文件**: `src/index.css:15`
**问题**: `--color-nothing-text-disabled: #999999`，在 `#F5F5F5` 上对比度 2.61:1，低于 WCAG AA 4.5:1。在 20+ 处使用。
**修复方案**:

```css
/* 修改一行 */
--color-nothing-text-disabled: #767676;  /* 4.54:1 对比度 */
```

同时修改 `src/components/layout/AppShell.tsx` 中非活跃导航项颜色：
```diff
- text-nothing-text-disabled
+ text-nothing-text-secondary  /* #666666, 7.0:1 对比度 */
```

### P1-5. FeedbackList 模态框无焦点陷阱 (HIGH — 键盘用户无法使用)

**文件**: `src/components/feedback/FeedbackList.tsx:70`
**问题**: 无 `role="dialog"`、`aria-modal`、焦点陷阱、Escape 键处理。
**修复方案**:

```tsx
// Modal 容器添加 ARIA
<div
  role="dialog"
  aria-modal="true"
  aria-label="反馈详情"
  ref={modalRef}
  onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
>

// 添加 useEffect 焦点陷阱
useEffect(() => {
  if (!showDetail) return;
  const modal = modalRef.current;
  if (!modal) return;
  const focusable = modal.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  first?.focus();

  const trap = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  };
  modal.addEventListener('keydown', trap);
  return () => modal.removeEventListener('keydown', trap);
}, [showDetail]);
```

### P1-6. LiurenDetailView 设计系统不一致 (HIGH — 视觉一致性)

**文件**: `src/pages/LiurenDetailView.tsx` (全文件)
**问题**: 使用 `gray-*` Tailwind + `dark:` 变体 + `lucide-react ArrowLeft`，与主应用 Nothing Design token 完全不同。
**修复方案**:

| 当前 | 替换为 |
|------|--------|
| `bg-gray-50 dark:bg-gray-900` | `bg-nothing-bg` |
| `bg-white dark:bg-gray-800` | `bg-nothing-surface` |
| `text-gray-800 dark:text-gray-100` | `text-nothing-text-primary` |
| `text-gray-600 dark:text-gray-400` | `text-nothing-text-secondary` |
| `border-gray-200 dark:border-gray-700` | `border-nothing-border` |
| `ArrowLeft` (lucide) | `← 返回` 文本 |
| 所有 `dark:` 变体 | 删除 |
| `framer-motion` 动画 | 条件渲染 `{isOpen && <Content />}` |

### P1-7. security.ts 零测试覆盖 (MEDIUM — 安全回归风险)

**文件**: `src/lib/security.ts` (5 个导出函数，零测试)
**修复方案**: 创建 `tests/lib/security.test.ts`

```typescript
// 覆盖目标:
describe('validateQuestion', () => {
  test('空字符串返回错误');
  test('超过200字符返回错误');
  test('纯空格返回错误');
  test('包含<script>标签返回错误');
  test('包含javascript:返回错误');
  test('包含onload=返回错误');
  test('正常中文问题通过');
});

describe('sanitizeForPrompt', () => {
  test('截断超过500字符');
  test('移除零宽字符');
  test('移除XML标签');
  test('保留正常标点');
});

describe('wrapUserInput', () => {
  test('包裹在<USER_INPUT>标签中');
  test('先sanitize再包裹');
});

describe('checkRateLimit', () => {
  test('间隔不足返回true');
  test('间隔足够返回false');
  test('首次调用返回false');
});

describe('validateDateRange', () => {
  test('1900年前日期返回错误');
  test('2100年后日期返回错误');
  test('有效日期通过');
  test('Invalid Date返回错误');
});
```

### P1-8. FeedbackForm 触摸目标过小 (MEDIUM — WCAG 2.5.5)

**文件**: `src/components/feedback/FeedbackForm.tsx:149`
**问题**: hit/miss/unclear 按钮约 20x28px，远低于 WCAG 44x44px 最小值。
**修复方案**:

```diff
- text-xs px-2 py-0.5 rounded
+ text-sm px-4 py-2.5 rounded-lg min-h-[44px]
```

---

## P2 — 下迭代 (架构改善 + 性能 + 测试)

### P2-1. App.tsx 添加顶层 ErrorBoundary

**文件**: `src/App.tsx`
**修复**: 在路由外层包裹 ErrorBoundary 组件，捕获未处理异常并显示友好回退 UI。

### P2-2. useLiuren 拆分 (316 行 God Hook)

**文件**: `src/hooks/useLiuren.ts`
**修复**: 拆分为 3 个 hook:
- `useLiurenCalculation` — 引擎计算 + AI 调用
- `useLiurenPersistence` — DB 读写 + 重复检查
- `useLiurenUI` — 步骤管理 + 错误状态

### P2-3. getAllRecords 添加分页

**文件**: `src/db/records.ts:127`
**修复**:
```typescript
export async function getAllRecords(
  userId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<DivinationRecord[]> {
  const { limit = 50, offset = 0 } = options;
  // ... 添加 .range(offset, offset + limit - 1)
}
```

### P2-4. HomeView 全量记录仅为计数

**文件**: `src/pages/HomeView.tsx:16`
**修复**: 改用 Supabase count 查询:
```typescript
const { count } = await supabase
  .from('records')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', user.id);
```

### P2-5. API 代理输入校验

**文件**: `api/deepseek.ts:18`
**修复**: 添加 Zod schema:
```typescript
const RequestSchema = z.object({
  model: z.enum(['deepseek-chat', 'deepseek-reasoner']),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string().max(10000),
  })).max(20),
  max_tokens: z.number().int().min(1).max(8192).optional(),
});
```

### P2-6. 服务端速率限制

**文件**: `api/deepseek.ts`
**修复**: 使用 Vercel Edge Middleware 或内存 Map 实现 per-user 限流。

### P2-7. security.ts 测试补全

**见 P1-7** (已包含完整测试用例)。

### P2-8. AI Prompt 构建器测试

**文件**: `tests/ai/liuren-prompt-builder.test.ts`
**修复**: 测试 V2 prompt 构建的输入/输出格式。

### P2-9. parseAIResponse 测试

**文件**: `tests/ai/liuren-call.test.ts`
**修复**: 测试 AI 响应解析的边界情况（空响应、格式错误、超长内容）。

### P2-10. FeedbackList 暗色主题迁移

**文件**: `src/components/feedback/FeedbackList.tsx`
**修复**: 将 `bg-charcoal`、`text-luxury-50`、`bg-jade`、`bg-vermillion` 替换为 Nothing Design token。

### P2-11. bifaRules.ts luMap/muMap 提取

**文件**: `src/engine/liuren/bifaRules.ts:119-146`
**修复**: 提取到 `constants.ts` 作为共享查找表:
```typescript
// constants.ts 新增
export const LU_MAP: Record<Gan, Branch> = { '甲':'寅', '乙':'卯', ... };
export const MU_KU_MAP: Record<Branch, Branch> = { '子':'辰', '丑':'辰', ... };
```

### P2-12. 引擎输入验证增强

**文件**: `src/engine/liuren/index.ts:85`
**修复**: 在 `calculateLiuren()` 入口添加参数验证（日期有效性、时辰范围、年份下限）。

### P2-13. 底部导航中文统一

**文件**: `src/components/layout/AppShell.tsx`
**修复**: `HOME → 首页`、`DIVINE → 起卦`、`STATS → 统计`，六壬保持不变。

### P2-14. zhanShi.ts 占事推断测试

**文件**: `tests/engine/liuren/zhanShi.test.ts`
**修复**: 测试关键词匹配 + 默认回退。

---

## P3 — 技术债务 (持续改进)

| 编号 | 问题 | 文件 | 修复方案 |
|------|------|------|----------|
| P3-1 | motion/lucide-react 未使用 | `package.json` | 确认无导入后 `npm uninstall motion lucide-react` |
| P3-2 | uuid → crypto.randomUUID() | `package.json` | 替换所有 `v4()` 为 `crypto.randomUUID()` |
| P3-3 | 非懒加载路由 | `src/App.tsx` | StatsView、HistoryDetailView、SettingsView 添加 `React.lazy` |
| P3-4 | signals.sort() 原地修改 | `src/engine/liuren/framework.ts:92` | 改为 `[...signals].sort(...)` |
| P3-5 | GSAP 动画性能优化 | 多个组件 | HexagramBoard 条件动画、PageTransition 懒初始化 |
| P3-6 | Playwright 配置完善 | `playwright.config.ts` | 添加 firefox/webkit 项目、retries、环境变量 |
| P3-7 | legacy CSS 类清理 | `src/index.css:226-254` | 删除 `.input-luxury`、`.btn-gold`、旧色值 token |
| P3-8 | types 循环依赖 | `src/types/index.ts` | 将 `KeGeCategory` 移至 `framework-types.ts` |
| P3-9 | 重复 ProtectedRoute | `src/App.tsx` | 移除内层冗余 `<ProtectedRoute>` 包装 |
| P3-10 | Prefers-reduced-motion | 多个组件 | 导入 `useReducedMotion`，GSAP 动画条件化 |

---

## 执行依赖关系

```
P0-1 (serialize.ts 创建)
  ↓
P1-1 (deserializePan try/catch)
  ↓
P1-2 (GAN_HE 去重)  ← 无依赖，可并行
P1-3 (幻影数据修复)  ← 无依赖，可并行
P1-4 (WCAG 对比度)   ← 无依赖，可并行
P1-5 (FeedbackList 焦点陷阱)
P1-6 (LiurenDetailView 样式迁移)
P1-7 (security.ts 测试)
P1-8 (FeedbackForm 触摸目标)
  ↓
P2-1 (ErrorBoundary)
P2-2 (useLiuren 拆分)
P2-3 → P2-4 (分页优化)
P2-5 → P2-6 (API 安全加固)
P2-7 ~ P2-14 (测试 + UI 优化)
  ↓
P3 (技术债务清理)
```

## 验证检查清单

每个优先级完成后执行:

```bash
npx tsc -b --noEmit    # 类型检查
npm run lint            # Lint
npm run test            # 单元测试
npm run build           # 构建
npx playwright test     # E2E 测试
```

## 回滚策略

每个修改独立 commit。每个优先级完成后创建 tag:
```bash
git tag fix-p0
git tag fix-p1
git tag fix-p2
git tag fix-p3
```

## 两份审查报告交叉验证

| 审查发现 | 验证状态 | 说明 |
|---------|---------|------|
| yingqi.ts 常量重复 | ✅ 已修复 | 已从 constants.ts 导入 |
| V1/V2 AI 路径并存 | ✅ 已修复 | 仅 V2 在使用 |
| FrameworkAnalysis 类型循环 | ✅ 已修复 | 已从 engine 导入 |
| serialize.ts 类型转换层 | ❌ 文件缺失 | **P0-1 紧急修复** |
| GAN_HE 重复定义 | ❌ 存在 | P1-2 修复 |
| bifaRules luMap/muMap | ❌ 存在 | P2-11 修复 |
| deserializePan 无保护 | ❌ 存在 | P1-1 修复 |
| completeCasting 幻影数据 | ❌ 存在 | P1-3 修复 |
| WCAG 对比度 | ❌ 存在 | P1-4 修复 |
| FeedbackList 焦点陷阱 | ❌ 存在 | P1-5 修复 |
| LiurenDetailView 样式 | ❌ 存在 | P1-6 修复 |
| security.ts 零测试 | ❌ 存在 | P1-7 修复 |
| FeedbackForm 触摸目标 | ❌ 存在 | P1-8 修复 |
