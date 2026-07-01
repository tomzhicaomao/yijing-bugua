# 项目变更记录

## 2026-07-01 (Bug Fixes)

### 🔧 修复 3 个运行时问题

1. **LiurenResultView 空指针崩溃**：`deserializedPan!.tianDiPan` 在反序列化失败时崩溃 → 改为 `deserializedPan?.tianDiPan` 空安全访问
2. **虚岁计算错误**：`calculateNianMingContext` 仅用地支差计算虚岁（同支不同干时结果=1） → 改用完整 60 甲子序差值（1990庚午→虚岁37）
3. **AI 解读静默 fallback**：`api/deepseek.ts` Zod schema 只允许 `deepseek-chat`/`deepseek-reasoner`，但客户端发送 `deepseek-v4-flash` → 放宽为 `z.string()` 兼容所有模型名

---

## 2026-07-01 (年命必填 + 占事分类对齐)

### ✅ 完整实现（8 Phase）

**Phase 1 — 类型层 + 数据库**：
- 新增 `src/types/nian-ming.ts`：NianMing / NianMingContext 类型 + 天干地支选项常量
- 扩展 `LiurenPanData`、`DivinationRecord`、`LiurenParams`、`LiurenPan` 添加 nianMing 字段
- 新增 2 个 Supabase migration（user_settings.nian_ming、records.nian_ming）

**Phase 2 — 年命持久化层**：
- 新增 `src/lib/nian-ming-storage.ts`：localStorage + Supabase 云同步
- `AuthContext` 登录时自动加载年命到 localStorage

**Phase 3 — 设置页 UI**：
- 新增 `src/components/liuren/NianMingPicker.tsx`：天干+地支双列选择器
- `SettingsView` 新增年命设置区块（保存/修改/清除）

**Phase 4 — 年命计算引擎**：
- 新增 `src/engine/liuren/nian-ming.ts`：虚岁 + 行年干支计算

**Phase 5 — 起课页 + Hook**：
- `LiurenView` 分类替换为 ZhanShi 9 宫格选择
- `LiurenView` 新增年命覆盖（代占场景）
- `useLiuren` hook：nianMing 校验、计算、传递

**Phase 6 — AI Prompt 集成**：
- `liuren-prompt-builder` V2 注入年命+行年信息
- `liuren-call` V2 传递 nianMingContext

**Phase 7 — 结果展示 + DB**：
- `LiurenResultView` 显示年命/行年/虚岁
- `db/records.ts` 序列化 nianMing 字段

**Phase 8 — 常量**：
- `lib/constants.ts` 新增 ZHAN_SHI_OPTIONS（9 类占事）

---

## 2026-07-01 (修复计划执行)

### ✅ FIX-PLAN.md 全量执行完成

**Phase 1 — 常量去重 + 引擎输入验证**：
- `types.ts:getShengKe()` → 复用 `constants.ts` 的 `isSheng`/`isKe`
- `dungan.ts:calcLiuQin()` → 复用 `constants.ts`，删除本地 shengCycle/keCycle
- 5 个文件的局部地支数组 → 统一导入 `ALL_BRANCHES`
- `yingqi.ts` → 删除本地 `chongMap`/`riMaMap`/`sanHeMap`，改用 `constants.ts`
- `calculateLiuren()` 入口添加日期/时辰/年份输入验证

**Phase 2 — 类型安全 + 错误处理**：
- 新增 `serialize.ts`：`serializePan()`/`deserializePan()` 替代 `as unknown as` 断言
- `interpretation` 字段标记 `@deprecated`，不再写入新记录
- 5 个文件添加错误处理（`HomeView`/`ResultView`/`FeedbackForm`/`bifa.ts`/`shensha.ts`）
- `deleteRecord`/`clearAll` 包裹 `withRetry`
- `shensha.ts` 4 处 `as Branch` → `assertBranch()` 验证

