# Cloud Sync - 云端数据同步

## 概述

为易经占卜应用添加云端数据同步功能，支持多设备使用同一账号同步数据。

## 背景

当前应用使用 IndexedDB 存储所有数据，不同设备/浏览器之间数据完全隔离。用户需要在不同设备上使用时，必须手动导出/导入数据，体验不便。

## 目标

1. 支持用户注册/登录账号
2. 登录后自动同步数据到云端
3. 新设备登录后自动拉取云端数据
4. 支持手动迁移现有本地数据到云端

## 非目标

- API Key 不加密存储（简化实现）
- 不强制离线支持（同步模式）
- 不支持数据冲突自动解决（最新优先）

## 用户故事

1. **作为用户**，我可以在新设备上登录账号，自动看到我的所有占卜记录
2. **作为用户**，我可以在新设备上登录后，API Key 自动同步
3. **作为用户**，我可以手动将本地数据上传到云端
4. **作为用户**，我可以直观地看到同步状态

## 技术方案

### 技术栈

| 组件 | 选择 | 理由 |
|------|------|------|
| 后端 | Supabase | 免费版足够，内置认证+数据库 |
| 认证 | Supabase Auth | 用户名 + 密码 |
| 数据库 | Supabase PostgreSQL | 免费版 500MB |
| 同步 | 自定义同步层 | 控制同步逻辑 |

### 数据库设计

#### records 表 (占卜记录)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，与本地 ID 相同 |
| user_id | UUID | 外键 → users.id |
| schema_version | INT | 数据版本 |
| timestamp | TIMESTAMPTZ | 占卜时间 |
| question | TEXT | 占卜问题 |
| category | VARCHAR | 分类 |
| method | VARCHAR | 起卦方式 |
| before_divination | JSONB | 占前预判 |
| hexagram | JSONB | 卦象数据 |
| interpretations | JSONB | AI 解读 |
| feedback | JSONB | 反馈数据 |
| duplicate | JSONB | 重复检测 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

#### user_settings 表 (用户设置)

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | UUID | 主键，外键 → users.id |
| api_key | TEXT | API Key (明文) |
| preferences | JSONB | 用户偏好 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

### 同步策略

**登录时自动同步流程:**

1. 用户登录 → 获得 session token
2. 检查本地 IndexedDB 数据
3. 检查云端数据
4. 合并策略:
   - 本地有，云端无 → 上传本地数据
   - 本地无，云端有 → 下载云端数据
   - 两边都有 → 比较时间戳，保留最新的

### 安全设计

- 密码: Supabase Auth 自动处理 (bcrypt 哈希)
- API Key: 明文存储 (简化实现)
- 数据传输: Supabase 默认 HTTPS
- 访问控制: RLS 策略确保用户只能访问自己的数据

## 实现阶段

### 阶段 1: Supabase 配置 (0.5 天)

- 创建 Supabase 项目
- 创建数据库表
- 配置 RLS 策略
- 启用用户名+密码认证

### 阶段 2: 认证模块 (1 天)

- Login 页面 (username + password)
- Register 页面
- useAuth hook (认证状态管理)
- 路由保护 (未登录跳转登录页)

### 阶段 3: 同步模块 (1-1.5 天)

- Supabase 客户端配置
- Records 同步 (云端 CRUD)
- Settings 同步 (API Key + preferences)
- 登录时自动同步逻辑

### 阶段 4: UI 集成 (0.5 天)

- 登录/注册页面
- 同步状态指示器
- 手动上传按钮 (迁移本地数据)

**总计: 3-3.5 天**

## 风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| Supabase 免费版限制 | 监控使用量，必要时升级 |
| 数据同步冲突 | 采用"最新优先"策略 |
| 网络不稳定 | 显示同步状态，允许重试 |

## 验收标准

1. 用户可以注册/登录账号
2. 登录后自动同步数据到云端
3. 新设备登录后自动拉取云端数据
4. 可以手动迁移本地数据到云端
5. API Key 登录后自动同步
6. 同步状态有明确的 UI 反馈