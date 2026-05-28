## Why

市面上现有的 AI 易经工具大多只是"起卦算法 + 大模型解释"，缺少三个关键能力：严格遵循传统规则的卦象引擎、长期现实结果追踪反馈、基于个人数据的统计验证。这个项目将《易经》作为一个可持续学习、能被验证的个人决策辅助系统，以周易古占为起点，建立规则引擎 + AI 解读 + 实验数据验证三层架构，并把每次占问沉淀为可复盘的个人决策记录。

## What Changes

- 新建完整的 React Web 应用（纯前端），提供铜钱起卦、卦象计算、AI 结构化解读、结果反馈追踪、个人统计分析
- 实现不可学习的卦象计算规则引擎（本卦/变卦/动爻）
- 集成 DeepSeek API，采用 double-call 架构（结构化推理 → 受控叙事），保存 prompt/model 元信息和可验证判断点
- 实现 IndexedDB 本地数据层，记录占卜全生命周期（占问前预判→问题→卦象→解读→行动→反馈→统计）
- 一事不二占检查（宽松模式）
- 支持虚拟在线摇卦（crypto.getRandomValues 模拟三枚铜钱概率 + CSS 动画）和手动输入铜钱结果

## Capabilities

### New Capabilities

- `divination-casting`: 铜钱起卦流程，支持虚拟摇卦和手动输入两种方式，从下往上逐爻揭晓，计算本卦/变卦/动爻
- `hexagram-engine`: 不可学习的卦象计算规则引擎，64 卦数据查询，卦辞爻辞检索
- `ai-interpretation`: DeepSeek double-call 解读（结构化推理 + 受控叙事），四段输出格式（趋势判断/核心条件/时间窗口与建议/综合判断）
- `feedback-system`: 到期待反馈列表提示，极简三按钮反馈（准/不准/还不清楚）+ 稍后提醒 + 可展开详细记录
- `data-storage`: IndexedDB 本地存储，带 schemaVersion 的 JSON 导出/导入，占卜记录全生命周期管理
- `stats-panel`: 个人统计分析面板，按类别/时间/准确率/模型版本/判断点命中率展示，累计数据趋势

### Modified Capabilities

<!-- No existing capabilities to modify — greenfield project -->

## Impact

- 技术栈：React 19 + TypeScript + Vite + Tailwind CSS v4 + motion
- 外部依赖：DeepSeek API（deepseek-v4-flash / deepseek-v4-pro）
- 存储：浏览器 IndexedDB + localStorage（API Key）
- 部署：Vercel / Netlify 静态托管
- Phase B 预留：六爻纳甲扩展接口
