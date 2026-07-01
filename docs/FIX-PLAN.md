# 修复方案 — 基于第一性原理审查

**依据**: `docs/FIRST-PRINCIPLES-REVIEW.md`
**生成日期**: 2026-07-01
**执行策略**: 4 个阶段，按风险和依赖关系排序

---

## 阶段 1: 常量去重 + 引擎输入验证 (CRITICAL)

**目标**: 消除计算错误的根源，保障"计算正确性"本质要素。
**预计总工时**: 2.5h
**风险**: 低 — 纯重构，不改变外部行为

### 1.1 统一五行关系常量

**当前状态**: 同一五行生克关系在 3 处独立定义。

| 位置 | 变量 | 行号 |
|------|------|------|
| `types.ts` | `shengCycle` / `keCycle` (getShengKe 内) | 176-183 |
| `dungan.ts` | `shengCycle` / `keCycle` (calcLiuQin 内) | 95-113 |
| `constants.ts` | `SHENG_MATRIX` / `KE_MATRIX` + `isSheng()` / `isKe()` | 18-34, 166-173 |

**修复方案**:

**Step 1** — 确认 `constants.ts` 中已有导出函数:
```typescript
// constants.ts — 已有 isSheng() 和 isKe()
// 确认 isSheng(a, b) 和 isKe(a, b) 可替代 getShengKe()
```

**Step 2** — 重写 `types.ts:getShengKe()` 复用 `constants.ts`:
```typescript
// types.ts
import { isSheng, isKe } from './constants.js';

export function getShengKe(a: WuXing, b: WuXing): 'sheng' | 'ke' | 'bihe' {
  if (a === b) return 'bihe';
  if (isSheng(a, b)) return 'sheng';
  if (isKe(a, b)) return 'ke';
  return 'bihe';
}
```

**Step 3** — 重写 `dungan.ts:calcLiuQin()` 复用 `isSheng()` / `isKe()`:
```typescript
// dungan.ts
import { isSheng, isKe } from './constants.js';

export function calcLiuQin(dayGanWuXing: WuXing, targetWuXing: WuXing): LiuQin {
  if (dayGanWuXing === targetWuXing) return '兄弟';
  if (isSheng(dayGanWuXing, targetWuXing)) return '子孙';
  if (isSheng(targetWuXing, dayGanWuXing)) return '父母';
  if (isKe(dayGanWuXing, targetWuXing)) return '妻财';
  if (isKe(targetWuXing, dayGanWuXing)) return '官鬼';
  return '兄弟'; // fallback
}
```

**验证**: 运行 `npm run test -- tests/engine/liuren/constants.test.ts` 确认无回归。

### 1.2 统一地支常量

**当前状态**: `ALL_BRANCHES` 在 `types.ts` 中定义，但 6+ 处重新定义局部数组。

| 文件 | 行号 | 当前变量名 | 修改为 |
|------|------|-----------|--------|
| `constants.ts` | 231, 240 | 局部 `branches` | 导入 `ALL_BRANCHES` |
| `kongwang-detect.ts` | 29 | 局部 `zhiOrder` | 导入 `ALL_BRANCHES` |
| `shensha.ts` | 155, 178-179 | 局部 `branches`/`ganOrder`/`zhiOrder` | 导入 `ALL_BRANCHES` + `ALL_GAN` |
| `yingqi.ts` | 多处 | 未使用规范常量 | 导入 `ALL_BRANCHES` |

**修复方案**: 每个文件添加 `import { ALL_BRANCHES } from './types.js'`，替换局部定义。

注意：如 `ALL_GAN` 不存在，需在 `types.ts` 中添加：
```typescript
export const ALL_GAN: readonly Gan[] = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'] as const;
```

### 1.3 yingqi.ts 常量去重 (CRITICAL)

**当前状态**: `yingqi.ts:65-91` 完全重新实现了 `CHONG_MAP`、`RI_MA_MAP`、`SAN_HE`。

**修复方案**:
```typescript
// yingqi.ts — 删除本地 chongMap, riMaMap, sanHeMap 定义 (lines 65-91)
// 添加导入:
import { CHONG_MAP, RI_MA_MAP, SAN_HE } from './constants.js';
```

