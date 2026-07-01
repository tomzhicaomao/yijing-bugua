# 年命必填 + 占事分类对齐 — 实现方案

> 基于第一性原理分析，大六壬完整输入模型需要：占时（计算层）、占事（框架层）、年命（判断层）。当前缺失年命，且占事分类体系与框架层不匹配。

## 1. 问题总结

### 1.1 当前输入模型

```
用户提供的信息:
├── 所问之事  — 自由文本，1-200字
├── 问题分类  — Category: '工作' | '人际' | '财务' | '健康' | '其他'
└── 占时     — 可选，默认当前时辰

实际传递给引擎的:
├── date      — 硬编码 new Date()
├── shiZhi    — 可选
└── question  — 仅作 metadata

框架层使用的:
└── zhanShi   — 从 question 文本通过关键词推断（非用户直接选择）
```

### 1.2 三个核心缺陷

| 缺陷 | 影响 | 严重度 |
|------|------|--------|
| **缺少年命** | 无法计算行年，无法建立空亡与行年的关系，无法执行"一式多断"，断课精度大幅下降 | 🔴 高 |
| **Category 与 ZhanShi 不匹配** | 用户选"工作"但框架层需要"官职"或"求财"，分类路由错误导致用神选取、毕法赋匹配、天将象义全部偏移 | 🟡 中 |
| **占事依赖关键词推断** | 推断准确率有限，且用户无法修正推断结果 | 🟡 中 |

### 1.3 第一性原理分析

```
大六壬 = 计算层（确定性） + 框架层（确定性） + 判断层（需年命）

计算层: { date, shiZhi } → 天地盘、四课三传、天将六亲
  └─ 同一时刻起课，任何人盘面完全相同 ✅ 当前满足

框架层: { pan, zhanShi } → 课格分类、毕法赋、天将象义、六亲分析
  └─ zhanShi 决定用神选取和解读视角 ⚠️ 当前分类不匹配

判断层: { pan, zhanShi, 年命 } → 行年计算、空亡判断、一式多断
  └─ 年命是判断层的必要输入 ❌ 当前完全缺失
```

## 2. 设计目标

### 2.1 输入模型（目标态）

```
用户在设置页保存:
└── 年命（出生年天干地支）— 持久化，日后默认使用

用户在起课前提供:
├── 所问之事    — 自由文本
├── 占事分类    — ZhanShi（对齐框架层 9 类）
├── 占时       — 可选，默认当前时辰
└── 年命覆盖   — 可选，默认使用设置页的值
```

### 2.2 关键设计决策

1. **年命必填**：起课前必须提供年命，否则无法进入计算
2. **设置页持久化**：年命保存在 Supabase `user_settings` 表，跨设备同步
3. **起课时可覆盖**：为他人代占时可临时修改年命
4. **占事分类统一**：用 ZhanShi 的 9 类替换当前 Category 的 5 类
5. **向后兼容**：历史记录中的 category 字段保留不动

## 3. 详细实现计划

### Phase 1: 类型层 + 数据库

#### 3.1 新增 `NianMing` 类型定义

**新文件**: `src/types/nian-ming.ts`

```typescript
import type { TianGan, DiZhi } from './index';

/** 年命：出生年的天干地支 */
export interface NianMing {
  gan: TianGan;
  zhi: DiZhi;
}

/** 年命计算后的扩展信息 */
export interface NianMingContext {
  yearGanZhi: string;   // "甲子"
  age: number;          // 起课时虚岁
  xingNian: string;     // 行年干支
}

/** 天干选项 */
export const GAN_OPTIONS: TianGan[] = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
/** 地支选项 */
export const ZHI_OPTIONS: DiZhi[] = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
```

#### 3.2 扩展 `LiurenPanData`（`src/types/index.ts`）

```typescript
export interface LiurenPanData {
  // ... 现有字段保持不变 ...
  /** 年命信息 */
  nianMing?: {
    yearGanZhi: string;   // 如 "甲子"
    age?: number;          // 起课时年龄
    xingNian?: string;     // 行年干支
  };
}
```

