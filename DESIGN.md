# 易经占卜与思考工具 — 设计概要 v1

> Phase A：周易古占 · 实验派 · 个人 Web 应用

---

## 一、项目定位

| 维度 | 决策 |
|------|------|
| 用户 | 仅 Thomas 个人使用 |
| 形态 | React Web 应用，纯前端 |
| 托管 | Vercel / Netlify 静态部署 |
| 技术栈 | React 19 + TypeScript + Vite + Tailwind CSS v4 + motion |
| 测试 | 规则引擎 + 数据层严格 TDD（80% 覆盖），AI 层 + UI 层实用主义 |
| 语言 | 界面中文 |

### 路线图

```
Phase A（当前）        Phase B（未来）
─────────────────  ←  ────────────────────
周易古占               六爻纳甲
• 本卦 + 变卦 + 动爻     • + 互卦/错卦/综卦
• 卦辞 + 爻辞           • + 六亲/六神/世应/纳甲
• AI 结构化解读         • + 月建/日辰/旺衰
                         • + 多起卦方式
```

### 核心理念

**实验派** — 长期收集数据验证假设。系统不干预用户决策，只提供分析和追踪。

Phase A 不只是"AI 解卦器"，而是一个可复盘的个人决策记录系统。每次占问都尽量保留三类信息：

1. 占问前：用户自己的预判、信心和原本准备采取的行动
2. 占问中：规则引擎计算出的卦象、古籍文本、AI 解读及其版本信息
3. 结果后：真实发生的结果、是否受解读影响、可验证判断点是否命中

两条铁律：
1. **规则层不可学习** — 卦象计算算法永不修改
2. **一事不二占** — 宽松模式：警告 + 记录次数，允许跳过；是否为同一问题由用户自行判断

---

## 二、铜钱约定

### 识别规则

三枚相同铜钱，摇 6 次，从下往上（初爻→上爻）排列。

```
铜钱"字"（有汉字的一面）→ 记为 2
铜钱"背"（花纹面）      → 记为 3
```

| 掷出结果 | 背面数 | 数值 | 名称 | 爻象 | 是否动爻 |
|----------|--------|------|------|------|----------|
| 三个背 | 3 | 9 | 老阳 | ⚊○ | 是 → 变阴 |
| 两背一字 | 2 | 8 | 少阴 | ⚋ | 否 |
| 一背两字 | 1 | 7 | 少阳 | ⚊ | 否 |
| 三个字 | 0 | 6 | 老阴 | ⚋× | 是 → 变阳 |

**记忆口诀**：数背面——3 老阳，2 少阴，1 少阳，0 老阴。

### 起卦方式

支持两种输入：

| 方式 | 描述 | 随机源 |
|------|------|--------|
| 虚拟在线摇 | 点击按钮，三枚铜钱 CSS 动画翻转下落 | `crypto.getRandomValues()` |
| 手动输入 | 每爻选背面数量（0/1/2/3），系统自动判爻型 | 用户现实铜钱结果 |

虚拟在线摇 MUST 模拟三枚铜钱分别落面的结果，而不是均匀生成 6/7/8/9。背面数对应概率：

| 背面数 | 爻值 | 概率 |
|--------|------|------|
| 0 | 6 老阴 | 1/8 |
| 1 | 7 少阳 | 3/8 |
| 2 | 8 少阴 | 3/8 |
| 3 | 9 老阳 | 1/8 |

虚拟摇卦时，**第一次点击「掷铜钱」按钮的时间**记录为起卦时间（用于 Phase B 月建日辰计算）。

虚拟摇卦交互：用户手动点 6 次，每次点一下掷一枚爻。

---

## 三、卦象计算引擎（规则层 · 不可学习）

### 输入

```typescript
type LineValue = 6 | 7 | 8 | 9  // 6=老阴 7=少阳 8=少阴 9=老阳

interface CoinResult {
  lines: [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue]
  method: 'virtual' | 'manual'
  timestamp: string
}
```

### 计算逻辑

```
六个数 → 本卦 + 变卦 + 动爻位置

本卦：值 7 或 9 → 阳爻 ⚊
      值 6 或 8 → 阴爻 ⚋

变卦：动爻反转
      6（老阴）→ 阳爻
      9（老阳）→ 阴爻
      7 或 8  → 不变

动爻位置：值为 6 或 9 的爻位索引（从 1 开始，初爻=1）
```

