# Changelog — 2026-06-29

## 对抗式审查修复（4 个 commit）

### fix: 对抗式审查 Top 6 Critical 修复 (`5d3e97b`)

**C6: Google Fonts 加载**
- `index.html`: 添加 Space Grotesk + Space Mono 的 Google Fonts `<link>` 标签
- 恢复 Nothing Design 排版身份

**C1: .env 凭证暴露**
- `.env` 从 git 追踪中移除
- `.gitignore` 添加 `.env` 和 `.env.*` 规则
- ⚠️ 需手动操作：在 Supabase 仪表板轮换 anon key

**C4: Zod Schema 扩展**
- `schemas.ts`: `methodSchema` 新增 `'liuren-zhengshi'` 和 `'liuren-huoshi'`
- 新增 `liurenPanDataSchema` 定义完整大六壬课式结构
- `divinationRecordSchema` 新增 `liurenPan` 和 `interpretation` 可选字段

**C2: 天将映射修复**
- `tianjiang.ts:83`: `diPan[tianPanIdx]` → `tianPan[tianPanIdx]`
- 所有三传天将现在正确映射到天盘地支

**C5: 涉害深度方向修复**
- `shehai.ts:40`: `KE_MATRIX[candidateWuXing][currentWuXing]` → `KE_MATRIX[currentWuXing][candidateWuXing]`
- 涉害深度现在正确计算"受克"次数

**C3: 提示注入防护**
- `security.ts`: 新增 `wrapUserInput()` 函数，用 `<USER_INPUT>` XML 分隔符包裹用户输入
- `prompt-builder.ts`: 用户问题用 `wrapUserInput()` 隔离
- `liuren-prompt-builder.ts`: 同上 + system prompt 添加安全指令

**大六壬引擎改进**
- `tiandi-pan.ts`: 天地盘偏移量修正（"月将加占时"规则）
- `bazhuan.ts`, `bieze.ts`: 八专/别责中末传正确推导
- `liuren-call.ts`: AI 调用支持 `topic` 参数
- `liuren-fallback.ts`: 回退解读增强

---

### fix: High Priority H1-H4 — AI 管道加固 (`3989b8a`)

**H1: max_tokens 限制**
- `reasoning-call.ts`: `max_tokens: 3000`
- `narrative-call.ts`: `max_tokens: 1500`
- `liuren-call.ts`: `max_tokens: 3000`

**H2: 速率限制**
- `deepseek-client.ts`: 模块级 `lastCallTime` 追踪，3 秒最小调用间隔

**H3: 指数退避重试**
- `deepseek-client.ts`: 新增 `sleep()` 和 `backoffDelay()` 导出函数
- 3 个 call 文件: 重试循环改为 `attempt < maxRetries` + 指数退避 + 随机抖动

**H4: 并发调用锁**
- `useAIInterpretation.ts`: `useRef(false)` 并发锁 + `try/finally` 确保释放

---

### fix: High Priority H5-H12 + Medium 修复 (`f58634d`)

**H5: 过时闭包修复**
- `useDivination.ts`: `setLineValue` 和 `selectManualBack` 改用函数式 `setLines(prev => ...)`
- `castingTimestamp` 从 state 改为 ref，消除闭包依赖
- `currentIndex` 从 state 改为从 lines 派生

**H6: 数据库写入重试**
- `records.ts`: 新增 `withRetry()` 包装器，createRecord/updateRecord 自动重试 2 次

**H7: 触摸目标增至 44px**
- `AppShell.tsx`: 导航链接 `min-h-[44px]` + `flex items-center justify-center`
- 添加 `role="navigation"` + `aria-label` + `aria-current`

**H8: 键盘可访问性**
- `GlassCard.tsx`: 可点击时添加 `role="button"` + `tabIndex={0}` + `onKeyDown`

**H10: 节气 JD 计算改进**
- `jieqi.ts`: 重写 `calcSolarTermJD`，使用 Meeus 简化天文算法 + 二阶修正项

**H11: 月支/月将分离**
- `jieqi.ts`: 新增 `getMonthZhi(date)` 函数
- `index.ts`: `monthZhi = getMonthZhi(date)` 替代 `monthZhi = yueJiang`

**H12: 神煞 derived 类型处理**
- `shensha.ts`: 添加 `derived` case，通过天干合反查逻辑派生天德合/月德合

**九宗门级联修正**
- `sanchuan.ts`: 伏吟检查提前到级联首位（结构条件优先于四课条件）

**Medium 修复**
- `index.css`: 添加 `@media (prefers-reduced-motion: reduce)` 媒体查询
- `records.ts`: `fromSupabaseRow` 从 DB 读取 `schema_version`（不再硬编码 1）

---

### fix: 修复 animation E2E flaky test (`36a0717`)

- `helpers/auth.ts`: `loginAsTestUser` 的 `page.reload()` 后改用 `waitForLoadState('networkidle')`
- `animation.spec.ts`: GSAP 测试在 `page.goto` 后加 `waitForLoadState('networkidle')`

---

## 测试结果

| 测试类型 | 结果 |
|----------|------|
| TypeScript 编译 | ✅ 零错误 |
| 单元测试 (Vitest) | ✅ 291/291 通过 |
| E2E 测试 (Playwright) | ✅ 76/76 通过 |

## 统计

- **修改文件**: 20+ 个源文件 + 2 个测试文件
- **新增代码**: ~500 行
- **删除代码**: ~100 行
- **修复问题**: 19 项 Critical/High + 3 项 Medium

---

## Round 2 审查修复 (`342c388`)

**setStep('result') 回归修复**
- `useLiuren.ts`: 恢复 `setStep('result')` 调用（在 `autoSaveAndNavigate` 之前）
- 修复结果页不可达的关键回归

**isNearBoundary 误判修复**
- `index.ts:153`: `if (isNearBoundary)` → `if (isNearBoundary.isNear)`
- 对象永远 truthy，导致每条记录都显示虚假的节气边界警告

---

## Liuren 保存失败修复 (`823b962`)

**问题**: 大六壬占卜完成后"正在保存记录"持续很久，记录未保存到 history。

**根因**: `toSupabaseRow` 总是发送 `liuren_pan` 和 `interpretation` 字段，但初始 schema 没有这两列（需要 migration `20250101000000` 添加）。migration 未执行时，整条 INSERT 失败，基础字段也无法保存。

**修复**:
- `records.ts`: `toSupabaseRow` 改为条件包含——只有当 `liurenPan`/`interpretation` 有值时才加入 INSERT
- `useLiuren.ts`: `autoSaveAndNavigate` 添加 `console.error` 便于调试
