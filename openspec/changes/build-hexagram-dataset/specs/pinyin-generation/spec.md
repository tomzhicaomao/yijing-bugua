## ADDED Requirements

### Requirement: pypinyin 自动拼音生成

系统 SHALL 使用 pypinyin 库为全部 64 卦卦名生成拼音。

- 拼音 MUST 使用不带声调数字的小写格式（如 qian 而非 qian2 或 qián）
- 拼音 MUST 写入 hexagrams_translated.json 的 namePinyin 字段

#### Scenario: 乾卦拼音

- **WHEN** 卦名为「乾」
- **THEN** namePinyin 为「qian」

#### Scenario: 屯卦拼音

- **WHEN** 卦名为「屯」
- **THEN** namePinyin 为「zhun」（多音字：在此为 zhūn，非 tún）

### Requirement: 多音字人工验证

系统 SHALL 维护已知多音字清单并在生成后提示人工验证。

- 多音字清单 MUST 至少包含：否（pǐ/fǒu）、观（guān/guàn）、渐（jiàn/jiān）、屯（zhūn/tún）、蒙（méng/mēng）、解（xiè/jiě）
- 生成完成后 MUST 输出多音字卦名列表，标注自动选择的拼音，提示人工确认
- 错误拼音 MUST 在 hexagrams.json 中手动修正

#### Scenario: 多音字提示

- **WHEN** 拼音生成完成
- **THEN** 输出「否」卦拼音为 pi（预期应为 pǐ），提示人工确认

#### Scenario: 非多音字不需验证

- **WHEN** 卦名为「乾」
- **THEN** qian 拼音正确，无需人工验证

### Requirement: 拼音格式标准

系统 SHALL 确保拼音符合目标 JSON 格式约定。

- 拼音 MUST 仅包含小写英文字母 a-z
- 拼音 MUST 不包含声调数字或变音符号
- 拼音 MUST 不包含空格或连字符

#### Scenario: 拼音格式验证

- **WHEN** 扫描 hexagrams.json 所有 namePinyin 字段
- **THEN** 所有值匹配正则表达式 `^[a-z]+$`