### 输出

```typescript
interface HexagramResult {
  original: HexagramData       // 本卦
  changed: HexagramData | null // 变卦（无动爻时为 null）
  changingLines: number[]      // 动爻位置 [1-6]
}
```

---

## 四、数据模型

### 完整记录

```typescript
interface DivinationRecord {
  schemaVersion: 1              // 数据结构版本，用于未来迁移
  id: string                   // UUID
  timestamp: string             // ISO 字符串，JSON 导入导出稳定
  question: string
  category: '工作' | '人际' | '财务' | '健康' | '其他'
  method: 'virtual' | 'manual'

  beforeDivination?: {
    userExpectation?: string    // 占问前自己的判断
    userConfidence?: number     // 1-5
    intendedAction?: string     // 原本打算怎么做
  }

  hexagram: {
    original: number           // 本卦编号 1-64
    changed: number | null     // 变卦编号（无变卦时为 null）
    changingLines: number[]    // 动爻位置 [1-6]
  }

  interpretations: Array<{
    id: string
    type: 'default' | 'deep'
    trend: '利' | '不利' | '中性'
    analysis: string           // 结构化分析原文
    conditions: string[]       // 核心条件列表
    timeWindow: string         // 时间窗口描述
    answer: string             // 综合判断结论
    confidence: '高' | '中' | '低'
    model: string              // 使用的模型
    promptVersion: string      // Prompt 版本
    temperature?: number
    rawResponse?: string       // 完整 AI 响应（调试用）
    claims: Array<{
      id: string
      type: 'trend' | 'condition' | 'timeWindow' | 'advice' | 'answer'
      text: string
    }>
  }>

  feedback: {
    dueAt: string | null        // ISO 字符串，到期后再提醒；null 表示不主动提醒
    status: 'pending' | 'accurate' | 'inaccurate' | 'unclear'
    detail?: {
      actualResult?: string    // 实际结果描述
      satisfaction?: number    // 1-5
      actualDuration?: number  // 天数
      actionTaken?: string      // 实际采取的行动
      aiInfluencedDecision?: boolean
      notes?: string           // 自由记录
      claimFeedback?: Array<{
        claimId: string
        status: 'hit' | 'miss' | 'unclear'
      }>
    }
  }

  duplicate?: {
    countWithin24h: number
    relatedRecordIds: string[]
  }
}
```

### 古籍数据

```typescript
interface HexagramData {
  id: number                   // 1-64 周易卦序
  name: string                 // "乾"
  namePinyin: string           // "qián"
  trigramUpper: string         // "☰"
  trigramLower: string         // "☰"
  judgment: string             // 卦辞原文
  judgmentModern: string       // 现代译文
  image: string                // 象辞原文
  imageModern: string          // 象辞译文
  lines: Array<{
    position: number           // 1-6
    name: string               // "初九" / "九二" / ... / "上九"
    text: string               // 爻辞原文
    modern: string             // 爻辞现代译文
  }>
}
```

数据以 JSON 文件内置在项目中，用户后续提供原文，系统填入上述格式。

### 存储方案

| 数据 | 存储位置 | 备注 |
|------|----------|------|
| 古籍数据 | 项目源码 JSON | 只读，规则层 |
| 占卜记录 | IndexedDB | 读写，数据层，保存 schemaVersion |
| API Key | localStorage | 读写，永不离开浏览器 |
| 导出 | JSON 文件下载 | 手动触发备份 |

---

## 五、AI 解读架构

### 模型策略

| 场景 | 模型 | 特点 |
|------|------|------|
| 默认解读 | `deepseek-v4-flash` | 快速、便宜 |
| 深度分析 | `deepseek-v4-pro` | 用户主动触发，更深推理 |

### Double-Call 流程

```
用户问题 + 卦象数据
        │
        ▼
┌─────────────────────────────┐
│  第一次调用（结构化推理）      │
│  System: 易经推理引擎         │
│  Output: 严格 JSON            │
│  {                           │
│    trend, analysis,           │
│    conditions, timeWindow,    │
│    answer, confidence         │
│  }                           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  第二次调用（受控叙事）       │
│  System: 易经解读师           │
│  Input: 第一次结果 + 用户问题  │
│  Output: 四段结构化展示       │
│                              │
│  【趋势判断】                 │
│  【核心条件】                 │
│  【时间窗口与建议】            │
│  【综合判断】                 │
└─────────────────────────────┘
```

