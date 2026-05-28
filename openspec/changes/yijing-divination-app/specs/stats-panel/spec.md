## ADDED Requirements

### Requirement: 累计统计概览

系统 SHALL 在统计面板显示累计占卜数据。

显示内容 MUST 包含：
- 总占卜次数
- 已反馈次数及反馈率（%）
- 总体准确率（accurate / (accurate + inaccurate) × 100%，排除 unclear）
- 所有准确率 MUST 同时显示样本数，避免小样本误导
- 当 accurate + inaccurate 少于 5 条时，MUST 显示 "样本不足" 而不是百分比结论

#### Scenario: 基础统计数据

- **WHEN** 用户打开统计面板，存在 50 条记录，其中 40 条已反馈，28 条 accurate、8 条 inaccurate、4 条 unclear
- **THEN** 显示：总次数 50，反馈率 80%（40/50），准确率 77.8%（28/36）

#### Scenario: 无记录

- **WHEN** 用户打开统计面板，没有任何占卜记录
- **THEN** 显示 "暂无数据，开始你的第一次占卜吧"

### Requirement: 按类别统计

系统 SHALL 按问题分类（工作/人际/财务/健康/其他）分别显示准确率。

- 每个类别 MUST 显示：占卜次数、准确率
- 类别按占卜次数降序排列
- 当某类别 accurate + inaccurate 少于 5 条时，MUST 显示样本数和 "样本不足"

#### Scenario: 多类别统计

- **WHEN** 用户有 20 条工作类记录（准确 14/20），10 条人际记录（准确 6/10）
- **THEN** 面板显示各分类的详情

### Requirement: 误判模式分析

系统 SHALL 基于已反馈数据分析并展示可能的误判模式。

模式包括：
- 连续占问情况下的准确率（对比总体平均）
- 深度分析（pro 模型）vs 默认（flash 模型）的准确率对比
- 按时间段的准确率趋势（最近 10 条 vs 全部）
- AI 置信度校准（高/中/低置信度对应的实际反馈结果）
- 可验证判断点命中率（按 trend / condition / timeWindow / advice / answer 分组）
- Prompt 版本差异提示（当样本跨多个 promptVersion 时显示）

#### Scenario: 存在可分析的模式

- **WHEN** 数据库有足够记录（≥ 20 条已反馈）
- **THEN** 面板显示误判模式分析和趋势对比

#### Scenario: 数据不足

- **WHEN** 已反馈记录不足 20 条
- **THEN** 面板隐藏误判分析区域，显示 "再积累一些反馈数据后，这里会显示分析模式"

### Requirement: 模型与 Prompt 版本统计

系统 SHALL 基于 `interpretations[]` 展示模型和 prompt 版本相关的统计提示。

- 默认解读与深度分析 MUST 分开统计
- 当同一记录包含多个 interpretation 时，统计 MUST 按 interpretation 的 `type` 和 `model` 分组
- 当样本来自多个 promptVersion 时，MUST 提示结果不可直接混合比较

#### Scenario: 默认和深度分析都有反馈

- **WHEN** 至少有 20 条已反馈记录同时包含 default 与 deep 解读
- **THEN** 系统展示 default 与 deep 的准确率对比，并显示各自样本数

#### Scenario: Prompt 版本混合

- **WHEN** 统计样本包含多个 promptVersion
- **THEN** 系统显示 "样本包含多个 Prompt 版本，比较结果仅供参考"

### Requirement: 可验证判断点统计

系统 SHALL 基于反馈详情中的 `claimFeedback` 展示判断点命中率。

- 判断点命中率 MUST 按 claim type 分组
- hit / (hit + miss) 少于 5 条时 MUST 显示 "样本不足"

#### Scenario: 存在判断点反馈

- **WHEN** 用户已对 trend、timeWindow、advice 类型 claims 做过反馈
- **THEN** 系统分别展示各类型的命中数、未命中数和样本量
