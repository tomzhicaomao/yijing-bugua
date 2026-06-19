import type { ExportData } from '../types'
import { divinationRecordSchema } from '../lib/schemas.js'
import { createRecord, getAllRecords, getRecordById } from './records.js'
import { SCHEMA_VERSION } from '../lib/constants.js'
import { z } from 'zod'

const exportMetaSchema = z.object({
  app: z.literal('yijing-bugua'),
  schemaVersion: z.number(),
  exportedAt: z.string(),
  records: z.array(z.unknown()),
})

export async function exportToJSON(userId: string): Promise<string> {
  const records = await getAllRecords(userId)
  const data: ExportData = {
    app: 'yijing-bugua',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    records,
  }
  return JSON.stringify(data, null, 2)
}

export function exportFilename(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `yijing-export-${yyyy}-${mm}-${dd}.json`
}

export interface ImportResult {
  added: number
  skipped: number
  invalid: number
  errors: string[]
}

export async function importFromJSON(jsonString: string, userId: string): Promise<ImportResult> {
  const result: ImportResult = { added: 0, skipped: 0, invalid: 0, errors: [] }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    result.errors.push('JSON 格式无效')
    return result
  }

  // Check schemaVersion before meta validation (since meta allows any number)
  if (parsed && typeof parsed === 'object' && 'schemaVersion' in parsed) {
    const sv = (parsed as Record<string, unknown>).schemaVersion
    if (typeof sv === 'number' && sv > SCHEMA_VERSION) {
      result.errors.push(`数据版本过新（${sv}），请升级应用后再导入。当前支持版本：${SCHEMA_VERSION}`)
      return result
    }
  }

  const meta = exportMetaSchema.safeParse(parsed)
  if (!meta.success) {
    result.errors.push('文件格式无效，请选择正确的导出文件')
    return result
  }

  const records = meta.data.records as unknown[]

  for (const record of records) {
    const validated = divinationRecordSchema.safeParse(record)
    if (!validated.success) {
      result.invalid++
      continue
    }

    const existing = await getRecordById(validated.data.id, userId)
    if (existing) {
      result.skipped++
      continue
    }

    await createRecord(validated.data, userId)
    result.added++
  }

  return result
}