**容错**：第二次调用失败时自动重试一次。

**约束**：
- 禁止「天意」「命中注定」「吉人天相」「大吉大利」等空洞表述
- 必须引用卦辞/爻辞原文出处
- 综合判断必须明确，不含混
- 每次 AI 结果必须保存 `model`、`promptVersion`、`temperature`、调用类型和可验证 `claims`
- 第一次调用必须使用 JSON 模式（如 API 支持）并经过运行时 schema 校验；只 `JSON.parse` 不足以视为成功

---

## 六、反馈系统

### 反馈流程

```
打开 App
    │
    ▼
检查到期待反馈列表（status === 'pending' 且 dueAt <= now）
    │
    ├── 有待反馈 → 显示列表
    │       │
    │       ▼
    │   ┌─────────────────────────┐
    │   │ 上次问：谈加薪能成吗       │
    │   │ 当时判断：利              │
    │   │                         │
    │   │ [ 准 ] [ 不准 ] [ 还不清楚 ]│
    │   │                         │
    │   │ ▸ 展开详细记录            │
    │   └─────────────────────────┘
    │       │ 点击后关闭，下一个    │
    │
    └── 无待反馈 → 直接进入首页
```

### 详细记录（展开后）

- 实际结果描述（文本）
- 结果满意度（1-5 滑块）
- 实际耗时（天数）
- 与自身判断是否一致（是/否）
- 自由备注

**不强制填写详细记录**，极简三按钮即可完成反馈。

反馈默认不在占问完成后立即弹出。新记录应根据问题类型生成一个可调整的 `feedback.dueAt`：

- 工作 / 人际 / 财务：默认 7 天后
- 健康：默认 14 天后
- 其他：默认 7 天后

用户可以在反馈覆盖层选择"稍后提醒"，系统更新 `dueAt` 而不改变 `status`。

---

## 七、界面结构

```
应用路由
─────────────────────────────────────────

  /                  首页
  /divine             起卦页（虚拟摇卦 + 手动输入）
  /result/:id         解读结果页
  /history            历史记录列表
  /history/:id        单条记录详情
  /stats              个人统计面板
  /settings           设置（API Key、导出/导入）
```

### 起卦页流程

```
┌─────────────────────────────────────────┐
│                                          │
│  ① 输入问题                              │
│  ┌──────────────────────────────────┐    │
│  │ 跟老板谈加薪能成吗？              │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ② 选择分类                              │
│  [工作] [人际] [财务] [健康] [其他]        │
│                                          │
│  ③ 选择起卦方式                          │
│  [虚拟摇卦] [手动输入]                    │
│                                          │
│  ④ 起卦交互（以虚拟摇卦为例）              │
│                                          │
│     ┌───────┐  ← 三枚铜钱动画区域       │
│     │ ◉ ◉ ◉ │                            │
│     └───────┘                            │
│                                          │
│     卦盘（从下往上逐爻揭晓）：              │
│     第 6 爻：──○──  ⚊（老阳）            │
│     第 5 爻：────  ⚊（少阳）             │
│     第 4 爻：──×──  ⚋（老阴）            │
│     第 3 爻：────  ⚊                     │
│     第 2 爻：── ──  ⚋                    │
│     第 1 爻：────  ⚊                     │
│                                          │
│     [掷铜钱] / [完成起卦]                 │
│                                          │
└─────────────────────────────────────────┘
```

### 手动输入方式

```
每爻一步：选背面数量（0/1/2/3）
系统自动判断爻型并显示
6 步完成后自动计算卦象
```

---

## 八、技术架构

