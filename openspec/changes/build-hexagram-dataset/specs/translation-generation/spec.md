## ADDED Requirements

### Requirement: DeepSeek API 批量翻译

系统 SHALL 使用 DeepSeek API 批量生成全部 64 卦的白话译文。

- 翻译范围 MUST 包括：卦辞、大象辞、每爻的爻辞、每爻的小象辞
- 翻译 MUST 按卦为单位组织，同一卦的所有翻译请求共享彖辞和大象辞作为上下文
- API 调用 MUST 支持重试逻辑（失败后最多 3 次重试，间隔递增）
- 翻译进度 MUST 实时输出到控制台

#### Scenario: 翻译单卦所有内容

- **WHEN** 翻译乾卦
- **THEN** 生成 1 条卦辞译文、1 条大象译文、7 条爻辞译文（含用九）、6 条小象译文

#### Scenario: API 调用失败重试

- **WHEN** DeepSeek API 返回 5xx 错误
- **THEN** 系统等待后重试，最多 3 次，每次间隔递增（1s/2s/4s）

#### Scenario: 单卦重译

- **WHEN** 指定 --hexagram 1 参数运行脚本
- **THEN** 仅翻译乾卦，其他卦保持不变

### Requirement: 学术严谨 Prompt 模板

系统 SHALL 使用固定的学术严谨风格 system prompt 进行翻译。

- System prompt MUST 要求逐字对应原文
- System prompt MUST 要求保留关键哲学术语（元亨利贞、吉凶悔吝、无咎、贞、亨、利）
- System prompt MUST 参照黄寿祺《周易译注》的学术翻译风格
- System prompt MUST 禁止使用现代政治或网络用语
- 每条翻译请求的用户 prompt MUST 包含：彖辞全文、大象全文、待翻译文本、所属位置

#### Scenario: 卦辞翻译上下文

- **WHEN** 翻译乾卦卦辞「乾：元，亨，利，贞。」
- **THEN** 用户 prompt 包含乾卦彖辞全文和乾卦大象全文作为上下文

#### Scenario: 爻辞翻译上下文

- **WHEN** 翻译乾卦初九爻辞「潜龙勿用。」
- **THEN** 用户 prompt 包含乾卦彖辞全文、乾卦大象全文、初九小象「潜龙勿用，阳在下也。」作为上下文

### Requirement: 翻译输出格式

系统 SHALL 将 AI 翻译结果写入 `hexagrams_translated.json`。

- 所有 Modern 字段 MUST 从 null 更新为实际译文
- 译文 MUST 去除 AI 可能附加的【】标注前缀（如有）
- 译文 MUST 保留完整句末标点
- 原古典原文字段 MUST 保持不变

#### Scenario: 译文填入正确字段

- **WHEN** 翻译完成后检查 hexagrams_translated.json
- **THEN** judgmentModern、imageModern、lines[n].modern、lines[n].smallImageModern 均为非 null 的中文文本

#### Scenario: 古典原文未被修改

- **WHEN** 对比 hexagrams_raw.json 和 hexagrams_translated.json 的古典原文字段
- **THEN** judgment、image、lines[n].text、lines[n].smallImage 完全一致

### Requirement: 翻译一致性验证

系统 SHALL 在翻译完成后运行一致性检查。

- MUST 检查所有 hexagrams_translated.json 中无 null 的 Modern 字段
- MUST 检查所有译文字段为非空字符串（长度 > 5）
- MUST 输出检查报告（通过/失败的字段数量）

#### Scenario: 全部翻译完成

- **WHEN** 验证脚本扫描 hexagrams_translated.json
- **THEN** 零个 null Modern 字段，零个空译文字段，报告显示 64 卦全部通过
