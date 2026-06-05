# 项目变更记录

## 2026-06-06

### 🐛 Vercel 部署后注册/登录 "Load failed"

**问题**：项目部署到 Vercel 后，注册账号时显示 "Load failed"。

**根因**：`.gitignore` 排除了 `.env` 文件，导致 Supabase URL 和 anon key 未推送到 GitHub。Vercel 构建时读不到 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`，应用 fallback 到 `https://placeholder.supabase.co`，请求自然失败。

**修复**：从 `.gitignore` 中移除 `.env` 条目，将 `.env` 文件纳入版本控制。由于 `.env` 中仅包含 Supabase URL 和 anon key（均为客户端公开值，Vite 会将 `VITE_` 前缀变量打包到前端 JS），不存在安全风险。

**涉及文件**：`.gitignore`、`.env`

---

## 项目：易经占卜 (yijing-bugua)

---

## 变更类型说明

| 标记 | 含义 |
|------|------|
| 🐛 BUG | 逻辑错误、功能异常 |
| ✨ IMPROVE | 功能增强、体验优化 |
| 🏗️ ARCH | 架构调整、重构 |
| 🧪 TEST | 测试相关 |

---

## 2026-06-05 (Supabase 云同步)

### ✨ Supabase 云同步服务配置完成

**背景**：项目已有云同步代码（`supabase.ts`、`sync.ts`、`records`/`user_settings` 表 schema），但未连接真实 Supabase 后端。本次完成从 CLI 初始化到服务验证的全流程配置。

**完成事项**：

| # | 步骤 | 状态 |
|---|------|------|
| 1 | Supabase CLI 安装（v2.105.0 via brew） | ✅ |
| 2 | `supabase link --project-ref hiqnvjeoaqtdkevpalvp` | ✅ |
| 3 | 数据库 schema 迁移推送（`records` + `user_settings` 表 + RLS 策略） | ✅ |
| 4 | Auth 邮箱确认关闭（`mailer_autoconfirm: true`，适配虚拟邮箱 `@yijing-bugua.local`） | ✅ |
| 5 | `.env` 写入 Supabase URL + anon key（已在 `.gitignore` 中） | ✅ |
| 6 | `npm run build` 验证通过（vite v8.0.14，2.97s） | ✅ |

**Supabase 项目信息**：
- Project Ref: `hiqnvjeoaqtdkevpalvp`
- URL: `https://hiqnvjeoaqtdkevpalvp.supabase.co`
- Region: AWS ap-south-1
- 数据库表：`records`（占卜记录）、`user_settings`（用户设置）

**网络说明**：`supabase db push --linked` 因本地 VPN/代理网络导致 TLS 连接超时（DNS 解析到 `198.18.0.49`），改用 Supabase Management API（`/v1/projects/{ref}/database/query`）成功推送。后续如需重新推送迁移，建议暂时关闭 VPN。

**验证**：TypeScript 编译无错误，Vite 构建成功，`supabaseReady` 评估为 `true`。

---




## 2026-06-05

### ✨ 全站前端视觉重设计（20个文件）

**背景**：原设计使用通用蓝色（`blue-600`）+ 冷灰色调，视觉上像普通 SaaS 后台，与易经占卜主题毫无关联。全面重设计为"温润纸墨风"。

**设计方向**：传统中国美学 × 现代极简 — 暖石色调底色、朱砂红主色、青铜/金色点缀、宋体衬线标题。

**配色方案变更**：

| 用途 | 旧色 | 新色 | 说明 |
|------|------|------|------|
| 页面背景 | 白色 `white` | 宣纸色 `#f7f3ee` | 温暖纸质感 |
| 主操作色 | 蓝 `blue-600` | 朱砂红 `#b94234` | 传统朱砂色 |
| 强调色 | 紫 `purple-600` | 青铜 `#8b6914` | 古铜/青铜质感 |
| 导航栏 | 白底灰线 | 深色 `stone-900` + 金色高亮 | 墨底金字 |
| 卦板背景 | 浅灰 `gray-50` | 深墨 `stone-800` | 墨色卦板 |
| 文字主色 | 冷灰 `gray-900` | 暖墨 `#2c1810` | 温暖墨色 |
| 次要文字 | 冷灰 `gray-500` | 暖石 `#5c4a3a` | 温暖灰调 |
| 边框 | 冷灰 `gray-300` | 暖石 `stone-300` | 不再冰冷 |

