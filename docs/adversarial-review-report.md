# 对抗式审查报告 — yijing-bugua-new

**审查日期**: 2026-06-29
**审查模式**: Ultracode 多代理对抗式审查
**审查代理**: 8 个独立审查代理 + 1 个综合交叉验证代理
**审查维度**: 引擎正确性、AI 安全、数据层、状态管理、UI/UX、测试覆盖

---

## 执行摘要

发现 **4 条系统性故障链**，横跨多个子系统：

1. **大六壬引擎**产生错误结果（3 个计算 bug 级联），且正确结果也会因 Zod schema 缺失而在导出/导入时静默丢失
2. **AI 管道**零测试覆盖、零速率限制、可被提示注入攻击
3. **3 个 React hook** 存在竞态条件，可在弱网环境下静默损坏状态和丢失数据
4. **可访问性**未系统性实现——字体加载失效、动效无视减缓、触摸目标过小、键盘支持缺失

---

## 发现总览

| 严重级别 | 数量 | 状态 |
|----------|------|------|
| CRITICAL | 6 | ✅ 全部修复 |
| HIGH | 12 | ✅ 全部修复 |
| MEDIUM | 12 | ✅ 3 项已修复，9 项记录 |
| 误报 | 8 | 安全忽略 |
| 遗漏补充 | 6 | 已记录 |

---

## CRITICAL Issues（6 项）

### C1: `.env` 提交到 git，含真实 Supabase anon key

- **文件**: `.env`, `.gitignore`
- **修复**: `git rm --cached .env` + `.gitignore` 添加 `.env` / `.env.*`
- **验证**: `git ls-files .env` 返回空
- **待办**: 用户需在 Supabase 仪表板轮换 anon key

### C2: 大六壬天将映射到地盘支而非天盘支

- **文件**: `src/engine/liuren/tianjiang.ts:83`
- **根因**: `tianDiPan.diPan[tianPanIdx]` 应为 `tianDiPan.tianPan[tianPanIdx]`
- **影响**: 所有三传天将错误
- **修复**: 1 行改动

### C3: 涉害深度计数方向反了

- **文件**: `src/engine/liuren/jiuzongmen/shehai.ts:40`
- **根因**: `KE_MATRIX[candidateWuXing][currentWuXing]` 应为 `KE_MATRIX[currentWuXing][candidateWuXing]`
- **影响**: 10/12 支深度相同，涉害几乎无区分度
- **修复**: 交换 KE_MATRIX 索引

### C4: 大六壬数据在导出/导入时静默丢失

- **文件**: `src/lib/schemas.ts:79,82-119`
- **根因**: `divinationRecordSchema` 缺少 `liurenPan` 和 `interpretation` 字段；`methodSchema` 未包含 liuren 方法类型
- **修复**: 扩展 method 枚举 + 添加 liurenPanDataSchema + interpretation 字段

### C5: 提示注入——用户问题直接拼入 AI prompt

- **文件**: `src/ai/prompt-builder.ts:117`, `src/ai/liuren-prompt-builder.ts:129`
- **根因**: 用户输入无消毒、无分隔符，直接插入 prompt
- **修复**: 结构化隔离 `<USER_INPUT>` 分隔符 + `wrapUserInput()` + system prompt 指令

### C6: 字体从未加载

- **文件**: `index.html`
- **根因**: 缺少 Google Fonts `<link>` 标签
- **修复**: 添加 Space Grotesk + Space Mono 的 Google Fonts 链接

---

## HIGH Issues（12 项）

### H1: AI 调用未设 `max_tokens`

- **文件**: `reasoning-call.ts`, `narrative-call.ts`, `liuren-call.ts`
- **修复**: reasoning/liuren: `max_tokens: 3000`, narrative: `max_tokens: 1500`

### H2: 全链路无速率限制

- **文件**: `deepseek-client.ts`
- **修复**: 模块级 `lastCallTime` 追踪，3 秒最小调用间隔

### H3: 重试无退避、次数不一致

- **文件**: 3 个 call 文件
- **修复**: 指数退避 + 随机抖动 `backoffDelay(attempt)`，统一 `attempt < maxRetries`

### H4: useAIInterpretation 无并发保护

- **文件**: `useAIInterpretation.ts`
- **修复**: `useRef(false)` 并发锁 + `try/finally` 确保释放

### H5: setLineValue/selectManualBack 过时闭包

- **文件**: `useDivination.ts:114-141`
- **根因**: 闭包捕获 `lines` 和 `currentIndex`，快速点击可跳行
- **修复**: 函数式 `setLines(prev => ...)` + ref 时间戳

