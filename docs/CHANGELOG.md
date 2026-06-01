# 项目变更记录

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

## 2026-06-01

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
