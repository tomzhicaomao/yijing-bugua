# UI Redesign - 高端典雅风格实施计划

## 设计方向

**风格**: 高端典雅 (Luxury Elegant)
- 深色背景: #0a0a0a (obsidian)
- 金色点缀: #d4a843 (gold)
- 玻璃拟态: 半透明卡片 + 模糊效果
- 极细线条: 1px 分割线
- 大量留白: 克制的布局

## 实施阶段

### 阶段 1: 基础设施 (1 天)

- [x] 1.1 安装 Framer Motion 动画库
- [x] 1.2 更新 Tailwind 配置 (添加 luxury 配色)
- [x] 1.3 创建设计令牌 (Design Tokens)
- [x] 1.4 创建基础 CSS 样式

### 阶段 2: 核心组件 (2 天)

- [x] 2.1 创建 GlassCard 组件
- [x] 2.2 创建 Button 组件 (gold/ghost variants)
- [x] 2.3 创建 Tag 组件 (tag-luxury)
- [x] 2.4 创建 Input 组件 (input-luxury)
- [x] 2.5 创建 StepIndicator 组件
- [x] 2.6 创建 Coin 组件 (带翻转动画)

### 阶段 3: 页面重设计 (3-4 天)

- [x] 3.1 重写 HomeView (首页)
- [x] 3.2 重写 DivineView (起卦页面)
- [x] 3.3 重写 ResultView (结果页面)
- [x] 3.4 重写 HistoryView (历史列表)
- [x] 3.5 重写 HistoryDetailView (历史详情)
- [x] 3.6 重写 StatsView (统计页面)
- [x] 3.7 重写 SettingsView (设置页面)
- [x] 3.8 重写 Login/Register (登录/注册)

### 阶段 4: 动画与优化 (1-2 天)

- [x] 4.1 添加页面过渡动画
- [x] 4.2 添加微交互动画
- [x] 4.3 优化移动端响应式
- [x] 4.4 性能优化

## 技术栈

| 组件 | 选择 | 说明 |
|------|------|------|
| 动画 | Framer Motion | 流畅的页面过渡和微交互 |
| 样式 | Tailwind CSS | 原子化 CSS 框架 |
| 状态 | React Context | 简单状态管理 |
| 路由 | React Router | 页面导航 |

## 关键文件

```
src/
├── components/
│   ├── ui/
│   │   ├── GlassCard.tsx
│   │   ├── Button.tsx
│   │   ├── Tag.tsx
│   │   ├── Input.tsx
│   │   └── StepIndicator.tsx
│   └── casting/
│       └── Coin.tsx
├── styles/
│   └── globals.css (更新)
├── pages/
│   ├── HomeView.tsx (重写)
│   ├── DivineView.tsx (重写)
│   ├── ResultView.tsx (重写)
│   ├── HistoryView.tsx (重写)
│   ├── HistoryDetailView.tsx (重写)
│   ├── StatsView.tsx (重写)
│   └── SettingsView.tsx (重写)
└── auth/
    ├── Login.tsx (重写)
    └── Register.tsx (重写)
```

## 验收标准

1. 所有页面在移动端（375px）和桌面端（1440px）都能正常显示
2. 关键操作有流畅的动画过渡
3. 视觉风格统一且符合"高端典雅"定位
4. 可访问性符合 WCAG 2.1 AA 标准
5. 性能指标：LCP < 2.5s, FID < 100ms

## 预计时间

**总计: 7-9 天**

- 阶段 1: 1 天
- 阶段 2: 2 天
- 阶段 3: 3-4 天
- 阶段 4: 1-2 天