**影响范围**: `yingqi.ts` 内部 4 个方法使用这些常量。替换后行为应完全一致（值相同，仅类型更强）。

**验证**: 运行 `npm run test -- tests/engine/liuren/yingqi.test.ts`

### 1.4 引擎输入验证

**当前状态**: `calculateLiuren()` 入口 (`index.ts:85`) 无任何参数校验。

**修复方案** — 在入口添加验证:
```typescript
// index.ts
const VALID_BRANCHES = new Set<string>(['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']);

export function calculateLiuren(params: LiurenParams): LiurenPan {
  // 输入验证
  if (!params?.date || !(params.date instanceof Date) || isNaN(params.date.getTime())) {
    throw new Error('calculateLiuren: 无效的日期参数');
  }
  if (params.date.getFullYear() < 1901) {
    throw new Error('calculateLiuren: 不支持 1901 年前的日期');
  }
  if (params.shiZhi !== undefined && !VALID_BRANCHES.has(params.shiZhi)) {
    throw new Error(`calculateLiuren: 无效的时辰 "${params.shiZhi}"`);
  }
  // ... 原有逻辑
}
```

**验证**: 添加新测试用例覆盖无效日期、无效时辰、1900年前日期。

---

## 阶段 2: 类型安全 + 错误处理 (HIGH)

**目标**: 修复类型擦除链和静默错误吞没，保障"数据完整性"和"用户信任"本质要素。
**预计总工时**: 10h
**风险**: 中 — 涉及数据序列化/反序列化路径

### 2.1 实现 serialize/deserialize 转换层

**当前状态**: 引擎 `LiurenPan` → JSONB 存储 → 页面读取 时类型信息丢失，导致多处 `as unknown as` 断言。

**修复方案** — 新增 `src/engine/liuren/serialize.ts`:

```typescript
import type { LiurenPan, Branch, Gan, TianDiPan } from './types.js';
import type { LiurenPanData } from '../../types/index.js';

const VALID_BRANCHES = new Set<string>(['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']);
const VALID_GAN = new Set<string>(['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']);

/** 引擎类型 → 持久化类型 */
export function serializePan(pan: LiurenPan): LiurenPanData {
  return {
    dayGanZhi: `${pan.dayGanZhi[0]}${pan.dayGanZhi[1]}`,
    shiZhi: pan.shiZhi,
    yueJiang: pan.yueJiang,
    solarTerm: pan.solarTerm,
    geJu: pan.geJu,
    isDaytime: pan.isDaytime,
    tianDiPan: {
      diPan: pan.tianDiPan.diPan,
      tianPan: pan.tianDiPan.tianPan,
    },
    siKe: pan.siKe,
    sanChuan: pan.sanChuan.map(sc => ({
      branch: sc.branch,
      tianJiang: sc.tianJiang,
    })),
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
  if (!data.dayGanZhi || data.dayGanZhi.length < 2) {
    throw new Error('deserializePan: dayGanZhi 格式无效');
  }
  const dayGan = data.dayGanZhi[0] as Gan;
  const dayZhi = data.dayGanZhi[1] as Branch;
  if (!VALID_GAN.has(dayGan) || !VALID_BRANCHES.has(dayZhi)) {
    throw new Error(`deserializePan: 无效的 dayGanZhi "${data.dayGanZhi}"`);
  }
  if (!VALID_BRANCHES.has(data.shiZhi)) {
    throw new Error(`deserializePan: 无效的 shiZhi "${data.shiZhi}"`);
  }
  // 完整验证和转换 ...
  return { /* 完整 LiurenPan */ } as LiurenPan;
}
```

**配套修改**:

| 文件 | 修改 |
|------|------|
| `src/db/records.ts:createRecord` | 保存时调用 `serializePan()` |
| `src/pages/LiurenResultView.tsx:442` | 读取时调用 `deserializePan()`，移除 `as unknown as` |
| `src/engine/liuren/index.ts:135` | 移除 `as LiurenPan` 断言 |

### 2.2 统一 interpretation 字段

**当前状态**: `DivinationRecord` 同时有 `interpretations: InterpretationResult[]` (line 168) 和 `interpretation?: InterpretationResult` (line 174)。