**Phase 3 — AI + UI 一致性**：
- `useLiuren.ts` 改用 `callLiurenInterpretationV2()`，新增 `zhanShi.ts`
- 提取共享组件 `SectionLabel`/`TrendBadge`/`Collapsible` 消除 DRY 违反
- `LiurenDetailView` 移除 `framer-motion`/`dark:` 变体
- 删除 `warnings.ts`/`jieqi-boundary.ts` 死代码
- `biyong.ts` 恒等式修复
- `KeGeCategory` 移至 `framework-types.ts` 消除循环依赖
- `DivinationRecord.framework` 复用 `FrameworkAnalysis` 类型

**Phase 4 — 测试 + 工程化**：
- 新增 `serialize.test.ts`（9 tests）、`validation.test.ts`（7 tests）
- 交叉验证增强：10 个参考案例具体值断言
- `.gitignore` 添加 `data/`
- 安装缺失依赖 `lucide-react`

**结果**：14 test files, 159 tests passing, 0 type errors, build succeeds

---

## 2026-07-01

### 📝 第一性原理审查 + 修复方案

- 新增 `docs/FIRST-PRINCIPLES-REVIEW.md`：基于第一性原理的全面项目审查报告（37 个问题，按 CRITICAL/HIGH/MEDIUM/LOW 分级）
- 新增 `docs/FIX-PLAN.md`：4 阶段修复方案（常量去重 → 类型安全 → AI/UI 统一 → 测试补全，共 ~35h）
- 更新 `CLAUDE.md`：补充架构树缺失文件 + 添加深入文档指针表 + 红线规则

### ✅ 框架层实现（4 Phase 全量完成）

**目标**：将大六壬从"AI自由联想"升级为"确定性计算 + 标准化框架 + AI叙事合成"

**Phase 1 — 框架层核心**：
- `keGe.ts` + `keGeDb.ts`：64课名分类（10基础 + 8特殊课格）
- `bifa.ts` + `bifaRules.ts`：20条毕法赋规则匹配引擎
- `tianjiang-meaning.ts`：12天将 × 8占事类型语义映射
- `liuqin-analysis.ts`：8种占事场景的六亲权重分析
- `framework.ts`：`analyzeFramework()` 统一入口

**Phase 2 — 框架层完善**：
- `kongwang-analysis.ts`：空亡四级分类（真空/半空/转空/落底）
- `yingqi.ts`：三传数理 + 空亡填实 + 驿马冲动 + 三合局应期推算

**Phase 3 — AI Prompt 升级**：
- `liuren-prompt-builder.ts` V2：AI 角色从"判断者"改为"叙事者"
- `liuren-call.ts` V2：`callLiurenInterpretationV2()` 先框架分析后AI合成

**Phase 4 — 前端集成**：
- `types/index.ts`：`DivinationRecord.framework` JSONB 字段
- `LiurenDetailView.tsx`：课格/毕法赋/天将/六亲/信号折叠面板

**测试**：142 tests passing across 12 test files

---

### 🔧 对抗性审查修复

**CRITICAL 修复**：
1. `db/records.ts`：`toSupabaseRow`/`fromSupabaseRow` 添加 `framework` 字段持久化
2. `framework.ts`：集成 `analyzeKongWang` + `calculateYingQi`（此前为死代码）
3. `bifaRules.ts` Rule 17：条件数学上不可能 → 改为检查三传落墓库(辰戌丑未)
4. `bifaRules.ts` Rule 9：`GAN_JI_GONG[dayGan]` → `dayGanZhi[1]`（日支）

**HIGH 修复**：
5. `keGe.ts`：连茹检测支持逆序/循环序列（差值=1或11）
6. `kongwang-analysis.ts`：月份映射 `['丑','寅',...]` → `['寅','卯',...]`（寅月起）
7. `bifa.test.ts`：vacuous `expect(true).toBe(true)` → 实际断言

---

## 2026-06-30

### 🐛 大六壬记录 method 字段修复 + VARCHAR 扩展

**问题**：大六壬保存失败，报 "value too long for type character varying(10)"。

**根因**：
1. `useLiuren.ts` 的 `buildRecord` 硬编码 `method: 'virtual'`，大六壬记录被存为虚拟摇卦
2. 初始 schema 定义 `method VARCHAR(10)`，但 `'liuren-zhengshi'`(16字符) 超出限制