#### 3.3 扩展 `DivinationRecord`（`src/types/index.ts`）

```typescript
export interface DivinationRecord {
  // ... 现有字段 ...
  /** 大六壬完整课式（JSONB） */
  liurenPan?: LiurenPanData
  /** 框架层分析结果（JSONB） */
  framework?: FrameworkAnalysis
  /** 年命快照（保存时记录，便于后续查看） */
  nianMing?: {
    yearGanZhi: string;
    age?: number;
    xingNian?: string;
  };
}
```

#### 3.4 扩展引擎层类型（`src/engine/liuren/types.ts`）

```typescript
export interface LiurenParams {
  date: Date;
  shiZhi?: Branch;
  question?: string;
  /** 年命 — 判断层必需输入 */
  nianMing?: {
    gan: string;
    zhi: string;
  };
}

export interface LiurenPan {
  // ... 现有字段 ...
  /** 年命信息（传入时存在） */
  nianMing?: {
    yearGanZhi: string;
    age?: number;
    xingNian?: string;
  };
}
```

#### 3.5 数据库 Migration

**文件**: `supabase/migrations/20260701000000_add_nianming_to_settings.sql`

```sql
-- user_settings 表添加年命字段
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS nian_ming JSONB;
-- 结构: { "gan": "甲", "zhi": "子" }
```

**文件**: `supabase/migrations/20260701000001_add_nianming_to_records.sql`

```sql
-- records 表添加年命快照字段
ALTER TABLE records
ADD COLUMN IF NOT EXISTS nian_ming JSONB;
-- 结构: { "yearGanZhi": "甲子", "age": 30, "xingNian": "丙寅" }
```

### Phase 2: 年命持久化层

#### 3.6 年命存储函数

**新文件**: `src/lib/nian-ming-storage.ts`

```typescript
/**
 * 年命本地存储 + Supabase 云同步
 * 模式与 api-key.ts 一致
 */
import { supabase, supabaseReady } from './supabase';
import type { NianMing } from '../types/nian-ming';

const STORAGE_KEY = 'liuren-nian-ming';
export const NIAN_MING_CHANGED_EVENT = 'nian-ming-changed';

// ---- localStorage ----

export function getNianMing(): NianMing | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.gan && parsed?.zhi) return parsed as NianMing;
    return null;
  } catch {
    return null;
  }
}

export function setNianMing(nm: NianMing): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nm));
  window.dispatchEvent(new CustomEvent(NIAN_MING_CHANGED_EVENT, { detail: nm }));
}

export function removeNianMing(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(NIAN_MING_CHANGED_EVENT));
}

// ---- Supabase 云同步 ----

export async function saveNianMingToCloud(userId: string, nm: NianMing): Promise<void> {
  if (!supabaseReady) return;
  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, nian_ming: nm }, { onConflict: 'user_id' });
  if (error) throw new Error(`保存年命失败: ${error.message}`);
}

export async function loadNianMingFromCloud(userId: string): Promise<NianMing | null> {
  if (!supabaseReady) return null;
  const { data, error } = await supabase
    .from('user_settings')
    .select('nian_ming')
    .eq('user_id', userId)
    .single();
  if (error || !data?.nian_ming) return null;
  return data.nian_ming as NianMing;
}

export async function removeNianMingFromCloud(userId: string): Promise<void> {
  if (!supabaseReady) return;
  const { error } = await supabase
    .from('user_settings')
    .update({ nian_ming: null })
    .eq('user_id', userId);
  if (error) throw new Error(`删除年命失败: ${error.message}`);
}
```

#### 3.7 AuthContext 集成（修改 `src/auth/AuthContext.tsx`）

在 `AuthContext` 初始化时加载年命到 localStorage（与 api-key 加载模式一致）：

```typescript
// 在 useEffect 中，session 加载后追加：
import { loadNianMingFromCloud, setNianMing } from '../lib/nian-ming-storage';

// session 加载后：
const nianMing = await loadNianMingFromCloud(session.user.id);
if (nianMing) {
  setNianMing(nianMing); // 写入 localStorage
}
```

