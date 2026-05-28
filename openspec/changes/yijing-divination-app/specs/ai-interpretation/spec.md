## ADDED Requirements

### Requirement: Double-Call 推理流程

系统 SHALL 采用两次 DeepSeek API 调用架构生成解读。

**第一次调用（结构化推理）**：输入用户问题 + 卦象数据 + 卦辞爻辞，输出严格 JSON。
**第二次调用（受控叙事）**：输入第一次 JSON 结果 + 用户问题，输出四段展示文本。

- 默认使用 `deepseek-v4-flash` 模型
- 用户可手动触发 `deepseek-v4-pro` 深度分析
- 每次调用 MUST 记录 `model`、`promptVersion`、`temperature`、调用类型和原始响应
- 浏览器直连 API MUST 在实现早期做连通性验证；若 CORS 或网络限制导致不可用，系统 MUST 回退到规则引擎基础结果

#### Scenario: 正常两次调用完成

- **WHEN** 用户完成起卦进入结果页
- **THEN** 系统依次执行推理调用和叙事调用，最终显示结构化解读

#### Scenario: 第二次调用失败自动重试

- **WHEN** 第一次调用成功但第二次调用网络错误
- **THEN** 系统自动重试第二次调用一次，若仍然失败则回退显示第一次 JSON 结果

#### Scenario: API Key 未配置

- **WHEN** localStorage 中无 DeepSeek API Key
- **THEN** 系统提示用户在设置页面配置 API Key，不发起 API 调用，直接显示规则引擎基础结果

### Requirement: 结构化推理输出格式

第一次调用的输出 MUST 为严格 JSON 对象：

```json
{
  "trend": "利" | "不利" | "中性",
  "analysis": "基于卦象的分析",
  "conditions": ["关键条件1", "关键条件2"],
  "timeWindow": "时间窗口描述",
  "answer": "综合判断结论",
  "confidence": "高" | "中" | "低",
  "claims": [
    {
      "id": "trend-1",
      "type": "trend" | "condition" | "timeWindow" | "advice" | "answer",
      "text": "可在事后验证的一条判断"
    }
  ]
}
```

- System prompt MUST 约束模型只输出 JSON，不输出其他文本
- 如 API 支持，调用 MUST 使用 JSON 输出模式
- 解析后 MUST 通过运行时 schema 校验；只 `JSON.parse` 成功不算符合 schema
- 解析或校验失败时 MUST 有错误处理
- `claims` MUST 至少包含 3 条，且覆盖趋势、条件或时间窗口中的至少两类

#### Scenario: 模型返回有效 JSON

- **WHEN** 第一次调用返回符合 schema 的 JSON
- **THEN** 系统解析并传递给第二次调用

#### Scenario: 模型返回无效 JSON

- **WHEN** 第一次调用返回的文本无法解析为符合 schema 的 JSON
- **THEN** 系统显示错误提示 "AI 推理失败，请重试"，保存规则引擎基础结果，并将原始响应存入该次失败日志

#### Scenario: 模型返回字段缺失 JSON

- **WHEN** 第一次调用返回可解析 JSON 但缺少 `claims` 或 `confidence`
- **THEN** 系统视为 schema 校验失败，并回退显示规则引擎基础结果

### Requirement: 受控叙事结构化展示

第二次调用的输出 MUST 包含以下结构：

- **【趋势判断】**：利 / 不利 / 中性，简述理由
- **【核心条件】**：列出影响结果的关键因素
- **【时间窗口与建议】**：预估时间范围 + 行动建议
- **【综合判断】**：明确的结论

#### Scenario: 结构化解读正常展示

- **WHEN** 第二次调用返回完整解读内容
- **THEN** 结果页按趋势判断、核心条件、时间窗口与建议、综合判断分区域展示

### Requirement: 内容约束

解读内容 MUST 遵守以下约束：

- 禁止使用 "天意"、"命中注定"、"吉人天相"、"大吉大利" 等空洞表述
- MUST 引用卦辞/爻辞原文出处（格式：卦名 + 原文）
- 综合判断 MUST 明确，不含混

#### Scenario: 解读内容符合约束

- **WHEN** 第二次调用返回解读文本
- **THEN** 文本 MUST 引用卦辞或爻辞原文出处
- **AND** 文本 MUST 不包含禁用空洞表述
- **AND** 综合判断 MUST 给出明确倾向

### Requirement: 深度分析模式

系统 SHALL 允许用户点击 "深度分析" 按钮，使用 `deepseek-v4-pro` 模型重新执行 double-call。

- 结果 MUST 独立展示，不覆盖默认解读
- MUST 显示模型名称标记
- 深度分析结果 MUST 追加到 `interpretations[]`，并标记 `type: 'deep'`

#### Scenario: 用户触发深度分析

- **WHEN** 用户在结果页点击 "深度分析"
- **THEN** 系统使用 pro 模型重新执行两次调用，结果追加展示在默认解读下方

### Requirement: Prompt 版本追踪

系统 SHALL 为每次 AI 解读保存 prompt 版本。

- 默认解读和深度分析 MUST 分别记录 `promptVersion`
- 修改 prompt 后 MUST 更新版本号
- 统计面板 MUST 能按 promptVersion 过滤或至少显示样本来自多个版本的提示

#### Scenario: 保存默认解读

- **WHEN** 默认模型生成解读成功
- **THEN** 保存的 interpretation MUST 包含 `type: 'default'`、`model`、`promptVersion`、`temperature`

#### Scenario: Prompt 版本发生变化

- **WHEN** 新版本 prompt 生成解读
- **THEN** 新记录保存新的 `promptVersion`，历史记录保持原版本不变