**修复**：
1. `buildRecord` 改为 `customShiZhi ? 'liuren-huoshi' : 'liuren-zhengshi'`
2. 新增 migration `20260630010000_alter_method_column.sql`：`VARCHAR(10)` → `VARCHAR(20)`

**涉及文件**：`src/hooks/useLiuren.ts`、`supabase/migrations/20260630010000_alter_method_column.sql`

---

### 🐛 大六壬历史记录路由修复

**问题**：从历史列表点击查看大六壬记录时，页面错误显示"虚拟摇卦"、"卦辞"栏和空白栏。

**根因**：`HistoryView.tsx` 硬编码所有记录跳转到 `/history/:id`（易经详情页），大六壬记录应走 `/liuren/:id`（大六壬详情页）。

**修复**：`HistoryView.tsx` 根据 `r.method` 字段条件路由 — `liuren-*` → `/liuren/:id`，其余 → `/history/:id`。

**涉及文件**：`src/pages/HistoryView.tsx`

---

### ⚠️ 部署问题排查

**Vercel 环境变量缺失**：生产站点无法连接 Supabase（"Failed to fetch"）。
- 根因：`.env` 被从 git 移除后，Vercel 未配置 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- 修复：`vercel env add VITE_SUPABASE_URL production` + `vercel env add VITE_SUPABASE_ANON_KEY production`
- ⚠️ Vercel CLI 部署（`vercel --prod`）不会自动读取 .env，必须手动添加

**大六壬保存失败**："Could not find the 'liuren_pan' column"
- 根因：Supabase 数据库未执行 liuren migration
- 修复：在 Supabase Dashboard → SQL Editor 运行 `supabase/migrations/20260630000000_add_liuren_fields.sql`

### ✅ 全量验证修复 — ESLint / 单元测试 / E2E / 安全漏洞

**安全 (npm audit fix)**
- 升级 undici (7 个漏洞) + vite (2 个漏洞) → 0 vulnerabilities

**ESLint (61 错误 + 9 警告 → 0)**
- `eslint.config.js`: 添加 `argsIgnorePattern: "^_"` + `varsIgnorePattern: "^_"`
- `useReducedMotion.ts`: lazy initializer + `unknown` 替代 `any`
- `useGSAPContext.ts` / `useScrollTrigger.ts`: eslint-disable 注释（deps param 模式）
- `VirtualCoins.tsx`: `useReducer` 替代多个 `setState`
- `useLiuren.ts`: 函数重排序 + dep 数组修复
- `ResultView.tsx`: `useRef` 替代 `useState` 守卫标志 + 函数提前声明
- `LiurenResultView.tsx`: 移除冗余 `setLoading(true)`
- `AuthContext.tsx`: eslint-disable for useAuth
- `yarrow-stalk.ts`: `let` → `const`
- `bieze.ts`: 移除未使用变量
- 20+ 测试文件: 修复 `any` 类型和未使用导入

**单元测试 (281/281)**
- `schemas.ts`: `claims.min(1)` → `min(5)` 匹配测试预期
- `useDivination.ts`: `completingRef` 防重复调用

**E2E 测试 (76/76)**
- 铜钱选择器: `[aria-label="铜钱"]` → `[data-testid="coin"]`
- 导航栏: `4` → `5`（六壬功能默认开启）
- 设置页标题: 移除不存在的 "SETTINGS" 断言
- 统计页: 恢复误删的 `mockRecordsApi` 导入
- 铜钱组件: 同步结果计算 + postMessage 自动推进

### 🎨 统一首页大六壬按钮样式

- `HomeView.tsx`: 大六壬入口从自定义卡片改为 `Button variant="secondary"`，与"开始起卦"保持一致

---

### 🐛 Migration 时间戳修复 + 大六壬详情页重新设计

**问题根因**：`20250101000000_add_liuren_fields.sql` 时间戳早于 `20260530000000_initial_schema.sql`，导致 Supabase 按顺序执行时 ALTER TABLE 在表创建之前运行，`liuren_pan` 和 `interpretation` 列从未成功创建。