### Phase 3: 年命计算引擎

#### 3.8 年命计算函数

**新文件**: `src/engine/liuren/nian-ming.ts`

```typescript
/**
 * 年命计算模块
 *
 * 功能:
 * 1. 根据出生年干支 + 当前日期计算虚岁
 * 2. 计算行年干支（用于空亡判断、一式多断）
 *
 * 行年算法:
 * - 男命: 从丙寅起，顺行至当前年
 * - 女命: 从壬申起，逆行至当前年
 * - 本实现暂不区分性别（简化），后续可扩展
 */
import type { NianMing, NianMingContext } from '../../types/nian-ming';
import { GAN_LIST, ZHI_LIST } from './constants';

/** 60 甲子序（索引 0 = 甲子） */
function ganZhiIndex(gan: string, zhi: string): number {
  const gi = GAN_LIST.indexOf(gan as typeof GAN_LIST[number]);
  const zi = ZHI_LIST.indexOf(zhi as typeof ZHI_LIST[number]);
  if (gi < 0 || zi < 0) return 0;
  // 60 甲子: 天干索引 = index % 10, 地支索引 = index % 12
  // 反推: 找到 index 使得 index%10==gi 且 index%12==zi
  for (let i = 0; i < 60; i++) {
    if (i % 10 === gi && i % 12 === zi) return i;
  }
  return 0;
}

/** 根据 60 甲子索引取干支 */
function ganZhiByIndex(index: number): string {
  const gi = ((index % 60) % 10 + 10) % 10;
  const zi = ((index % 60) % 12 + 12) % 12;
  return `${GAN_LIST[gi]}${ZHI_LIST[zi]}`;
}

export function calculateNianMingContext(
  nianMing: NianMing,
  currentDate: Date,
): NianMingContext {
  const yearGanZhi = `${nianMing.gan}${nianMing.zhi}`;

  // 当前年的地支
  const currentYear = currentDate.getFullYear();
  const currentZhiIndex = currentYear % 12; // 0=子, 但需要 offset

  // 干支年份计算：以 2024 甲辰年为锚点
  const ANCHOR_YEAR = 2024;
  const ANCHOR_GAN = 4; // 甲=0, 2024 天干 = (2024-4) % 10 = 0 → 甲
  const ANCHOR_ZHI = 4; // 子=0, 2024 地支 = (2024-8) % 12 = 4 → 辰

  const currentGan = ((currentYear - ANCHOR_YEAR + ANCHOR_GAN) % 10 + 10) % 10;
  const currentZhi = ((currentYear - ANCHOR_YEAR + ANCHOR_ZHI) % 12 + 12) % 12;

  // 出生年索引（60甲子）
  const birthGZIndex = ganZhiIndex(nianMing.gan, nianMing.zhi);

  // 虚岁：当前年地支 - 出生年地支 + 1（简化）
  const age = ((currentZhi - (birthGZIndex % 12)) % 12 + 12) % 12 + 1;

  // 行年：简化为 60 甲子中从出生年顺推 age-1 步
  const xingNianGZ = ganZhiByIndex(birthGZIndex + age - 1);

  return {
    yearGanZhi,
    age,
    xingNian: xingNianGZ,
  };
}
```

### Phase 4: 设置页 UI

#### 3.9 年命选择器组件

**新文件**: `src/components/liuren/NianMingPicker.tsx`

```tsx
/**
 * 年命选择器 — 天干 + 地支双列选择
 *
 * Props:
 *   value: NianMing | null
 *   onChange: (nm: NianMing) => void
 *   compact?: boolean  // 起课页内紧凑模式
 */
import { GAN_OPTIONS, ZHI_OPTIONS } from '../../types/nian-ming';
import type { NianMing } from '../../types/nian-ming';

interface Props {
  value: NianMing | null;
  onChange: (nm: NianMing) => void;
  compact?: boolean;
}

export default function NianMingPicker({ value, onChange, compact }: Props) {
  // UI: 天干 10 选 1 + 地支 12 选 1 的按钮网格
  // 选中态高亮，即时回调 onChange
  // compact 模式下更紧凑
  // ... 实现略（约 120 行 JSX）
}
```

