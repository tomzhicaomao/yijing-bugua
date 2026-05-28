## ADDED Requirements

### Requirement: 打开应用时显示到期待反馈列表

系统 SHALL 在应用启动时检查所有 `status: 'pending'` 且 `feedback.dueAt <= now` 的占卜记录，如有到期待反馈项，显示待反馈列表。

- 待反馈列表 MUST 按时间倒序排列（最新的在前）
- 列表 MUST 以覆盖层或首页卡片形式展示
- 未到期的 pending 记录 MUST 不主动展示
- 无到期待反馈项时 MUST 直接进入首页，不显示反馈界面

#### Scenario: 有待反馈项

- **WHEN** 用户打开应用，存在 3 条状态为 pending 且 dueAt 已到期的占卜记录
- **THEN** 系统展示包含这 3 条记录的待反馈列表

#### Scenario: 无待反馈项

- **WHEN** 用户打开应用，没有到期的 pending 状态记录
- **THEN** 直接显示首页，不弹出反馈界面

#### Scenario: 存在未到期待反馈项

- **WHEN** 用户打开应用，存在 status 为 pending 但 dueAt 在未来的记录
- **THEN** 系统不展示该记录的反馈提示

### Requirement: 极简反馈三按钮

每条待反馈项 MUST 显示三个按钮：准 / 不准 / 还不清楚，并提供 "稍后提醒" 操作。

- 点击任一按钮 MUST 立即更新该记录的状态（accurate / inaccurate / unclear）
- 点击后 MUST 关闭该条反馈，自动显示下一条（如有）
- 点击 "稍后提醒" MUST 更新 `feedback.dueAt`，但保持 `status: 'pending'`
- 操作 MUST 在 0.5 秒内完成

#### Scenario: 用户点击 "准"

- **WHEN** 用户对一条待反馈项点击 "准"
- **THEN** 该记录状态变为 accurate，如还有待反馈项则显示下一条

#### Scenario: 用户点击 "不准"

- **WHEN** 用户对一条待反馈项点击 "不准"
- **THEN** 该记录状态变为 inaccurate，如还有待反馈项则显示下一条

#### Scenario: 用户点击 "稍后提醒"

- **WHEN** 用户对一条待反馈项点击 "稍后提醒"
- **THEN** 该记录状态保持 pending，`feedback.dueAt` 更新为未来时间，如还有待反馈项则显示下一条

### Requirement: 可展开详细记录

每条反馈项 MUST 支持展开详细反馈表单，但不强制填写。

展开后的详细字段：
- 实际结果描述（文本输入）
- 结果满意度（1-5 滑块）
- 实际耗时（天数输入）
- 实际采取的行动（文本输入）
- AI 是否影响决策（是/否）
- 自由备注（文本输入）
- 可验证判断点逐条反馈（命中/未命中/不清楚）

#### Scenario: 用户展开并填写详细记录

- **WHEN** 用户展开详细记录区并填写满意度为 4、耗时 7 天
- **THEN** 这些字段存入该记录的 feedback.detail 中

#### Scenario: 用户不展开直接关闭

- **WHEN** 用户点击极简按钮后不展开详细记录
- **THEN** 记录状态更新但不含 detail 字段

### Requirement: 新记录反馈到期时间

系统 SHALL 在创建占卜记录时生成默认反馈到期时间。

- 工作、人际、财务、其他分类默认 7 天后到期
- 健康分类默认 14 天后到期
- 用户可在结果页修改反馈提醒时间或关闭主动提醒

#### Scenario: 创建工作类记录

- **WHEN** 用户创建分类为 "工作" 的占卜记录
- **THEN** `feedback.status` 为 pending，`feedback.dueAt` 默认为创建时间 7 天后

#### Scenario: 用户关闭主动提醒

- **WHEN** 用户在结果页选择不主动提醒反馈
- **THEN** `feedback.dueAt` 保存为 null，记录仍可在历史详情中手动反馈