**修复**：

| 文件 | 说明 |
|------|------|
| `supabase/migrations/20260630000000_add_liuren_fields.sql` | 重命名自 `20250101000000_*`，修正时间戳顺序 |
| `supabase/migrations/20260630000000_add_liuren_fields_rollback.sql` | 对应 rollback 文件同步重命名 |
| `src/types/index.ts` | `LiurenPanData` 补全 `tianDiPan?`、`tianJiang?`、`shenSha?` 三个缺失字段 |
| `src/pages/LiurenResultView.tsx` | 大六壬详情页完全重设计（5 层渐进式架构） |

**LiurenResultView 设计变更**（第一性原理）：

| 层级 | 内容 | 设计意图 |
|------|------|----------|
| Layer 1 | 问题 + AI 结论（趋势/置信度/答案） | 一眼看到"所以呢" |
| Layer 1.5 | 格局 + 日干支 + 起课条件 | 课式概览 |
| Layer 2 | 三传（发用→传递→归结）→ 四课 | 核心推导结果，三传最突出 |
| Layer 3 | 天地盘、起课参数 | 可折叠参考信息 |
| Layer 4 | 天将、神煞、警告 | 可折叠附加信息 |
| Layer 5 | AI 详细解读 + 反馈 | 反思与验证 |

**待手动操作**：在 Supabase Dashboard SQL Editor 执行 `20260630000000_add_liuren_fields.sql` 中的 ALTER TABLE 语句。

---

## 2026-06-29

### 对抗式审查修复（4 个 commit）

**Critical 修复 (5d3e97b)**
- C6: Google Fonts 加载 — 添加 Space Grotesk + Space Mono
- C1: .env 凭证暴露 — 从 git 移除，.gitignore 添加规则
- C4: Zod Schema 扩展 — methodSchema 新增 liuren 类型
- C2: 天将映射修复 — `diPan[tianPanIdx]` → `tianPan[tianPanIdx]`
- C5: 涉害深度方向修复 — KE_MATRIX 索引修正
- C3: 提示注入防护 — `wrapUserInput()` 隔离用户输入

**High 修复 (3989b8a)**
- H1: max_tokens 限制（3000/1500/3000）
- H2: 速率限制（3 秒最小间隔）
- H3: 指数退避重试
- H4: 并发调用锁

**High+Medium 修复 (f58634d)**
- H5: 过时闭包修复（useDivination）
- H6: 数据库写入重试（withRetry）
- H7: 触摸目标增至 44px
- H8: 键盘可访问性
- H10: 节气 JD 计算改进（Meeus 算法）
- H11: 月支/月将分离
- H12: 神煞 derived 类型处理
- 九宗门级联修正（伏吟检查提前）

**Round 2 修复 (342c388)**
- setStep('result') 回归修复
- isNearBoundary 误判修复

**Liuren 保存失败修复 (823b962)**
- toSupabaseRow 条件包含 liuren_pan/interpretation

---

## 2026-06-19

### ✨ 大六壬完整集成（5个Phase · 58个文件 · 11091行新增）

**背景**：将中国传统占卜术"大六壬"（古代三式之一）完整集成到现有易经占卜项目中。从基础常量到引擎层、AI解读、UI组件、路由集成、安全加固，全栈实现。

**总览**：

| Phase | 内容 | 新增文件 | 测试用例 |
|-------|------|:---:|:---:|
| Phase 0 | 基础补齐（常量矩阵、神煞数据） | 4 | 38 |
| Phase A | 引擎层（四课、三传、九宗门、天将、遁干、神煞） | 19 | 81 |
| Phase B | AI + 数据层（Prompt、AI调用、Fallback、Hook） | 4 | — |
| Phase C | UI + 集成（8组件、2页面、路由、导航） | 10 | — |
| Phase D | 交付与加固（Migration、安全、优化） | 3 | — |
| **合计** | | **~50** | **81** |

---

#### Phase 0：基础补齐

