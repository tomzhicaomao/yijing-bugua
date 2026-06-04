# Sync Specification

## Requirement: 登录时自动同步

系统 SHALL 在用户登录时自动同步本地和云端数据。

### Scenario: 本地有数据，云端无数据

- **WHEN** 用户登录且本地有数据但云端无数据
- **THEN** 系统将本地数据上传到云端
- **AND** 显示"同步完成"

### Scenario: 本地无数据，云端有数据

- **WHEN** 用户登录且本地无数据但云端有数据
- **THEN** 系统将云端数据下载到本地
- **AND** 显示"同步完成"

### Scenario: 两边都有数据

- **WHEN** 用户登录且本地和云端都有数据
- **THEN** 系统比较时间戳
- **AND** 保留最新的数据
- **AND** 显示"同步完成"

## Requirement: 手动迁移数据

系统 SHALL 允许用户手动将本地数据上传到云端。

### Scenario: 上传本地数据

- **WHEN** 用户点击"上传到云端"按钮
- **THEN** 系统将本地所有记录上传到云端
- **AND** 显示进度
- **AND** 完成后显示"迁移完成"

## Requirement: API Key 同步

系统 SHALL 在登录时同步 API Key。

### Scenario: 同步 API Key

- **WHEN** 用户登录且本地有 API Key
- **THEN** 系统将 API Key 上传到云端
- **AND** 新设备登录后自动获取 API Key

## Requirement: 同步状态显示

系统 SHALL 显示同步状态。

### Scenario: 同步中

- **WHEN** 系统正在同步数据
- **THEN** 显示"同步中..."指示器

### Scenario: 同步完成

- **WHEN** 同步完成
- **THEN** 显示"同步完成"提示

### Scenario: 同步失败

- **WHEN** 同步失败
- **THEN** 显示错误信息和重试按钮
