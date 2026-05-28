## ADDED Requirements

### Requirement: IndexedDB 存储占卜记录

系统 SHALL 使用 IndexedDB 存储所有占卜记录，支持 CRUD 操作。

数据库 MUST 包含以下索引：
- `id`（主键）
- `timestamp`（按时间查询）
- `category`（按分类查询）
- `feedback.status`（按反馈状态查询）
- `feedback.dueAt`（按反馈到期时间查询）
- `schemaVersion`（用于未来迁移）

#### Scenario: 创建新记录

- **WHEN** 用户完成起卦进入结果页
- **THEN** 一条包含规则引擎基础结果的 DivinationRecord 被写入 IndexedDB
- **AND** 后续 AI 解读成功时更新该记录的 `interpretations[]`

#### Scenario: 按分类查询记录

- **WHEN** 用户查询分类为 "工作" 的记录
- **THEN** 返回所有 category 为 "工作" 的记录，按时间倒序

#### Scenario: 查询到期待反馈记录

- **WHEN** 系统启动时查询 feedback.status 为 'pending' 且 feedback.dueAt 已到期的记录
- **THEN** 返回所有到期待反馈记录列表

### Requirement: 记录数据 Schema

每一条占卜记录 MUST 符合以下 schema：

```typescript
{
  schemaVersion: 1
  id: string
  timestamp: string
  question: string
  category: '工作' | '人际' | '财务' | '健康' | '其他'
  method: 'virtual' | 'manual'
  beforeDivination?: {
    userExpectation?: string
    userConfidence?: number
    intendedAction?: string
  }
  hexagram: {
    original: number
    changed: number | null
    changingLines: number[]
  }
  interpretations: Array<{
    id: string
    type: 'default' | 'deep'
    trend: '利' | '不利' | '中性'
    analysis: string
    conditions: string[]
    timeWindow: string
    answer: string
    confidence: '高' | '中' | '低'
    model: string
    promptVersion: string
    temperature?: number
    rawResponse?: string
    claims: Array<{
      id: string
      type: 'trend' | 'condition' | 'timeWindow' | 'advice' | 'answer'
      text: string
    }>
  }> // 可为空数组；AI 成功后追加结果
  feedback: {
    dueAt: string | null
    status: 'pending' | 'accurate' | 'inaccurate' | 'unclear'
    detail?: {
      actualResult?: string
      satisfaction?: number
      actualDuration?: number
      actionTaken?: string
      aiInfluencedDecision?: boolean
      notes?: string
      claimFeedback?: Array<{
        claimId: string
        status: 'hit' | 'miss' | 'unclear'
      }>
    }
  }
  duplicate?: {
    countWithin24h: number
    relatedRecordIds: string[]
  }
}
```

#### Scenario: Schema 完整性验证

- **WHEN** 创建新记录
- **THEN** 所有必填字段 MUST 有值，可选字段可为 null/undefined

#### Scenario: 时间字段序列化

- **WHEN** 创建或导入记录
- **THEN** `timestamp` 与 `feedback.dueAt` MUST 为 ISO 字符串或 null，不得以 Date 对象写入 IndexedDB

### Requirement: JSON 导出

系统 SHALL 支持将所有占卜记录导出为 JSON 文件下载。

- 导出 MUST 包含数据库中所有记录
- 文件名格式：`yijing-export-{YYYY-MM-DD}.json`
- 导出文件顶层 MUST 为 `{ app: 'yijing-bugua', schemaVersion: 1, exportedAt, records }`

#### Scenario: 用户导出数据

- **WHEN** 用户在设置页面点击 "导出数据"
- **THEN** 浏览器触发 JSON 文件下载，包含所有占卜记录

### Requirement: JSON 导入

系统 SHALL 支持从导出的 JSON 文件恢复数据。

- 导入前 MUST 校验 JSON 格式
- 导入前 MUST 校验 `app`、`schemaVersion` 和每条记录的 schema
- 重复 id 的记录 MUST 跳过（不覆盖现有记录）
- 导入完成后 MUST 显示导入结果（新增/跳过条数）
- 不支持的未来 schemaVersion MUST 阻止导入并显示明确错误

#### Scenario: 用户导入有效 JSON 文件

- **WHEN** 用户选择有效的导出文件并确认导入
- **THEN** 新记录被写入 IndexedDB，显示 "导入完成：新增 X 条，跳过 Y 条"

#### Scenario: 用户导入无效文件

- **WHEN** 用户选择非 JSON 格式或格式错误的文件
- **THEN** 系统显示错误提示 "文件格式无效，请选择正确的导出文件"

#### Scenario: 用户导入未来版本文件

- **WHEN** 用户选择 `schemaVersion` 大于当前支持版本的导出文件
- **THEN** 系统显示错误提示 "数据版本过新，请升级应用后再导入"

#### Scenario: 用户导入部分无效记录

- **WHEN** 导出文件顶层合法但部分 records 不符合 schema
- **THEN** 系统跳过无效记录，导入有效记录，并在结果中显示无效条数