| # | 文件 | 说明 |
|---|------|------|
| 1 | `src/engine/liuren/constants.ts` | 编译时常量矩阵：KE_MATRIX（五行相克）、SHENG_MATRIX（五行相生）、CHONG_MAP（地支六冲）、XING_MAP（地支相刑）、HE_MAP（地支六合）、HAI_MAP（地支六害）、SAN_HE（三合局）、RI_MA_MAP（驿马）、GAN_HE（天干五合）、GAN_HE_WUXING（合化五行）、GAN_YINYANG（天干阴阳）+ 14个辅助函数 |
| 2 | `src/data/liuren/shensha-rules.json` | 30个神煞起法规则（年/月/日/时维度），含天乙贵人、驿马、天德、月德、桃花、华盖、劫煞、空亡等 |
| 3 | `src/data/liuren/dizhi-wuxing.json` | 地支五行关系全集：六冲、三刑、六合、三合、六害、驿马、天干五合、寄宫 |
| 4 | `tests/engine/liuren/constants.test.ts` | 38个测试用例，覆盖所有常量表正确性、对称性、辅助函数 |

#### Phase A：引擎层

| # | 文件 | 说明 |
|---|------|------|
| 1 | `src/engine/liuren/types.ts` | 核心类型系统：Branch/Gan/WuXing/LiuQin/GeJu/KeRelation + 所有常量表 + getShengKe()（已存在，未修改） |
| 2 | `src/engine/liuren/tiandi-pan.ts` | 天地盘构建：buildTianDiPan（月将+占时→天盘旋转）、getTianPanZhi（已存在，未修改） |
| 3 | `src/engine/liuren/jieqi.ts` | 节气/月将计算：天文公式±1天精度（已存在，未修改） |
| 4 | `src/engine/liuren/sike.ts` | 四课生成：日干寄宫→上神×4 + 生克关系标注（上克下↓/下贼上↑/比和=） |
| 5 | `src/engine/liuren/sanchuan.ts` | 三传级联调度器：按序尝试①→②→...→⑨ + 中末传推导 |
| 6 | `src/engine/liuren/jiuzongmen/zeke.ts` | ①贼克法：下贼上优先→上克下次选→元首/重审格局 |
| 7 | `src/engine/liuren/jiuzongmen/biyong.ts` | ②比用法：阳干取阳支、阴干取阴支→知一格局 |
| 8 | `src/engine/liuren/jiuzongmen/shehai.ts` | ③涉害法：涉害深度计算（最复杂）、深度相同取先出现者→涉害格局 |
| 9 | `src/engine/liuren/jiuzongmen/yaoke.ts` | ④遥克法：日干遥克上神/上神遥克日干→遥克格局 |
| 10 | `src/engine/liuren/jiuzongmen/maoxing.ts` | ⑤昴星法：阳日/阴日分路径、酉金昴星→昴星格局 |
| 11 | `src/engine/liuren/jiuzongmen/bieze.ts` | ⑥别责法：三课相同检测、阳日合神/阴日三合→别责格局 |
| 12 | `src/engine/liuren/jiuzongmen/bazhuan.ts` | ⑦八专法：干支同位检测、顺数三/逆数三→八专格局 |
| 13 | `src/engine/liuren/jiuzongmen/fuyin.ts` | ⑧伏吟法：刑神链、自刑处理、日马兜底→伏吟格局 |
| 14 | `src/engine/liuren/jiuzongmen/fanyin.ts` | ⑨返吟法：克日干取初传、无克取驿马（兜底法）→返吟格局 |
| 15 | `src/engine/liuren/tianjiang.ts` | 十二天将排布：昼夜贵人查表、顺逆判断、十二将序列布将 |
| 16 | `src/engine/liuren/dungan.ts` | 五子元遁推时干 + 三传天干 + 六亲断（父母/兄弟/妻财/官鬼/子孙） |
| 17 | `src/engine/liuren/shensha.ts` | 神煞收集器：从JSON规则文件读取，支持gan_branch_lookup/ri_zhi_lookup/month_branch_lookup/year_branch_chong/fixed_branch/jiazi_cycle_null等6种规则类型 |
| 18 | `src/engine/liuren/tai-sui-check.ts` | 太岁校验：检查四课三传中是否有太岁 |
| 19 | `src/engine/liuren/shensha-conflict.ts` | 神煞矛盾检测：同地支吉凶并见 |
| 20 | `src/engine/liuren/jieqi-boundary.ts` | 节气边界检测：占时接近节气交接±1天时提醒 |
| 21 | `src/engine/liuren/kongwang-detect.ts` | 空亡检测：日干支所在旬中空亡的两个地支，检查四课三传 |
| 22 | `src/engine/liuren/warnings.ts` | 防误判主入口：综合太岁/神煞矛盾/空亡/节气边界校验 |
| 23 | `src/engine/liuren/index.ts` | 主入口：完整起课流程（13步） + 所有子模块导出 |
| 24 | `tests/engine/liuren/sike.test.ts` | 四课测试：8个用例（生克判定、四课完整性、寄宫正确性） |
| 25 | `tests/engine/liuren/liuren-all.test.ts` | 综合测试：34个用例（九宗门、天将、遁干、六亲、神煞、防误判、集成） |

