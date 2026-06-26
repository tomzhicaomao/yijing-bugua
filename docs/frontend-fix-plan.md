# 前端显示问题修复计划

> 分析日期: 2026-06-26  
> 范围: 所有 .tsx 页面/组件 + index.css  
> TypeScript 编译: 通过 ✓

---

## 问题清单总览

经过完整的静态代码分析，共发现 **4 类 12 个问题**。

---

## 🔴 P0 — 页面结构错位 (严重影响渲染)

### P0-1: spacer + bottom-nav 在 main 标签外部 — 5 个文件

**根因**: 缩排错误导致 `<div className="h-16" />` 和 `<nav className="fixed bottom-0...">` 脱离 `<main>` 容器，产生 JSX 结构错位。

**影响文件**:

| 文件 | 行号 | 错误 |
|------|------|------|
| `src/pages/ResultView.tsx` | 185–186 | `h-16` 在 `</main>` 外侧 |
| `src/pages/HistoryView.tsx` | 115–116 | `h-16` + bottom-nav 在 `</main>` 外侧 |
| `src/pages/StatsView.tsx` | 98–111 | `h-16` + bottom-nav 在 `</main>` 外侧 (空记录分支) |
| `src/pages/SettingsView.tsx` | 151–165 | `h-16` + bottom-nav 在 `</main>` 外侧 |
| `src/pages/HistoryDetailView.tsx` | 121–133 | `h-16` + bottom-nav 在 `</main>` 外侧 |

**修复**: 将 spacer 和 bottom-nav 移入各自的 `<main>` 内部。

**现状** (以 ResultView 为例):
```
    </div>        <!-- content wrapper 结束 -->
      <div className="h-16" />   ← 错：在 main 外面！
</main>

<nav className="fixed ...">      ← 错：孤立在根 div 下
```

**修复后**:
```
    </div>        <!-- content wrapper 结束 -->
    <div className="h-16" />
</main>

<nav className="fixed ...">
```

---

## 🟡 P1 — 布局重复与不一致

### P1-1: 每个页面独立复制 bottom-nav

**根因**: 底部导航在 6 个页面中各复制了一份，风格和内容不完全统一。

| 文件 | 差异 |
|------|------|
| HomeView | 当前页显示 `[ HOME ]` |
| DivineView | 当前页无特殊标记 |
| ResultView | 当前页无特殊标记 |
| HistoryView | 当前页无特殊标记 |
| StatsView | 当前页无特殊标记 |
| SettingsView | 当前页无特殊标记 |

**修复**: 将 bottom-nav 提取到 `AppShell.tsx`，通过 `useLocation` 自动高亮当前页。

### P1-2: Top-Nav 风格不统一 — 6 个页面 3 种风格

| 文件 | Top-Nav 风格 |
|------|-------------|
| HomeView | 非 fixed, `h-16` |
| DivineView | 非 fixed, `h-14` |
| ResultView | `fixed top-0 z-50`, `h-16` |
| HistoryView | `fixed top-0 z-50`, `h-16` |
| StatsView | `fixed top-0 z-50`, `h-16` |
| SettingsView | `fixed top-0 z-50`, `h-16` |

**修复**: 统一为非 fixed 的 `h-14` (与 DivineView 一致，简洁风格)，或统一为 fixed。推荐统一为非 fixed，与 HomeView/DivineView 保持一致。

### P1-3: 底部 spacer 高度不统一

| 文件 | 底部 spacer |
|------|------------|
| HomeView | `.h-20` |
| DivineView | `.h-20` (line 278) |
| HistoryView | `.h-16` |
| StatsView | `.h-16` |
| SettingsView | `.h-16` |
| ResultView | `.h-16` |
| HistoryDetailView | `.h-16` |

**修复**: 统一使用 `.h-20` (因为 bottom-nav ≈ 48px + 16px padding ≈ 64px，h-20 = 80px 才有足够间距)。

---

## 🟠 P2 — 按钮与交互问题

