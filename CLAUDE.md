# CLAUDE.md

## Project Overview

易经占卜 + 大六壬 web app — React 19 + TypeScript + Supabase。支持铜钱摇卦和大六壬两种占卜方式。

## Commands

```bash
npm run dev          # dev server :3000
npm run build        # tsc + vite build
npm run test         # vitest unit tests
npx playwright test  # E2E tests
```

## Architecture

```
src/
├── engine/              # 纯算法层（无副作用）
│   ├── hexagram-lookup.ts   # 卦象数据库（64卦完整）
│   └── liuren/              # 大六壬引擎
│       ├── index.ts         # 主入口：calculateLiuren()（含输入验证）
│       ├── types.ts         # 核心类型 + 常量表
│       ├── constants.ts     # 编译时常量矩阵（五行/地支/天干关系的唯一定义）
│       ├── serialize.ts     # LiurenPan ↔ LiurenPanData 序列化/反序列化
│       ├── tiandi-pan.ts    # 天地盘构建
│       ├── sike.ts          # 四课生成
│       ├── sanchuan.ts      # 三传级联调度
│       ├── jiuzongmen/      # 九宗门算法（9个文件）
│       ├── tianjiang.ts     # 十二天将排布
│       ├── dungan.ts        # 五子元遁 + 六亲
│       ├── shensha.ts       # 神煞计算（带 assertBranch 验证）
│       ├── validation.ts    # 防误判检查
│       ├── keGe.ts + keGeDb.ts  # 课格分类（64课名）
│       ├── bifa.ts + bifaRules.ts  # 毕法赋匹配（20条规则）
│       ├── zhanShi.ts       # 占事推断（问题关键词 → 占事类型）
│       ├── tianjiang-meaning.ts  # 天将象义（12天将×8占事）
│       ├── liuqin-analysis.ts    # 六亲分析（8种场景）
│       ├── framework.ts     # 框架层总入口：analyzeFramework()
│       ├── framework-types.ts  # 框架层共享类型（KeGeCategory）
│       ├── kongwang-analysis.ts  # 空亡四级分类
│       ├── yingqi.ts        # 应期推算
│       ├── jieqi.ts         # 节气 + 月将计算
│       ├── kongwang-detect.ts # 空亡检测
│       ├── shensha-conflict.ts # 神煞冲突检测
│       ├── tai-sui-check.ts # 太岁检查
│       └── nian-ming.ts      # 年命计算（虚岁+行年）
├── ai/                  # AI 解读
│   ├── liuren-call.ts       # 大六壬 AI 调用（V1+V2）
│   ├── liuren-prompt-builder.ts  # Prompt 构建器（V1+V2）
│   └── reasoning-call.ts    # 易经 AI prompt
├── db/records.ts        # Supabase CRUD（JSONB 存储）
├── pages/               # 路由页面
├── components/
│   └── liuren/          # 大六壬共享组件
│       ├── SectionLabel.tsx  # 区块标题
│       ├── Collapsible.tsx   # 折叠面板
│       ├── TrendBadge.tsx    # 吉凶标签
│       ├── NianMingPicker.tsx # 年命选择器（天干+地支）
│       └── ...               # LiurenPanTable, SiKeTable 等
├── types/
│   ├── index.ts         # 全局类型定义
│   └── nian-ming.ts     # NianMing/NianMingContext 类型
└── lib/                 # 工具函数
    └── nian-ming-storage.ts # 年命存储（localStorage+Supabase）
```

## Key Patterns

- **数据存储**: Supabase `records` 表，`liuren_pan`、`framework` 为 JSONB 列
- **类型定义**: `types/index.ts` 中 `LiurenPanData` 定义 JSONB schema（与引擎层 `LiurenPan` 类型对应）
- **天地盘类型转换**: 保存时 `serializePan()` 序列化，读取时 `deserializePan()` 反序列化（含运行时验证）
- **AI 解读**: 使用 V2 路径 `callLiurenInterpretationV2()` — 先框架层确定性分析，后 AI 叙事合成
- **占卜方式**: `method` 字段 — `'virtual'`(摇卦) / `'liuren-zhengshi'`(正时) / `'liuren-huoshi'`(活时)
- **路由**: `/liuren/:id` → LiurenResultView, `/liuren/:id/detail` → LiurenDetailView（框架层详情）, `/history/:id` → HistoryDetailView；HistoryView 根据 `method` 字段自动分流（`liuren-*` → `/liuren/:id`，其余 → `/history/:id`）

## Database Migration

**需手动执行的 migration**（在 Supabase Dashboard → SQL Editor 中运行）：

1. `20260630000000_add_liuren_fields.sql` — 添加 `liuren_pan` 和 `interpretation` JSONB 列
2. `20260630010000_alter_method_column.sql` — 扩展 `method` 列 `VARCHAR(10)` → `VARCHAR(20)`
3. `ALTER TABLE records ADD COLUMN IF NOT EXISTS framework JSONB` — 框架层分析结果（2026-07-01 已执行）
4. `20260701000000_add_nianming_to_settings.sql` — user_settings 新增 `nian_ming` JSONB
5. `20260701000001_add_nianming_to_records.sql` — records 新增 `nian_ming` JSONB

## Environment

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — Supabase 连接
- 部署: Vercel（自动从 main 分支构建）
- ⚠️ Vercel 环境变量需手动配置（`vercel env add`），CLI 自动部署不会继承 .env

## Red Lines

- 不要在引擎层 (`engine/`) 引入副作用或外部依赖
- JSONB 字段变更需同步更新 `types/index.ts` 中的 `LiurenPanData` 和 `DivinationRecord.framework`
- Supabase migration 时间戳必须晚于 `20260530000000`（initial schema）
- 框架层 (`framework.ts`) 的 `FrameworkAnalysis` 接口变更需同步更新 `types/index.ts` 的 `framework` 字段
- 引擎层常量（五行关系、地支映射等）统一定义在 `constants.ts`，禁止在其他文件重复定义
- 保存大六壬记录时必须调用 `serializePan()`，读取时调用 `deserializePan()`

## 深入文档

| 文档 | 用途 |
|------|------|
| `docs/CHANGELOG.md` | 完整变更历史 |
| `docs/FIRST-PRINCIPLES-REVIEW.md` | 第一性原理项目审查（问题清单） |
| `docs/FIX-PLAN.md` | 基于审查的 4 阶段修复方案 |
| `docs/ADVERSARIAL-REVIEW-2026-07-01.md` | 对抗性审查报告（28子代理+线上实测，含P0-P3修复优先级） |
| `docs/research/` | 大六壬算法研究报告 |