#### Phase B：AI + 数据层

| # | 文件 | 说明 |
|---|------|------|
| 1 | `src/ai/liuren-prompt-builder.ts` | 六步断课法Prompt构建器：格式化四课/三传/神煞/天地盘为可读文本，System Prompt含断课原则+JSON输出格式 |
| 2 | `src/ai/liuren-call.ts` | AI调用：复用DeepSeek管道，3次重试，JSON响应解析（支持```json```包裹），容错处理 |
| 3 | `src/ai/liuren-fallback.ts` | 离线Fallback解读：基于规则的基础解读（格局吉凶推断、神煞分析、应期推断），AI不可用时自动启用 |
| 4 | `src/hooks/useLiuren.ts` | React Hook：完整起课+AI解读+保存记录流程，含频率限制、输入校验、重复问题检测 |
| 5 | `src/types/index.ts` | 类型扩展：新增 `LiurenPanData` 接口，`DivinationRecord.method` 扩展 `liuren-zhengshi`/`liuren-huoshi`，新增 `liurenPan?`/`interpretation?` 字段 |
| 6 | `src/lib/constants.ts` | 新增 `FEATURE_LIUREN_ENABLED` 功能开关（默认开启，`VITE_FEATURE_LIUREN_ENABLED=false` 关闭） |
| 7 | `src/db/records.ts` | 数据层扩展：`toSupabaseRow`/`fromSupabaseRow` 支持 `liuren_pan`/`interpretation` JSONB字段，新增 `queryByMethod()` |

#### Phase C：UI + 集成

| # | 文件 | 说明 |
|---|------|------|
| 1 | `src/components/liuren/SiKeTable.tsx` | 四课表格：四组上下神 + 生克关系符号（↓/↑/=）+ 颜色编码 |
| 2 | `src/components/liuren/SanChuanTimeline.tsx` | 三传时间线：水平三列（初传/中传/末传）+ 天将、六亲、遁干 |
| 3 | `src/components/liuren/GeJuCard.tsx` | 格局卡片：格局名称 + 吉凶标签 + 描述 + 课式元信息 |
| 4 | `src/components/liuren/ShenShaGrid.tsx` | 神煞网格：按吉/凶/中性分类 + 彩色圆点标记 |
| 5 | `src/components/liuren/WarningStrip.tsx` | 防误判警告条：橙色主题 + ⚠️图标 |
| 6 | `src/components/liuren/LiurenPanTable.tsx` | 天地盘表格：天盘/地盘各12格 |
| 7 | `src/components/liuren/TianJiangBadge.tsx` | 天将徽章：12天将各有独立颜色编码 |
| 8 | `src/components/liuren/ShiZhiPicker.tsx` | 时辰选择器：下拉选单，12时辰 + "自动（当前时辰）"选项 |
| 9 | `src/pages/LiurenView.tsx` | 起课页面：问题输入 + 分类选择 + 时辰选择 + 起课结果展示 + AI解读（含Skeleton加载态）+ 保存记录 |
| 10 | `src/pages/LiurenResultView.tsx` | 结果详情页：课式完整展示（格局/四课/三传/警告/AI解读） |
| 11 | `src/App.tsx` | 路由集成：`/liuren` + `/:id` 路由，React.lazy代码分割 + Suspense + 功能开关包裹 |
| 12 | `src/components/layout/AppShell.tsx` | 底部导航 4→5 项：HOME · DIVINE · **六壬** · HISTORY · STATS |
| 13 | `src/pages/HomeView.tsx` | 首页新增六壬入口卡片："大六壬 · LIU REN" |