#### 3.10 SettingsView 新增年命区块

**修改文件**: `src/pages/SettingsView.tsx`

在"用户信息"卡片之后、"API Key"之前插入年命设置区块：

```tsx
{/* 年命设置 */}
<GlassCard className="p-5">
  <h3 className="text-sm text-nothing-text-secondary mb-1 tracking-wide">年命设置</h3>
  <p className="text-[11px] text-nothing-text-disabled mb-4">
    出生年的天干地支，用于大六壬断课中的行年计算
  </p>

  {nianMing ? (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 border border-nothing-border rounded-md">
        <span className="font-mono text-lg text-nothing-text-display">
          {nianMing.gan}{nianMing.zhi}年
        </span>
        <Button variant="ghost" onClick={() => setShowEditor(true)} className="text-sm">
          修改
        </Button>
      </div>
      <Button variant="ghost" onClick={handleRemove} className="w-full py-2 text-sm text-red-400">
        清除年命
      </Button>
    </div>
  ) : (
    <NianMingPicker value={null} onChange={handleSave} />
  )}
</GlassCard>
```

### Phase 5: 占事分类统一

#### 3.11 Category → ZhanShi 映射

**修改文件**: `src/types/index.ts`

```typescript
// 保留 Category 用于摇卦兼容，大六壬使用 ZhanShi

// 新增映射
export function zhanShiToCategory(zs: ZhanShi): Category {
  const MAP: Record<ZhanShi, Category> = {
    '官职': '工作',
    '婚姻': '人际',
    '疾病': '健康',
    '求财': '财务',
    '出行': '其他',
    '诉讼': '人际',
    '学业': '工作',
    '天时': '其他',
    '其他': '其他',
  };
  return MAP[zs];
}
```

#### 3.12 LiurenView 分类选择器替换

**修改文件**: `src/pages/LiurenView.tsx`

```tsx
import type { ZhanShi } from '../engine/liuren/bifa';
import { ZHAN_SHI_OPTIONS } from '../lib/constants'; // 新增常量

// 分类区域替换为 ZhanShi 9 宫格选择
// 每个选项显示：分类名 + 副标题描述
```

**修改文件**: `src/lib/constants.ts` — 新增：

```typescript
export const ZHAN_SHI_OPTIONS: { value: string; label: string; desc: string }[] = [
  { value: '官职', label: '官职', desc: '工作·事业·升迁' },
  { value: '婚姻', label: '婚姻', desc: '感情·恋爱·婚配' },
  { value: '疾病', label: '疾病', desc: '健康·医疗·康复' },
  { value: '求财', label: '求财', desc: '财运·投资·生意' },
  { value: '出行', label: '出行', desc: '旅行·搬迁·远行' },
  { value: '诉讼', label: '诉讼', desc: '官司·纠纷·法律' },
  { value: '学业', label: '学业', desc: '考试·读书·论文' },
  { value: '天时', label: '天时', desc: '天气·自然' },
  { value: '其他', label: '其他', desc: '以上未涵盖' },
];
```

### Phase 6: 核心 Hook 修改

#### 3.13 useLiuren Hook 变更（最大改动）

**修改文件**: `src/hooks/useLiuren.ts`

关键变更点：

1. **新增状态**:
   ```typescript
   const [nianMing, setNianMing] = useState<NianMing | null>(getNianMing());
   const [localNianMing, setLocalNianMing] = useState<NianMing | null>(null);
   ```

2. **监听设置页变化**:
   ```typescript
   useEffect(() => {
     const handler = () => setNianMing(getNianMing());
     window.addEventListener(NIAN_MING_CHANGED_EVENT, handler);
     return () => window.removeEventListener(NIAN_MING_CHANGED_EVENT, handler);
   }, []);
   ```

3. **submitQuestion 签名变更**:
   ```typescript
   submitQuestion(q, zhanShi: ZhanShi, shiZhi?: Branch, overrideNianMing?: NianMing)
   ```