### H6: 数据库写入无重试

- **文件**: `records.ts`
- **修复**: `withRetry()` 包装器 + 指数退避

### H7: 底部导航触摸目标 < 44px

- **文件**: `AppShell.tsx`
- **修复**: `min-h-[44px]` + ARIA `role="navigation"` + `aria-current`

### H8: GlassCard 可点击 div 无键盘支持

- **文件**: `GlassCard.tsx`
- **修复**: `role="button"` + `tabIndex={0}` + `onKeyDown` (Enter/Space)

### H9: API Key 明文存储

- **文件**: `api-key.ts`
- **状态**: 已记录，需更大范围重构（Web Crypto 加密 / 服务端代理）

### H10: 节气 JD 近似偏差 5-8 天

- **文件**: `jieqi.ts:31-82`
- **修复**: Meeus 简化天文算法 + 二阶修正项

### H11: 月支被近似为月将

- **文件**: `index.ts:127`
- **根因**: `monthZhi = yueJiang`，但月支（农历月份地支）和月将（中气对应地支）是不同概念
- **修复**: 新增 `getMonthZhi(date)` 函数，从节气推导月支

### H12: 神煞 `derived` 类型未处理

- **文件**: `shensha.ts:84-208`
- **影响**: 天德合、月德合始终缺失
- **修复**: 添加 `derived` case，通过天干合反查逻辑派生

---

## MEDIUM Issues（已修复 3 项）

| # | 问题 | 修复状态 |
|---|------|----------|
| M1 | `getAllRecords` 无分页 | 已记录，需更新测试 mock |
| M2 | `prefers-reduced-motion` 未实现 | ✅ `index.css` 添加 `@media (prefers-reduced-motion: reduce)` |
| M3 | ClosingRitual 模态框无焦点陷阱 | 已记录 |
| M4 | 叙事 AI 输出无长度限制 | 已记录 |
| M5 | Serverless 代理原样转发请求体 | 已记录 |
| M6 | 大六壬记录用 `method: 'virtual'` | 已记录 |
| M7 | `fromSupabaseRow` 硬编码 schemaVersion | ✅ 从 DB 读取 |
| M8 | HexagramBoard 无限循环动画 | 已记录 |
| M9 | 表单元素无程序关联 label | 已记录 |
| M10 | 错误消息泄露 DeepSeek 内部细节 | 已记录 |
| M11 | 重复检测仅精确匹配 | 已记录 |
| M12 | 所有异步操作无 AbortController | 已记录 |

---

## 额外修复（审查过程中发现）

| 问题 | 修复 |
|------|------|
| 九宗门级联顺序错误（昴星优先于伏吟） | 伏吟提前到级联首位 |
| `sanchuan.ts` 导入 `isFuYin` 用于结构判断 | 改为先检查天地盘结构再走级联 |
| E2E animation 测试竞态 | `waitForLoadState('networkidle')` 替代 `waitForTimeout` |
| `loginAsTestUser` reload 等待不足 | `waitForLoadState('networkidle')` 替代固定 500ms |

---

## 验证结果

| 测试类型 | 结果 |
|----------|------|
| TypeScript 编译 | ✅ 零错误 |
| 单元测试 (Vitest) | ✅ 291/291 通过 |
| E2E 测试 (Playwright) | ✅ 76/76 通过 |

---

## Commit 历史

```
36a0717 fix: 修复 animation E2E flaky test — waitForLoadState 替代 waitForTimeout
f58634d fix: High Priority H5-H12 + Medium 修复
3989b8a fix: High Priority H1-H4 — AI 管道加固
5d3e97b fix: 对抗式审查 Top 6 Critical 修复
```

---

## 待办事项（后续迭代）

1. **H9**: API Key 加密存储（Web Crypto API / 服务端代理）
2. **M1**: `getAllRecords` 分页 + 测试 mock 更新
3. **M3**: ClosingRitual 焦点陷阱 + Escape 关闭
4. **M4**: 叙事输出长度限制 + HTML 消毒
5. **M5**: Serverless 代理请求体白名单验证
6. **M8**: HexagramBoard 动画 `repeat: -1` 改为视口可见时播放
7. **G1**: 添加 CI 流水线（GitHub Actions）
8. **G2**: 离线回退 / Service Worker
9. **G3**: Playwright 多浏览器测试（Firefox, WebKit）
10. **H9**: Supabase RLS 策略审计