#### Phase D：交付与加固

| # | 文件 | 说明 |
|---|------|------|
| 1 | `supabase/migrations/..._add_liuren_fields.sql` | Migration：`ALTER TABLE records ADD COLUMN liuren_pan JSONB, interpretation JSONB` + GIN索引 |
| 2 | `supabase/migrations/..._rollback.sql` | 回滚脚本：DROP COLUMN + DROP INDEX |
| 3 | `src/lib/security.ts` | 安全模块：`validateQuestion`（1-200字/XSS检测）、`validateDateRange`（1900-2100）、`sanitizeForPrompt`（Prompt注入防护）、`checkRateLimit`（前端频率限制，2秒间隔） |
| 4 | `.env.example` | 新增 `VITE_FEATURE_LIUREN_ENABLED` 功能开关文档 |

**验证**：
- TypeScript 编译：✅ 无错误
- 单元测试：✅ 81/81 通过（constants 38 + sike 9 + liuren-all 34）
- Vite 生产构建：✅ 成功（LiurenView 43KB gzip / LiurenResultView 1.6KB gzip 独立分片）
- Git 推送：✅ commit `9847bf4`

**功能入口**：
- 底部导航栏 → "六壬" tab
- 首页 → "大六壬 · LIU REN" 入口卡片
- 直接访问 `/liuren`

---

## 2026-06-18

### ✨ 添加互卦计算、之卦概念、推理重试及 claims 统一

**背景**：用户选取了项目规划中的三个高优先级需求：添加"互卦"计算、添加"之卦"概念、以及改进深度分析的可靠性。

**变更清单**：

| # | 类型 | 文件 | 变更 |
|---|------|------|------|
| 1 | ✨ | `src/engine/casting.ts` | 新增 `calculateMutualHexagram()` — 互卦算法（二三四爻为下卦，三四五爻为上卦） |
| 2 | ✨ | `src/types/index.ts` | `HexagramCalculation` 接口新增 `mutual: number` 字段 |
| 3 | ✨ | `src/hooks/useDivination.ts` | 记录中写入 `mutual: calc.mutual` |
| 4 | ✨ | `src/ai/double-call.ts` | `DoubleCallInput` 新增 `hexagramMutual?` 可选字段 |
| 5 | ✨ | `src/ai/reasoning-call.ts` | `ReasoningInput` 新增 `hexagramMutual?`；默认 `maxRetries=1`（共 2 次尝试） |
| 6 | ✨ | `src/ai/prompt-builder.ts` | System prompt 增加互卦/之卦指引；User prompt 注入互卦信息 |
| 7 | ✨ | `src/components/result/Interpretation.tsx` | 结果页显示互卦名称和上下卦；变卦标签改为"变卦（之卦）" |
| 8 | ✨ | `src/hooks/useAIInterpretation.ts` | 将 `record.hexagram.mutual` 传递给 `runDoubleCall` |
| 9 | 🐛 | `src/lib/schemas.ts` | `aiReasoningSchema` 和 `interpretationResultSchema` 的 claims 最小值从 3 统一为 5 |
| 10 | 🐛 | `src/lib/schemas.ts` | `divinationRecordSchema` 新增 `mutual` 可选字段，修复导出/导入时互卦数据丢失 |