4. **年命校验**:
   ```typescript
   const effectiveNianMing = overrideNianMing ?? nianMing;
   if (!effectiveNianMing) {
     setError('请先在设置页设置年命，或在起课前选择年命');
     return;
   }
   ```

5. **计算年命上下文并传递给引擎**:
   ```typescript
   const nianMingCtx = calculateNianMingContext(effectiveNianMing, new Date());
   const result = calculateLiuren({
     date: new Date(),
     shiZhi: shiZhi || undefined,
     question: trimmed,
     nianMing: effectiveNianMing,
   });
   ```

6. **startAIInterpretation 直接接收 ZhanShi**（不再 inferZhanShi）:
   ```typescript
   startAIInterpretation(result, trimmed, zhanShi, nianMingCtx);
   ```

7. **buildRecord 添加 nianMing 快照**:
   ```typescript
   nianMing: effectiveNianMing ? {
     yearGanZhi: `${effectiveNianMing.gan}${effectiveNianMing.zhi}`,
     age: nianMingCtx?.age,
     xingNian: nianMingCtx?.xingNian,
   } : undefined,
   ```

### Phase 7: AI Prompt 集成

#### 3.14 修改 Prompt 构建器

**修改文件**: `src/ai/liuren-prompt-builder.ts`

```typescript
export function buildLiurenUserPromptV2(
  pan: LiurenPan,
  question: string,
  framework: FrameworkAnalysis,
  zhanShi?: ZhanShi,
  nianMingContext?: NianMingContext, // 新增
): string {
  const parts: string[] = [
    `【占事类型】${zhanShi ?? '未指定'}`,
    `【所问之事】${wrapUserInput(question)}`,
  ];

  // 新增年命信息
  if (nianMingContext) {
    parts.push(`【年命】${nianMingContext.yearGanZhi}年，虚岁${nianMingContext.age}岁`);
    parts.push(`【行年】${nianMingContext.xingNian}`);
  }

  // ... 其余现有内容不变 ...
}
```

#### 3.15 修改 AI 调用链

**修改文件**: `src/ai/liuren-call.ts`

```typescript
export async function callLiurenInterpretationV2(
  pan: LiurenPan,
  question: string,
  zhanShi?: ZhanShi,
  nianMingContext?: NianMingContext, // 新增
): Promise<...> {
  // ...
  const userPrompt = buildLiurenUserPromptV2(pan, question, framework, zhanShi, nianMingContext);
  // ...
}
```

### Phase 8: 结果展示 + 数据库

#### 3.16 结果页年命显示

**修改文件**: `src/pages/LiurenResultView.tsx`

在格局信息下方添加：

```tsx
{nianMing && (
  <div className="mt-2 font-mono text-[10px] text-nothing-text-disabled">
    年命{nianMing.yearGanZhi} · 行年{nianMing.xingNian} · 虚岁{nianMing.age}
  </div>
)}
```

#### 3.17 数据库序列化

**修改文件**: `src/db/records.ts`

```typescript
// toSupabaseRow 添加：
if (record.nianMing) row.nian_ming = record.nianMing;

// fromSupabaseRow 添加：
nianMing: (row.nian_ming as DivinationRecord['nianMing']) ?? undefined,
```

## 4. 文件变更清单

### 新建文件

| 文件 | 用途 | 行数估算 |
|------|------|---------|
| `src/types/nian-ming.ts` | NianMing 类型定义 + 常量 | ~30 |
| `src/engine/liuren/nian-ming.ts` | 年命计算（行年推算） | ~80 |
| `src/lib/nian-ming-storage.ts` | 年命存储（localStorage + Supabase） | ~80 |
| `src/components/liuren/NianMingPicker.tsx` | 年命选择器 UI | ~120 |

### 修改文件

