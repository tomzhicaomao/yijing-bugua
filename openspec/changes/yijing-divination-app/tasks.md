## 0. 规格修正与实施准备

- [ ] 0.1 锁定 Phase A 的数据 schemaVersion 为 `1`
- [ ] 0.2 明确所有时间字段使用 ISO string 存储，UI 层再转换为 Date 展示
- [ ] 0.3 明确虚拟摇卦必须模拟三枚铜钱概率：6=1/8、7=3/8、8=3/8、9=1/8
- [ ] 0.4 明确六爻数组顺序：第 0 位为初爻，第 5 位为上爻
- [ ] 0.5 建立 64 卦固定映射表，补充乾、坤、屯、蒙、泰、否、既济、未济等已知测试例
- [ ] 0.6 明确动爻取用原则：静卦看卦辞，一动看该爻，多动列全部爻辞并展示变卦，六爻皆动本变并重
- [ ] 0.7 明确 AI promptVersion 初始值与默认模型参数
- [ ] 0.8 做 DeepSeek 浏览器直连最小验证，确认 CORS 与 JSON 输出模式可用

## 1. 项目初始化

- [ ] 1.1 使用 Vite 创建 React 19 + TypeScript 项目
- [ ] 1.2 安装依赖：tailwindcss v4、motion、react-router-dom、sonner（toast）、uuid、zod
- [ ] 1.3 配置 Tailwind CSS v4 与 Vite 集成
- [ ] 1.4 配置 vitest + jsdom 测试环境
- [ ] 1.5 创建基础路由结构（/, /divine, /result/:id, /history, /history/:id, /stats, /settings）
- [ ] 1.6 创建 AppShell 布局组件（导航栏 + 内容区）
- [ ] 1.7 定义 `PROMPT_VERSION`、`SCHEMA_VERSION`、模型名、反馈默认到期天数等常量

## 2. 类型与运行时 Schema

- [ ] 2.1 定义 `LineValue` 类型（6 | 7 | 8 | 9）
- [ ] 2.2 定义 `HexagramData` 接口（卦数据，含卦辞爻辞）
- [ ] 2.3 定义 `InterpretationResult` 接口（AI 推理 JSON 输出，含 claims 和元信息）
- [ ] 2.4 定义 `FeedbackStatus`、`FeedbackDetail`、`ClaimFeedback` 类型
- [ ] 2.5 定义 `DivinationRecord` 接口（schemaVersion、beforeDivination、interpretations[]、feedback.dueAt、duplicate）
- [ ] 2.6 用 zod 或等价方式实现 AI 输出、导入 JSON、DivinationRecord 的运行时校验 schema

## 3. 规则引擎（TDD）

- [ ] 3.1 编写铜钱概率测试：三枚字/背结果 → 背面数 → LineValue，不允许均匀抽 6/7/8/9
- [ ] 3.2 实现 `casting.ts`：crypto.getRandomValues 生成三枚铜钱并映射为 6/7/8/9
- [ ] 3.3 编写起卦计算测试：6 个 LineValue → 本卦编号、变卦编号、动爻位置
- [ ] 3.4 实现固定 64 卦映射表：六线阴阳 → 上下卦组合 → 周易卦序编号
- [ ] 3.5 实现变卦计算（老阴 6 → 阳，老阳 9 → 阴，其余不变）
- [ ] 3.6 实现动爻位置提取（值为 6 或 9 的索引，返回 1-6 爻位）
- [ ] 3.7 编写卦象查询测试：按编号查卦名/卦辞/爻辞，边界情况
- [ ] 3.8 实现 `hexagram-lookup.ts`：从 hexagrams.json 查询卦数据
- [ ] 3.9 实现爻辞检索：静卦/单动爻/多动爻/六爻皆动
- [ ] 3.10 编写一事不二占检查测试
- [ ] 3.11 实现 `duplicate-check.ts`：检查 24 小时内相同分类问题，返回重复次数和相关记录 id

## 4. 古籍数据集

- [ ] 4.1 按 `HexagramData` schema 创建 `src/data/hexagrams.json` 骨架文件（占位数据）
- [ ] 4.2 填入乾卦（䷀，编号 1）完整数据作为示例
- [ ] 4.3 填入用于规则测试的关键卦数据占位（坤、屯、蒙、泰、否、既济、未济）
- [ ] 4.4 待用户提供其余 63 卦原文后填充

## 5. 数据层 IndexedDB（TDD）

- [ ] 5.1 编写 IndexedDB CRUD 测试
- [ ] 5.2 实现 `schema.ts`：数据库初始化、索引创建（id, timestamp, category, feedback.status, feedback.dueAt, schemaVersion）
- [ ] 5.3 实现 `records.ts`：create/update/getById/getAll/queryByCategory/queryPendingDue/queryByPromptVersion 操作
- [ ] 5.4 实现默认反馈到期时间计算（工作/人际/财务/其他 7 天，健康 14 天，可关闭提醒）
- [ ] 5.5 编写 JSON 导出导入测试
- [ ] 5.6 实现 `export-import.ts`：顶层 `{ app, schemaVersion, exportedAt, records }` 导出格式
- [ ] 5.7 实现导入校验、重复 id 跳过、无效记录跳过、未来 schemaVersion 阻止导入

## 6. 起卦页面组件（MVP）