**修复方案**:

**Step 1** — 修改 `types/index.ts`: 移除 `interpretation?: InterpretationResult` (line 174)

**Step 2** — 修改写入方:
| 文件 | 修改 |
|------|------|
| `src/hooks/useLiuren.ts` | `record.interpretation = result` → `record.interpretations = [result]` |

**Step 3** — 修改读取方:
| 文件 | 修改 |
|------|------|
| `src/pages/LiurenResultView.tsx` | `record.interpretation` → `record.interpretations?.[0]` |
| `src/pages/LiurenView.tsx` | 同上 |
| `src/pages/LiurenDetailView.tsx` | 同上 |

**迁移策略**: 使用读取兼容方案（避免数据迁移风险）:
```typescript
// 读取时兼容旧数据
const interp = record.interpretations?.[0] ?? (record as any).interpretation;
```

### 2.3 静默错误处理修复

**逐文件修复**:

**HomeView.tsx:16-22** — 添加 `.catch()`:
```typescript
getAllRecords(user.id)
  .then(r => { /* 原有逻辑 */ })
  .catch(err => console.error('加载记录失败:', err))

queryPendingDue(user.id)
  .then(r => setPending(r.length))
  .catch(err => console.error('加载待反馈失败:', err))
```

**ResultView.tsx:52-53** — 添加错误状态:
```typescript
.catch((err) => {
  console.error('获取记录失败:', err)
  setError('加载记录失败，请稍后重试')
  setLoading(false)
})
```

**FeedbackForm.tsx:31,49,59** — 包裹 try/catch:
```typescript
try {
  await updateRecord(updated, user.id)
} catch (err) {
  console.error('保存反馈失败:', err)
  toast.error('保存失败，请重试')
  return
} finally {
  setSubmitting(false)
}
```

**bifa.ts:68-79** — 添加日志:
```typescript
catch (err) {
  console.warn(`BiFa 规则 "${rule.name}" 执行出错:`, err)
}
```

**shensha.ts:60-67** — 添加日志:
```typescript
catch (err) {
  console.warn(`神煞规则解析出错:`, err)
}
```

### 2.4 DB 重试一致性

**修复** `src/db/records.ts`:

```typescript
// deleteRecord — 包裹 withRetry
export async function deleteRecord(id: string, userId: string): Promise<void> {
  checkSupabase()
  await withRetry(async () => {
    const { error } = await supabase.from('records').delete()
      .eq('id', id).eq('user_id', userId)
    if (error) throw new Error(`Failed to delete record: ${error.message}`)
  })
}

// clearAll — 包裹 withRetry
export async function clearAll(userId: string): Promise<void> {
  checkSupabase()
  await withRetry(async () => {
    const { error } = await supabase.from('records').delete()
      .eq('user_id', userId)
    if (error) throw new Error(`Failed to clear records: ${error.message}`)
  })
}
```

### 2.5 shensha.ts 类型断言修复

**当前状态**: 4 处 `as Branch` 无验证 (lines 102, 116, 137, 171)。

**修复方案** — 添加验证辅助函数:
```typescript
function assertBranch(value: string): Branch {
  if (!ALL_BRANCHES.includes(value as Branch)) {
    throw new Error(`无效的地支值: "${value}"`)
  }
  return value as Branch
}

// 替换:
// branch: b as Branch          → branch: assertBranch(b)
// branch: branch as Branch     → branch: assertBranch(branch)
// branch: value as Branch      → branch: assertBranch(value)
// branch: rule.rules.branch as Branch → branch: assertBranch(rule.rules.branch!)
```

---

## 阶段 3: AI 路径统一 + UI 一致性 (MEDIUM)

**目标**: 完成 V2 接入、消除 DRY 违反、统一设计系统。
**预计总工时**: 12h
**风险**: 中 — 涉及 AI prompt 和 UI 外观变更

### 3.1 接入 AI V2 路径

**当前状态**: `useLiuren.ts:146` 调用 V1 `callLiurenInterpretation`，V2 从未被使用。

**修复方案**:

**Step 1** — 修改 `src/hooks/useLiuren.ts`:
```typescript
import { callLiurenInterpretationV2 } from '../ai/liuren-call.js';
import { inferZhanShi } from '../engine/liuren/zhanShi.js';

// 修改调用:
const zhanShi = inferZhanShi(question)
const result = await callLiurenInterpretationV2(panData, q, zhanShi);
```

**Step 2** — 新增 `src/engine/liuren/zhanShi.ts`:
```typescript
import type { ZhanShi } from './bifa.js';

const KEYWORD_MAP: Record<ZhanShi, string[]> = {
  '官禄功名': ['考试', '升职', '工作', '事业', '官', '领导'],
  '婚姻胎产': ['婚姻', '结婚', '恋爱', '怀孕', '生育', '桃花'],
  '疾病死亡': ['病', '健康', '医院', '死亡', '手术'],
  '求财交易': ['钱', '财', '投资', '买卖', '生意'],
  '出行': ['出行', '旅行', '出差', '搬迁'],
  '诉讼': ['官司', '诉讼', '纠纷', '法律'],
  '失物': ['丢', '失物', '找', '丢失'],
  '天气': ['天气', '下雨', '晴'],
}

export function inferZhanShi(question: string): ZhanShi {
  for (const [scene, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some(kw => question.includes(kw))) return scene as ZhanShi
  }
  return '官禄功名' // 默认
}
```

**Step 3** — 清理 V1 代码:
- 删除 `liuren-call.ts` 中的 `callLiurenInterpretation` (lines 31-107)
- 删除 `liuren-prompt-builder.ts` 中的 V1 prompt 函数

### 3.2 提取共享组件消除 DRY 违反

**新建 `src/components/liuren/` 目录**:

| 新文件 | 来源 | 说明 |
|--------|------|------|
| `TrendBadge.tsx` | `LiurenResultView.tsx:73-86` | 统一趋势标签 |
| `Collapsible.tsx` | `LiurenResultView.tsx:34-69` | 统一折叠面板 |
| `SiKeCard.tsx` | `LiurenResultView.tsx:162-207` | 四课卡片 |
| `SanChuanCard.tsx` | `LiurenResultView.tsx:90-159` | 三传卡片 |
| `ShenShaList.tsx` | `LiurenResultView.tsx:222-269` | 神煞列表 |
| `WarningList.tsx` | `LiurenResultView.tsx:273-294` | 警告列表 |

**修改的文件**:
- `LiurenResultView.tsx` — 从 646 行减至 ~300 行
- `LiurenView.tsx` — 删除 lines 54-234 内联结果渲染
- `LiurenDetailView.tsx` — 删除内联 `CollapsibleCard`/`TrendBadge`

### 3.3 LiurenDetailView 样式统一

| 修改 | 说明 |
|------|------|
| `gray-*` → `nothing-*` | `bg-gray-50` → `nothing-bg`, `text-gray-800` → `nothing-text-primary` |
| 删除 `dark:` 变体 | `nothing-*` token 内部处理主题 |
| `lucide-react` → 文本字符 | `ArrowLeft` → `←`, `ChevronDown` → `▼` |
| `framer-motion` → 条件渲染 | `AnimatePresence` → `{isOpen && <Content />}` |

**注意**: 移除 `motion` 前需确认无其他文件使用。

### 3.4 死代码清理

| 操作 | 文件 | 说明 |
|------|------|------|
| 删除 | `src/engine/liuren/warnings.ts` | 从未被调用 |
| 删除 | `src/engine/liuren/jieqi-boundary.ts` | 从未被调用 |
| 移除 re-export | `index.ts:190,192` | 移除 `checkJieqiBoundary` 和 `runAllWarnings` |

### 3.5 修复 biyong.ts 恒等式

**当前** (`biyong.ts:45`):
```typescript
const geJu = type === '下贼上' ? '知一' : '知一';
```

**修复**: 确认古法定义后修正。如无法确认，暂简化为 `const geJu = '知一'` 并添加 TODO。

### 3.6 循环依赖修复

```typescript
// framework-types.ts — 添加 KeGeCategory
export type KeGeCategory =
  | '贼克' | '比用' | '涉害' | '遥克'
  | '昴星' | '别责' | '八专' | '伏吟' | '返吟' | '特殊';

// keGe.ts 和 keGeDb.ts — 从 framework-types 导入
import type { KeGeCategory } from './framework-types.js';
```