**组件变更明细**：

| 组件 | 变更内容 |
|------|----------|
| `index.css` | 新增 10 个自定义主题色（parchment/ink/vermillion/bronze/gold/jade），全局宋体衬线字体 |
| `AppShell` | 深色导航栏 `stone-900`，金色品牌文字 + 金色下划线活跃态 |
| `HomeView` | 标题加大 + 金色分割线装饰，按钮增加阴影和 active 缩放反馈 |
| `Login` | 纸色背景 + 金色装饰线 + 朱砂按钮 |
| `Register` | 同 Login 风格统一 |
| `QuestionInput` | 分类按钮朱砂选中态，textarea 朱砂 focus 环 |
| `BeforeDivination` | 信心度按钮朱砂选中 + 阴影，输入框暖色 focus |
| `MethodToggle` | 纸色暗底 + 朱砂活跃态 |
| `HexagramBoard` | 深墨底 `stone-800` + 金色卦名 + 朱砂动爻标记 |
| `VirtualCoins` | 铜钱古铜渐变（替代 emoji 🪙），"文/背"文字展示，掷币按钮青铜色 |
| `ManualInput` | 朱砂进度条 + 白底暖边选择器 |
| `Interpretation` | 卦象区深墨底金字，AI 解读区纸色背景 + 青铜边框 |
| `AIProgressIndicator` | 加载旋钮改青铜色 |
| `ResultView` | 朱砂主按钮 + 青铜深度分析按钮 |
| `FeedbackForm` | 白卡片 + stone 边框 + 朱砂按钮 + `accent-vermillion` 滑块 |
| `FeedbackList` | 弹窗遮罩加深 `black/60`，按钮分色（绿/朱砂/灰） |
| `HistoryView` | 白卡片 + stone 边框 + 反馈状态分色标签 |
| `HistoryDetailView` | 同 HistoryView 风格 |
| `StatsView` | 白卡片统计面板 + stone 边框 |
| `SettingsView` | 分区白卡片布局 + 朱砂/绿色/灰色按钮分层 |

**不涉及的变更**：
- 零逻辑变更（所有 state、props、事件处理、数据流完全不变）
- 零功能增减
- 零测试变更（41 个测试全部保持通过）

**验证**：TypeScript 编译无错误，41 个测试全部通过，Vite 构建成功（745ms）。

---

## 2026-06-04

### 🏗️ 代码审查问题全面修复（13项）

**背景**：对项目进行完整代码审查后，逐一修复发现的架构缺陷、代码重复、类型安全和 UI 逻辑问题。

**修复清单**：

| # | 类型 | 文件 | 问题 | 严重性 |
|---|------|------|------|--------|
| 1 | 🏗️ | `deepseek-client.ts` | API Key 管理函数重复定义（与 `api-key.ts` 完全相同） | HIGH |
| 2 | 🏗️ | `feedback-due.ts` | `FEEDBACK_DUE_DAYS` 重复定义（与 `constants.ts` 完全相同） | HIGH |
| 3 | 🐛 | `useDivination.ts` | 重复占问检查为 TODO，`duplicate-check.ts` 引擎函数从未被调用 | HIGH |
| 4 | 🐛 | `FeedbackList.tsx` | 在 render 阶段直接调用 `onAllDone` 回调导致 React state 级联更新 | HIGH |
| 5 | 🏗️ | `FeedbackForm.tsx` `FeedbackList.tsx` `useFeedback.ts` | 多处 `any` 类型（`onChange` 事件、`submitDetail` 参数） | MEDIUM |
| 6 | 🐛 | `ResultView.tsx` | "获取 AI 解读"和"重新获取 AI 解读"按钮同时显示 | MEDIUM |
| 7 | 🏗️ | `HomeView.tsx` | `queryPendingDue` 被调用两次 | LOW |
| 8 | 🐛 | `supabase.ts` | 环境变量缺失时直接 `throw`，应用崩溃无法启动 | HIGH |
| 9 | 🐛 | `sync.ts` | 未检查 Supabase 配置状态，调用云同步时抛出未捕获错误 | HIGH |
| 10 | 🏗️ | `index.html` | `lang="en"`，但界面语言为中文 | LOW |
| 11 | 🐛 | `vercel.json` | 缺少 SPA 路由回退规则，刷新子路由返回 404 | MEDIUM |
| 12 | 🏗️ | `.gitignore` | `.bak` 和 `.DS_Store` 各出现两次 | LOW |
| 13 | 🏗️ | `HomeView.tsx.bak` | 残留备份文件 | LOW |