**算法说明**：
- 互卦：取本卦六爻中第 2、3、4 爻组成下卦，第 3、4、5 爻组成上卦，合成新的六爻卦象。反映事物发展的内在因素和隐含条件。
- 之卦（变卦）：本卦中动爻（老阴→少阳、老阳→少阴）变化后形成的卦象。代表事物发展的方向和最终归宿。

**验证**：TypeScript 编译无错误，Vite 生产构建成功（798ms），Git 推送成功（commit ffb67bb）。

### 🐛 修复 schema 中 mutual 字段缺失

**问题**：`divinationRecordSchema` 中 `hexagram` 对象缺少 `mutual` 字段定义。导致导出记录再导入时，互卦数据被 Zod schema 验证静默丢弃。

**修复**：在 `schemas.ts` 的 `hexagram` 对象中新增 `mutual: z.number().int().gte(1).lte(64).optional()`。

**涉及文件**：`src/lib/schemas.ts`

---

## 2026-06-06

### 🐛 Vercel 部署后注册/登录 "Load failed"

**问题**：项目部署到 Vercel 后，注册账号时显示 "Load failed"。

**根因**：`.gitignore` 排除了 `.env` 文件，导致 Supabase URL 和 anon key 未推送到 GitHub。Vercel 构建时读不到 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`，应用 fallback 到 `https://placeholder.supabase.co`，请求自然失败。

**修复**：从 `.gitignore` 中移除 `.env` 条目，将 `.env` 文件纳入版本控制。由于 `.env` 中仅包含 Supabase URL 和 anon key（均为客户端公开值，Vite 会将 `VITE_` 前缀变量打包到前端 JS），不存在安全风险。

**涉及文件**：`.gitignore`、`.env`

---

## 2026-06-06

### 🐛 深度解读按钮不显示

**问题**：结果页默认 AI 解读完成后，"深度分析 (deepseek-v4-pro)" 按钮不出现。

**根因**：`ResultView` 的 AI 触发区域仅在 `progress === 'idle'` 时显示。自动触发默认解读完成后 `progress` 变为 `'done'`，整个触发区域被隐藏，深度分析按钮永远无法出现。

**修复**：将触发区域的显示条件从 `progress === 'idle'` 改为 `progress === 'idle' || progress === 'done'`。解读完成后进度重置为 idle，用户可看到深度分析按钮。

**涉及文件**：`src/pages/ResultView.tsx`

---

## 2026-06-07

### ✨ 前端全面审阅修复（11项）

**背景**：对项目前端进行全面审阅，修复页面逻辑问题和主题一致性问题。

**修复清单**：

| # | 类型 | 文件 | 问题 |
|---|------|------|------|
| 1 | 🐛 | `AppShell.tsx` | 导航栏是死代码，每个页面都有自己的固定导航，AppShell 的导航被覆盖 |
| 2 | 🐛 | `HomeView.tsx` | "准确率 78%" 硬编码，改为占位符 "—" |
| 3 | 🐛 | `HomeView.tsx` | "今日已占 X 次" 显示总数而非今日数，改为过滤今日记录 |
| 4 | 🐛 | `HistoryDetailView.tsx` | `getRecordById` 缺少 `.catch()` 错误处理 |
| 5 | ✨ | `index.css` | 新增 `glass-card-hover`、`step-indicator`、`tag-luxury.active`、`coin` 样式 |
| 6 | ✨ | `AIProgressIndicator.tsx` | 旧浅色主题 → 深色奢华主题 |
| 7 | ✨ | `Interpretation.tsx` | 混用新旧主题 → 统一深色奢华主题 |
| 8 | ✨ | `FeedbackForm.tsx` | 旧浅色主题 → 深色奢华主题 |
| 9 | ✨ | `FeedbackList.tsx` | 旧浅色主题 → 深色奢华主题 |
| 10 | ✨ | `ManualInput.tsx` | 旧浅色主题 → 深色奢华主题 |
| 11 | ✨ | `HexagramBoard.tsx` | 旧浅色主题 → 深色奢华主题 |

**不涉及的变更**：零核心逻辑变更（卜卦引擎、AI 解读、随机逻辑、数据存储完全不变）

**验证**：Vite 构建成功（987ms）。

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