```
┌──────────────────────────────────────────────┐
│                  Browser                       │
│                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │  React UI │  │ AI Layer │  │  Data Layer  │ │
│  │  (motion) │  │ (fetch)  │  │  (IndexedDB) │ │
│  └─────┬─────┘  └────┬─────┘  └──────┬───────┘ │
│        │              │               │         │
│  ┌─────▼──────────────▼───────────────▼───────┐ │
│  │           Rules Engine (Immutable)          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │ │
│  │  │ 起卦计算  │  │ 卦象查询  │  │ 一事二占  │  │ │
│  │  │          │  │ (JSON)   │  │  检查     │  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  │ │
│  └────────────────────────────────────────────┘ │
│                                                │
│  External:                                      │
│  ┌──────────────────────────────────────────┐  │
│  │         DeepSeek API                      │  │
│  │  deepseek-v4-flash / deepseek-v4-pro      │  │
│  └──────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### 项目文件结构

```
yijing-bugua-new/
├── public/
├── src/
│   ├── data/
│   │   └── hexagrams.json          # 64 卦数据（古籍原文）
│   ├── engine/
│   │   ├── casting.ts              # 起卦计算（本卦/变卦/动爻）
│   │   ├── hexagram-lookup.ts      # 卦象查询
│   │   └── duplicate-check.ts      # 一事不二占检查
│   ├── ai/
│   │   ├── prompt-builder.ts       # Prompt 构造
│   │   ├── reasoning-call.ts       # 第一次调用（推理）
│   │   ├── narrative-call.ts       # 第二次调用（叙事）
│   │   └── deepseek-client.ts      # DeepSeek API 封装
│   ├── db/
│   │   ├── schema.ts               # IndexedDB schema
│   │   ├── records.ts              # 占卜记录 CRUD
│   │   └── export-import.ts        # JSON 导出导入
│   ├── components/
│   │   ├── casting/                # 起卦相关组件
│   │   │   ├── VirtualCoins.tsx     # 虚拟铜钱动画
│   │   │   ├── ManualInput.tsx      # 手动输入界面
│   │   │   └── HexagramBoard.tsx    # 卦盘展示
│   │   ├── result/                 # 结果展示组件
│   │   │   ├── Interpretation.tsx   # 结构化解读展示
│   │   │   └── DeepAnalysis.tsx     # 深度分析按钮+结果
│   │   ├── feedback/               # 反馈组件
│   │   │   ├── FeedbackList.tsx     # 待反馈列表
│   │   │   └── FeedbackDetail.tsx   # 详细反馈展开
│   │   ├── stats/                  # 统计面板
│   │   │   └── StatsPanel.tsx
│   │   ├── settings/               # 设置
│   │   │   └── SettingsView.tsx
│   │   └── layout/                 # 布局组件
│   │       ├── AppShell.tsx
│   │       └── Navigation.tsx
│   ├── hooks/
│   │   ├── useDivination.ts        # 起卦流程 hook
│   │   ├── useFeedback.ts          # 反馈状态 hook
│   │   └── useHistory.ts           # 历史记录 hook
│   ├── lib/
│   │   ├── utils.ts                # 通用工具
│   │   └── constants.ts            # 常量定义
│   ├── types/
│   │   └── index.ts                # 全局类型
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── engine/                     # 规则引擎测试（TDD）
│   ├── db/                         # 数据层测试（TDD）
│   └── e2e/                        # Playwright E2E
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── vitest.config.ts
```

---

## 九、待用户提供

| 项目 | 提供者 | 格式要求 |
|------|--------|----------|
| 64 卦原文（卦辞 + 爻辞 + 象辞） | Thomas | 每卦按 HexagramData schema 填写 |
| DeepSeek API Key | Thomas | 在 Settings 页面输入，存 localStorage |

---

## 十、规则细节补充

### 动爻取用原则（Phase A）

- 无动爻：重点展示本卦卦辞
- 一动爻：重点展示本卦对应爻辞
- 多动爻：展示全部动爻爻辞，并把变卦作为趋势方向
- 六爻皆动：本卦与变卦并重；乾坤特殊用辞可在后续数据完善时补充

### 数据导出格式

导出 JSON 顶层结构：

```typescript
{
  app: 'yijing-bugua'
  schemaVersion: 1
  exportedAt: string
  records: DivinationRecord[]
}
```

---

## 十一、Phase B 预留

以下设计决策为 Phase B 的六爻纳甲预留接口，不影响 Phase A 实施：

- 起卦时间戳已记录（用于月建日辰计算）
- 卦象数据结构可扩展（六亲/六神/世应字段已在类型系统中预留）
- 多起卦方式（时间卦/数字卦）的入口已在起卦页 UI 中预留