| 文件 | 变更内容 |
|------|---------|
| `src/types/index.ts` | LiurenPanData + DivinationRecord 新增 nianMing |
| `src/engine/liuren/types.ts` | LiurenParams + LiurenPan 新增 nianMing |
| `src/pages/SettingsView.tsx` | 新增年命设置区块 |
| `src/pages/LiurenView.tsx` | 分类替换为 ZhanShi；新增年命覆盖 |
| `src/pages/LiurenResultView.tsx` | 年命信息展示 |
| `src/hooks/useLiuren.ts` | 核心流程修改（状态、提交、保存） |
| `src/ai/liuren-prompt-builder.ts` | prompt 注入年命 + 行年 |
| `src/ai/liuren-call.ts` | 传递 nianMingContext |
| `src/auth/AuthContext.tsx` | 初始化时加载年命 |
| `src/db/records.ts` | 序列化 nianMing |
| `src/engine/liuren/index.ts` | calculateLiuren 接收 nianMing |
| `src/engine/liuren/framework.ts` | analyzeFramework 接收 nianMingContext |
| `src/lib/constants.ts` | 新增 ZHAN_SHI_OPTIONS |

### 数据库 Migration

| Migration | 内容 |
|-----------|------|
| `20260701000000_add_nianming_to_settings.sql` | user_settings 新增 nian_ming JSONB |
| `20260701000001_add_nianming_to_records.sql` | records 新增 nian_ming JSONB |

## 5. 实现顺序

```
Phase 1 (类型 + DB):
  ① src/types/nian-ming.ts              — 新建类型
  ② src/types/index.ts                  — 扩展 LiurenPanData, DivinationRecord
  ③ src/engine/liuren/types.ts          — 扩展 LiurenParams, LiurenPan
  ④ 执行两个 SQL migration

Phase 2 (存储层):
  ⑤ src/lib/nian-ming-storage.ts        — 新建存储函数
  ⑥ src/auth/AuthContext.tsx             — 集成加载

Phase 3 (设置页):
  ⑦ src/components/liuren/NianMingPicker.tsx — 新建选择器
  ⑧ src/pages/SettingsView.tsx          — 新增年命区块

Phase 4 (引擎层):
  ⑨ src/engine/liuren/nian-ming.ts      — 新建年命计算
  ⑩ src/engine/liuren/index.ts          — integrate nianMing

Phase 5 (起课页):
  ⑪ src/pages/LiurenView.tsx            — 分类替换 + 年命覆盖
  ⑫ src/hooks/useLiuren.ts              — 核心流程修改

Phase 6 (AI 层):
  ⑬ src/ai/liuren-prompt-builder.ts     — prompt 注入
  ⑭ src/ai/liuren-call.ts               — 传递 nianMingContext

Phase 7 (结果展示):
  ⑮ src/pages/LiurenResultView.tsx      — 年命显示
  ⑯ src/db/records.ts                   — 序列化 nianMing

Phase 8 (测试):
  ⑰ 年命计算单元测试
  ⑱ 存储层单元测试
  ⑲ E2E 测试：设置 → 起课 → 结果完整流程
```

## 6. 风险与注意事项

### 6.1 向后兼容

- **历史记录**: 已保存的 `DivinationRecord` 中没有 `nianMing` 字段，读取时为 `undefined`，不影响展示
- **Category 字段**: 保留不动，摇卦（易经）仍使用 Category
- **ZhanShi 推断**: `inferZhanShi()` 保留作为 fallback，但大六壬主流程不再依赖它

### 6.2 行年计算

行年计算有两种传统算法：
- **男命**: 从丙寅起，顺行至当前年
- **女命**: 从壬申起，逆行至当前年

当前设计简化为通用算法（不区分性别），后续可扩展性别输入以支持精确行年计算。

### 6.3 年命存储安全性

- 年命仅含出生年的干支，不含具体日期，隐私风险极低
- 与 API Key 使用相同的存储模式（localStorage + Supabase）
- 不加密

### 6.4 未覆盖的边界情况

| 场景 | 当前处理 |
|------|---------|
| 用户未设置年命直接起课 | 阻止起课，提示去设置页 |
| 为他人代占 | 起课页可覆盖年命 |
| 历史记录中的年命 | 仅新记录包含，旧记录无 |
| 同一用户不同设备 | Supabase 云同步 |
