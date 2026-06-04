# Authentication Specification

## Requirement: 用户注册

系统 SHALL 允许用户使用用户名和密码注册账号。

### Scenario: 成功注册

- **WHEN** 用户输入有效的用户名（3-50字符）和密码（6+字符）
- **THEN** 系统创建账号并自动登录
- **AND** 跳转到首页

### Scenario: 用户名已存在

- **WHEN** 用户输入已存在的用户名
- **THEN** 系统显示错误信息"用户名已被使用"

### Scenario: 密码太短

- **WHEN** 用户输入少于6位的密码
- **THEN** 系统显示错误信息"密码至少需要6位"

## Requirement: 用户登录

系统 SHALL 允许用户使用用户名和密码登录。

### Scenario: 成功登录

- **WHEN** 用户输入正确的用户名和密码
- **THEN** 系统创建 session
- **AND** 跳转到首页
- **AND** 自动同步云端数据

### Scenario: 用户名或密码错误

- **WHEN** 用户输入错误的用户名或密码
- **THEN** 系统显示错误信息"用户名或密码错误"

## Requirement: 用户登出

系统 SHALL 允许用户登出。

### Scenario: 成功登出

- **WHEN** 用户点击登出按钮
- **THEN** 系统清除 session
- **AND** 跳转到登录页

## Requirement: 路由保护

系统 SHALL 保护需要登录的页面。

### Scenario: 未登录访问受保护页面

- **WHEN** 未登录用户访问 /divine, /history, /stats, /settings 等页面
- **THEN** 系统重定向到登录页

### Scenario: 已登录访问登录页

- **WHEN** 已登录用户访问 /login
- **THEN** 系统重定向到首页