### 3.7 Framework 类型复用

```typescript
// types/index.ts
import type { FrameworkAnalysis } from '../engine/liuren/framework.js';

// DivinationRecord 中:
framework?: FrameworkAnalysis  // 替代内联定义
```

---

## 阶段 4: 测试补全 + 工程化 (MEDIUM)

**目标**: 补全关键测试覆盖，提升工程化水平。
**预计总工时**: 10h
**风险**: 低 — 纯增量工作

### 4.1 关键缺失测试

| 优先级 | 测试文件 | 覆盖目标 | 工时 |
|--------|---------|---------|------|
| P0 | `tests/engine/liuren/jieqi.test.ts` | 24 节气计算、午夜边界、闰年 | 2h |
| P0 | `tests/engine/liuren/dungan.test.ts` | 遁干计算、六亲计算 | 1h |
| P0 | `tests/engine/liuren/shensha.test.ts` | 7 种规则类型独立测试 | 1.5h |
| P1 | `tests/engine/liuren/sanchuan.test.ts` | maoxing/bieze/bazhuan | 1h |
| P1 | `tests/engine/liuren/serialize.test.ts` | serialize/deserialize 双向验证 | 1h |
| P2 | `tests/engine/liuren/validation.test.ts` | 引擎输入验证边界情况 | 0.5h |

### 4.2 交叉验证增强

**修复** `kinliuren-crossref.test.ts` — 添加具体值断言:
```typescript
for (const ref of REFERENCE_CASES) {
  const result = calculateLiuren({ date: new Date(ref.date) })
  expect(result.sanChuan.chuChuan.branch).toBe(ref.expected.chuChuan)
  expect(result.sanChuan.zhongChuan.branch).toBe(ref.expected.zhongChuan)
  expect(result.sanChuan.moChuan.branch).toBe(ref.expected.moChuan)
}
```

### 4.3 工程化改进

| 项目 | 操作 | 工时 |
|------|------|------|
| Prettier | 添加 `.prettierrc`，格式化全项目 | 0.5h |
| CI | 添加 `.github/workflows/ci.yml` | 1h |
| 遗留文件 | `data/` 加入 `.gitignore` | 0.5h |
| 导航统一 | `AppShell.tsx` 底部导航统一为中文 | 0.5h |

---

## 执行顺序与依赖关系

```
阶段 1 (常量去重 + 输入验证)
  ├── 1.1 五行常量统一 ──────────┐
  ├── 1.2 地支常量统一 ──────────┤
  ├── 1.3 yingqi.ts 常量去重 ────┼──→ 阶段 2
  └── 1.4 引擎输入验证 ─────────┘

阶段 2 (类型安全 + 错误处理)
  ├── 2.1 serialize/deserialize ──────────┐
  ├── 2.2 interpretation 字段统一 ────────┤
  ├── 2.3 静默错误修复 ──────────────────┼──→ 阶段 3
  ├── 2.4 DB 重试一致性 ─────────────────┤
  └── 2.5 shensha 类型断言修复 ──────────┘

阶段 3 (AI + UI 一致性)
  ├── 3.1 V2 接入 ───────────────────────┐
  ├── 3.2 共享组件提取 ──────────────────┤
  ├── 3.3 LiurenDetailView 样式统一 ─────┤
  ├── 3.4 死代码清理 ────────────────────┼──→ 阶段 4
  ├── 3.5 biyong.ts 修复 ────────────────┤
  └── 3.6 循环依赖修复 ─────────────────┘

阶段 4 (测试 + 工程化)
  ├── 4.1 关键测试补全 ──────────────────┐
  ├── 4.2 交叉验证增强 ──────────────────┤
  └── 4.3 工程化改进 ────────────────────┘
```

## 验证检查清单

每个阶段完成后执行：

```bash
npx tsc -b --noEmit    # 类型检查
npm run lint            # Lint
npm run test            # 单元测试
npm run build           # 构建
npx playwright test     # E2E 测试
```

## 回滚策略

每个修改独立提交。建议每个阶段完成后创建 tag：
```bash
git tag fix-phase-1
git tag fix-phase-2
# ...
```