- [ ] 6.1 实现 `QuestionInput.tsx`：问题文本输入 + CategoryPicker 分类选择
- [ ] 6.2 增加占问前记录字段：用户预判、信心 1-5、原本准备采取的行动（可选）
- [ ] 6.3 实现 `MethodToggle.tsx`：虚拟摇卦/手动输入切换
- [ ] 6.4 实现 `ManualInput.tsx`：背面数量选择器（0/1/2/3）、逐爻填入
- [ ] 6.5 实现 `HexagramBoard.tsx`：卦盘从下往上逐爻展示、动爻标记
- [ ] 6.6 实现 `DivineView.tsx`：组合上述组件、一事不二占警告对话
- [ ] 6.7 实现 `useDivination.ts` hook：起卦流程状态管理

## 7. 结果页面与基础保存（无 AI 也可闭环）

- [ ] 7.1 实现规则引擎基础结果展示：本卦/变卦/动爻/卦辞/爻辞
- [ ] 7.2 实现 `Interpretation.tsx`：展示默认/深度 interpretations[]，没有 AI 时显示规则结果
- [ ] 7.3 实现反馈提醒时间设置：默认到期、修改日期、关闭主动提醒
- [ ] 7.4 实现 `ResultView.tsx`：进入结果页即保存基础记录，AI 失败也保留记录
- [ ] 7.5 实现历史详情可回看原问题、占问前预判、卦象、解读和反馈状态

## 8. DeepSeek API 接入

- [ ] 8.1 实现 `deepseek-client.ts`：API 封装（base URL、auth header、JSON 模式、错误处理）
- [ ] 8.2 实现 `prompt-builder.ts`：根据问题、卦象、卦辞爻辞、动爻规则构造推理 prompt
- [ ] 8.3 实现 `reasoning-call.ts`：第一次调用，输出严格 JSON，运行时 schema 校验，失败记录 rawResponse
- [ ] 8.4 实现 `narrative-call.ts`：第二次调用，输入推理 JSON 输出展示文本，失败重试一次
- [ ] 8.5 实现默认解读入口（flash 模型 double-call，写入 interpretations[] type=default）
- [ ] 8.6 实现深度分析入口（pro 模型 double-call，写入 interpretations[] type=deep，不覆盖默认解读）
- [ ] 8.7 实现 API Key 检测与提示（localStorage 读取）
- [ ] 8.8 实现 AI 调用进度指示器（推理中/叙事中/完成/失败回退）

## 9. 虚拟摇卦与动效

- [ ] 9.1 实现 `VirtualCoins.tsx`：CSS 2D 翻转动画、crypto.getRandomValues 模拟三枚铜钱、6 步逐爻流程
- [ ] 9.2 在测试中 stub 随机源，保证虚拟摇卦流程可复现
- [ ] 9.3 优化起卦过程动效与可访问性，避免动画影响信息读取

## 10. 反馈系统组件

- [ ] 10.1 实现 `FeedbackList.tsx`：启动时检查到期待反馈记录（pending 且 dueAt <= now）
- [ ] 10.2 实现极简三按钮（准/不准/还不清楚）+ 状态更新
- [ ] 10.3 实现 "稍后提醒" 操作：更新 dueAt，保持 pending
- [ ] 10.4 实现 `FeedbackDetail.tsx`：实际结果、满意度、耗时、实际行动、AI 是否影响决策、备注
- [ ] 10.5 实现 claims 逐条反馈（命中/未命中/不清楚）
- [ ] 10.6 实现 `useFeedback.ts` hook：反馈状态管理

## 11. 历史记录与统计页面

- [ ] 11.1 实现 `HistoryView.tsx`：按时间倒序列表、按分类筛选
- [ ] 11.2 实现 `HistoryDetailView.tsx`：单条记录详情（含规则结果、原解读内容、反馈详情）
- [ ] 11.3 实现 `StatsView.tsx`：总次数/反馈率/准确率/按类别/趋势
- [ ] 11.4 实现小样本保护：样本不足时不显示百分比结论
- [ ] 11.5 实现模型对比、promptVersion 提示、置信度校准、claims 命中率统计

## 12. 设置页面

- [ ] 12.1 实现 API Key 输入与保存（localStorage）
- [ ] 12.2 实现 JSON 导出按钮
- [ ] 12.3 实现 JSON 导入按钮（文件选择 + schema 校验 + 导入结果提示）
- [ ] 12.4 显示当前 schemaVersion、promptVersion 和数据备份提醒

## 13. 首页

- [ ] 13.1 实现 `HomeView.tsx`：欢迎界面 + [开始起卦] 快捷入口
- [ ] 13.2 首页显示轻量数据概览：总记录数、到期待反馈数、最近一次记录入口

## 14. E2E 测试

- [ ] 14.1 编写 Playwright E2E：手动输入起卦 → 规则结果 → 保存记录流程
- [ ] 14.2 编写 Playwright E2E：完整起卦 → AI 解读失败回退 → 反馈流程
- [ ] 14.3 编写 Playwright E2E：到期待反馈与稍后提醒
- [ ] 14.4 编写 Playwright E2E：导出导入功能

## 15. 部署

- [ ] 15.1 配置 Vite 生产构建
- [ ] 15.2 部署到 Vercel 静态托管
- [ ] 15.3 验证生产环境 IndexedDB、导出导入、API Key 保存正常
- [ ] 15.4 验证生产环境 DeepSeek API 调用；如浏览器直连不可用，记录后端代理需求