### P2-1: DivineView Step 2 按钮宽度不对称

**文件**: `src/pages/DivineView.tsx` line 166–173

```tsx
// 问题: "跳过" 按钮没有 flex-1
<div className="flex gap-3">
  <Button onClick={...} className="flex-1">保存并继续</Button>
  <Button variant="ghost" onClick={...}>
    跳过
  </Button>
</div>
```

**修复**: 给 "跳过" 按钮添加 `flex-1`。

### P2-2: VirtualCoins — fixed 按钮可能与 bottom-nav 层叠冲突

**文件**: `src/components/casting/VirtualCoins.tsx` line 145

```tsx
<div className="fixed bottom-16 left-0 right-0 z-40 px-6 pb-3">
```

`bottom-16` 位置 + bottom-nav (`fixed bottom-0`) 可能产生间距过大或重叠。

**修复**: 不使用 fixed 定位，改为自然文档流中的按钮，让按钮随内容自然流动。

### P2-3: FeedbackForm 按钮使用了不正确颜色

**文件**: `src/components/feedback/FeedbackForm.tsx` line 81–83

```tsx
// "准" 按钮使用 bg-green-700 (硬编码，不来自设计系统)
// "不准" 使用 bg-nothing-accent (设计系统)
// "不清楚" 使用 bg-nothing-text-secondary (语义不当)
<button className="... bg-green-700 ...">准</button>
<button className="... bg-nothing-accent ...">不准</button>
<button className="... bg-nothing-text-secondary ...">不清楚</button>
```

**修复**: 统一来自 `nothing-*` 设计 token。

---

## 🔵 P3 — CSS 与样式问题

### P3-1: `#root` 使用了无效 CSS 属性

**文件**: `src/index.css` line 55

```css
#root {
  min-h-screen: 100svh;   /* 无效！应该是 min-height */
}
```

**修复**: 改为 `min-height: 100svh;`

### P3-2: 未使用的 HTML 容器导致空白

**根因**: `<main>` 内部的最外层 wrapper `<div>` 可能在内容不足时造成大量空白，因为没有 flex grow。

**影响文件**: ResultView, HistoryView, StatsView, SettingsView, HistoryDetailView

**修复**: 确保页面的直接子元素占满可用高度——给 main 内的 wrapper 添加 `min-h-full`。

---

## 修复方案

### 推荐方案：渐进式修复

按 P0 → P1 → P2 → P3 顺序逐文件修复，每步验证。

**完整文件变更清单**:

```
P0 — 结构错位 (5 files):
  src/pages/ResultView.tsx
  src/pages/HistoryView.tsx
  src/pages/StatsView.tsx
  src/pages/SettingsView.tsx
  src/pages/HistoryDetailView.tsx

P1 — 布局统一 (2-3 files):
  src/components/layout/AppShell.tsx  — 提取 bottom-nav
  src/pages/HomeView.tsx              — 删除页面内 bottom-nav
  src/pages/DivineView.tsx            — 删除页面内 bottom-nav
  (ResultView/HistoryView/StatsView/SettingsView 同)

P2 — 按钮问题 (3 files):
  src/pages/DivineView.tsx                      — 按钮宽度对称
  src/components/casting/VirtualCoins.tsx        — 按钮定位
  src/components/feedback/FeedbackForm.tsx       — 颜色统一

P3 — CSS 问题 (1 file):
  src/index.css                                  — 修复 #root 属性
```

---

## 验证方法

1. `npx tsc --noEmit` — TypeScript 类型检查 ✓
2. `npm run build` — 构建验证
3. Playwright E2E 测试: `npx playwright test`
4. 手动验证每个页面的视觉效果

---

## 预计工作量

| 优先级 | 文件数 | 预计时间 |
|--------|--------|----------|
| P0 | 5 | 15 min |
| P1 | 4-5 | 30 min |
| P2 | 3 | 15 min |
| P3 | 1 | 5 min |
| **总计** | **~14** | **~65 min** |