**详细修复**：

1. **API Key 去重** — `deepseek-client.ts` 移除 `getApiKey`/`setApiKey`/`removeApiKey`/`hasApiKey` 四个函数，改为 `import { getApiKey } from '../lib/api-key.js'`；`double-call.ts` 和 `useAIInterpretation.ts` 的 `hasApiKey` 导入改为从 `api-key.js`
2. **FEEDBACK_DUE_DAYS 去重** — `feedback-due.ts` 移除本地 `DEFAULT_DUE_DAYS` 常量，改为 `import { FEEDBACK_DUE_DAYS } from './constants.js'`
3. **重复占问检查集成** — `useDivination.ts` 的 `completeCasting` 中新增 `getAllRecords()` + `checkDuplicate(question, allRecords, 24)` 调用，将结果写入 `record.duplicate`
4. **FeedbackList render-phase 修复** — 新增 `loaded` 状态，`queryPendingDue` 结果为空时在 `useEffect` 中调用 `onAllDone`；移除 render 阶段的直接回调调用
5. **any 类型消除** — `FeedbackForm.tsx` 中 5 处 `(e: any)` 替换为 `React.ChangeEvent<HTMLInputElement>`；`FeedbackList.tsx` 中 `FeedbackDetailForm` 的 `onSave` 参数类型从 `any` 改为 `FeedbackDetail`；`useFeedback.ts` 的 `submitDetail` 参数类型从 `any` 改为 `FeedbackDetail`
6. **ResultView 按钮合并** — 合并为单个按钮，文本根据 `hasAutoTriggered` 状态动态显示"获取 AI 解读"或"重新获取 AI 解读"
7. **HomeView 查询合并** — 将两次 `queryPendingDue` 调用合并为一次，`.then` 中同时设置 `pending` 和 `showFeedback`
8. **supabase.ts 优雅降级** — 新增 `supabaseReady` 标志导出，环境变量缺失时使用占位 Supabase 客户端，不再 throw
9. **sync.ts 配置守卫** — `syncOnLogin` 和 `uploadLocalData` 开头检查 `supabaseReady`，未配置时返回 `{ errors: ['Supabase 未配置，云同步不可用'] }`
10. **index.html 语言** — `lang="en"` 改为 `lang="zh-CN"`
11. **vercel.json SPA 路由** — 新增 `"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]`
12. **.gitignore 清理** — 移除重复的 `.bak` 和 `.DS_Store` 条目
13. **残留文件清理** — 删除 `src/pages/HomeView.tsx.bak`

**涉及文件**：`deepseek-client.ts`、`api-key.ts`、`double-call.ts`、`useAIInterpretation.ts`、`feedback-due.ts`、`useDivination.ts`、`FeedbackList.tsx`、`FeedbackForm.tsx`、`useFeedback.ts`、`ResultView.tsx`、`HomeView.tsx`、`supabase.ts`、`sync.ts`、`index.html`、`vercel.json`、`.gitignore`

**验证**：41 个单元测试全部通过，TypeScript 编译无错误，Vite 构建成功。

---

## 2026-06-01

### 🐛 代码审查发现的10个Bug修复

**问题**：通过全面代码审查发现的10个Bug，涵盖正确性、错误处理、数据完整性和UI显示问题。

**修复清单**：

