# Cloud Sync Design - 设计文档

## 架构概览

```
┌─────────────────────────────────────────────────────────────────────┐
│                     多端同步架构                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐       │
│   │   设备 A     │     │   设备 B     │     │   设备 C     │       │
│   │  (登录后)    │     │  (登录后)    │     │  (登录后)    │       │
│   └──────┬───────┘     └──────┬───────┘     └──────┬───────┘       │
│          │                    │                    │                 │
│          └────────────────────┼────────────────────┘                 │
│                               │                                     │
│                               ▼                                     │
│                    ┌─────────────────────┐                          │
│                    │     Supabase        │                          │
│                    │   ┌─────────────┐   │                          │
│                    │   │ PostgreSQL  │   │                          │
│                    │   │  (数据)     │   │                          │
│                    │   └─────────────┘   │                          │
│                    │   ┌─────────────┐   │                          │
│                    │   │   Auth      │   │                          │
│                    │   │  (认证)     │   │                          │
│                    │   └─────────────┘   │                          │
│                    └─────────────────────┘                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 数据流

```
┌─────────────────────────────────────────────────────────────────────┐
│                     登录同步流程                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. 用户登录                                                         │
│     ─────────                                                       │
│     • 输入 username + password                                       │
│     • 调用 Supabase Auth login                                      │
│     • 获得 session token                                            │
│                                                                     │
│  2. 自动同步                                                         │
│     ─────────                                                       │
│     • 检查本地 IndexedDB 是否有数据                                   │
│     • 检查云端是否有数据                                              │
│     • 合并策略:                                                      │
│       - 本地有，云端无 → 上传本地数据                                 │
│       - 本地无，云端有 → 下载云端数据                                 │
│       - 两边都有 → 比较时间戳，保留最新的                             │
│                                                                     │
│  3. 同步完成                                                         │
│     ─────────                                                       │
│     • 本地 IndexedDB 更新为合并后的数据                               │
│     • 更新 UI 显示                                                  │
│     • 用户可以正常使用                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 数据库 Schema

```sql
-- 占卜记录表
CREATE TABLE records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  schema_version INT NOT NULL DEFAULT 1,
  timestamp TIMESTAMPTZ NOT NULL,
  question TEXT NOT NULL,
  category VARCHAR(20) NOT NULL,
  method VARCHAR(10) NOT NULL,
  before_divination JSONB,
  hexagram JSONB NOT NULL,
  interpretations JSONB DEFAULT '[]'::jsonb,
  feedback JSONB NOT NULL,
  duplicate JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户设置表 (API Key 明文存储)
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  api_key TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 策略
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own records"
  ON records FOR ALL
  USING (auth.uid() = user_id);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id);
```

## 组件设计

### 1. AuthContext.tsx

```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

### 2. useSync.ts

```typescript
interface UseSyncReturn {
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncTime: Date | null;
  sync: () => Promise<void>;
  uploadLocalData: () => Promise<void>;
}
```

### 3. Sync 策略

```typescript
async function syncData(userId: string) {
  const localRecords = await getAllRecords();
  const cloudRecords = await fetchCloudRecords(userId);
  
  // 合并策略: 最新优先
  const merged = mergeByTimestamp(localRecords, cloudRecords);
  
  // 更新本地
  await updateLocalRecords(merged);
  
  // 更新云端
  await updateCloudRecords(userId, merged);
}
```

## 安全设计

### API Key 存储

- 存储位置: Supabase user_settings 表
- 存储方式: 明文 (简化实现)
- 访问控制: RLS 确保用户只能访问自己的数据

### 数据传输

- 协议: HTTPS (Supabase 默认)
- 认证: JWT token (Supabase Auth)

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| 网络断开 | 显示离线状态，重试按钮 |
| 同步冲突 | 最新时间戳优先 |
| 数据格式错误 | 跳过该条记录，继续同步 |
| 认证失败 | 跳转登录页 |

## 性能考虑

- 批量上传: 一次最多 100 条记录
- 增量同步: 只同步 changed 记录
- 压缩: JSON 数据压缩传输