| # | 文件 | 问题 | 严重性 |
|---|------|------|--------|
| 1 | `Interpretation.tsx` | className 使用普通字符串而非模板字面量，导致趋势标签始终显示灰色 | CRITICAL |
| 2 | `DivineView.tsx` | useEffect 和 ManualInput 按钮同时调用 completeCasting 导致重复记录 | HIGH |
| 3 | `hexagram-lookup.ts` | getLineText 的 .sort() 修改调用方数组，破坏不可变性 | HIGH |
| 4 | `schema.ts` | getDB() 缓存被拒绝的 Promise，导致应用永久不可用 | HIGH |
| 5 | `ResultView.tsx` | getRecordById 无 .catch()，IndexedDB 失败时永久显示加载中 | HIGH |
| 6 | `useDivination.ts` | createRecord 无 try/catch，IndexedDB 写入失败时用户无反馈 | HIGH |
| 7 | `double-call.ts` | 叙事调用失败时返回 success:true 但错误信息被静默吞没 | HIGH |
| 8 | `ManualInput.tsx` | onComplete 类型为 () => void 但实际是 async 函数 | MEDIUM |
| 9 | `duplicate-check.ts` | countWithin24h 字段名与参数化 windowHours 不匹配 | MEDIUM |
| 10 | `export-import.ts` | 硬编码 schemaVersion:1 而非使用 SCHEMA_VERSION 常量 | MEDIUM |

**详细修复**：

1. **Interpretation.tsx:70** - 使用模板字面量 `` className={`... ${condition ? 'class' : 'other'}`} ``
2. **DivineView.tsx:14-16** - 添加 useRef 防重复调用守卫
3. **hexagram-lookup.ts:34** - 改为 `[...changingLines].sort()` 排序副本
4. **schema.ts:10** - 添加 `.catch()` 处理，失败时重置 dbPromise 为 null 允许重试
5. **ResultView.tsx:24** - 添加 `.catch()` 处理，失败时 setLoading(false)
6. **useDivination.ts:119** - 添加 try/catch，失败时仍导航到结果页
7. **double-call.ts:54** - 显式设置 `narrative: undefined`，useAIInterpretation 中读取 result.error
8. **ManualInput.tsx:7** - 类型改为 `() => void | Promise<void>`
9. **duplicate-check.ts:37** - 字段重命名为 `countInWindow`，同步更新类型、Schema 和测试
10. **export-import.ts:18** - 使用 `SCHEMA_VERSION` 常量

**涉及文件**：`Interpretation.tsx`、`DivineView.tsx`、`hexagram-lookup.ts`、`schema.ts`、`ResultView.tsx`、`useDivination.ts`、`double-call.ts`、`ManualInput.tsx`、`duplicate-check.ts`、`export-import.ts`、`types/index.ts`、`schemas.ts`、`useAIInterpretation.ts`、`duplicate-check.test.ts`

---

### 🐛 虚拟摇卦三枚铜钱无差异化结果

**问题**：`VirtualCoins.tsx` 三枚铜钱在翻转动画和结果展示时都显示相同的 `○` 和 `?`，没有体现每枚铜钱的独立结果（字/背）。

**根因**：只调用了 `castLine()` 返回聚合值，没有保留三枚铜钱的独立字/背结果。

**处理**：
1. `src/engine/casting.ts` 新增 `tossCoinsDetailed()` 返回三枚铜钱的独立结果
2. 重写 `VirtualCoins.tsx`，实现三阶段交互：掷铜钱 → 展示每枚结果 → 用户确认
3. `useDivination.ts` 新增 `setLineValue(value)` 让 VirtualCoins 传入已确定的值

**涉及文件**：`casting.ts`、`VirtualCoins.tsx`、`useDivination.ts`、`DivineView.tsx`

---

### 🐛 BeforeDivination 页面输入即跳转

**问题**：在"起卦前记录判断"页面的输入框中打字，立即跳转到下一步。

**根因**：`DivineView.tsx` 将 `onChange` 错误连接到 `setBeforeAndContinue`（该函数会推进步骤）。

**处理**：新增 `updateBeforeDivination` 函数（仅更新数据），`onChange` 连接到此函数。

**涉及文件**：`useDivination.ts`、`DivineView.tsx`

---

### ✨ BeforeDivination 缺少"保存并继续"按钮

**问题**：只有"跳过"按钮，无法保存输入内容后继续。

**处理**：新增 `onNext` prop 和蓝色"保存并继续"按钮，`DivineView.tsx` 中连接到 `setBeforeAndContinue`。

**涉及文件**：`BeforeDivination.tsx`、`DivineView.tsx`

---

### 🐛 castNextLine 忽略传入值

**问题**：`castNextLine()` 内部调用 `castLine()` 重新生成随机数，VirtualCoins 通过 `onCast` 传入的 LineValue 被丢弃。

**处理**：新增 `setLineValue(value)` 接受指定值。

**涉及文件**：`useDivination.ts`、`DivineView.tsx`

---

## 2026-05-30

### ✨ 全站增加主动反馈入口

**问题**：只能在首页待反馈弹窗做反馈，结果页和历史详情页没有反馈入口。

**处理**：创建 `FeedbackForm.tsx` 可复用组件，集成到 ResultView 和 HistoryDetailView。

**涉及文件**：`FeedbackForm.tsx`（新建）、`ResultView.tsx`、`HistoryDetailView.tsx`

---

## 2026-05-29

### 🐛 Export-Import 顶级 schema 校验失败

**问题**：`exportDataSchema` 中一条无效记录导致整批导入被拒。

**处理**：顶级校验改为宽松 schema，记录级别逐条校验。

**涉及文件**：`export-import.ts`

---

### 🐛 Zod v4 API 不兼容

**问题**：Zod v4 中 `.min()`/`.max()` 应使用 `.gte()`/`.lte()`。

**涉及文件**：`schemas.ts`

---

### 🐛 DeepSeek API Key 首次认证失败

**问题**：第一个 Key 返回 401。用户提供第二个 Key 后验证通过。

**可用配置**：模型 `deepseek-v4-flash`，端点 `https://api.deepseek.com/chat/completions`

---

### 🧪 E2E 测试修复

**问题**：`text=` 选择器在多处重复匹配；按钮文字变更后未同步。

**处理**：改用 `getByRole`；同步按钮文字。

---

### 🏗️ 构建类型错误修复

**问题**：`erasableSyntaxOnly` 禁用参数属性语法；多处未使用变量。

**涉及文件**：`deepseek-client.ts` 类定义；各组件未使用变量清理。

---

## 最终项目结构

```
src/
├── ai/              # 5 文件
├── engine/          # 4 文件
├── db/              # 3 文件
├── lib/             # 3 文件
├── hooks/           # 3 文件
├── components/
│   ├── casting/     # 6 文件
│   ├── result/      # 2 文件
│   ├── feedback/    # 2 文件
│   └── layout/      # 1 文件
├── pages/           # 7 文件
├── types/           # 1 文件
└── data/            # 1 文件
tests/
├── engine/          # 3 文件
├── db/              # 2 文件
└── e2e/             # 1 文件
```

## 测试覆盖

| 层 | 数量 | 范围 |
|----|------|------|
| 单元测试 | 41 | 规则引擎、IndexedDB、导入导出 |
| E2E 测试 | 7 | 导航、起卦、反馈、API Key、规则回退 |

### ✨ 结果页增加手动 AI 解读触发入口

**问题**：用户起卦后才发现没有 API Key 或 Key 失效，导致无法重新获取 AI 解读（之前做的起卦都浪费了）。

**根因**：ResultView 只在有 Key 且无 interpretations 时自动触发，无 Key 时没有任何提示。

**处理**：
1. 无 Key 时：显示提示卡片 + "前往设置 →" 链接
2. 有 Key 但无解读：显示"获取 AI 解读"按钮
3. Key 失效导致解读失败：显示错误信息 + "重试"按钮 + "检查 API Key"链接
4. 已有解读想重新获取：显示"重新获取 AI 解读"按钮

**新增场景**：
- `hasAutoTriggered` 状态防止重复自动触发
- 解读失败后用户填好新 Key 可以回到该页面点击"重试"

**涉及文件**：`src/pages/ResultView.tsx`
