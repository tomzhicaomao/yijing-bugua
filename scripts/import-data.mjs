#!/usr/bin/env node

/**
 * 数据导入脚本
 * 用法: node scripts/import-data.mjs <json-file> <user-email>
 * 
 * 此脚本将导出的JSON数据导入到Supabase数据库
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hiqnvjeoaqtdkevpalvp.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcW52amVvYXF0ZGtldnBhbHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDE1MjMsImV4cCI6MjA5NjE3NzUyM30.VnBVhKXjTaXHxc1tnifG2wr4A6k6RyrvpPD2dn2JyVM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function findUserByEmail(email) {
  // 注意：由于RLS限制，我们无法直接查询auth.users
  // 用户需要先登录才能操作
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    console.error('请先登录！')
    console.error('运行: npx supabase login 或在应用中登录')
    return null
  }
  return user
}

async function importRecords(records, userId) {
  console.log(`准备导入 ${records.length} 条记录...`)
  
  let success = 0
  let skipped = 0
  let errors = 0

  for (const record of records) {
    const row = {
      id: record.id,
      user_id: userId,
      schema_version: record.schemaVersion,
      timestamp: record.timestamp,
      question: record.question,
      category: record.category,
      method: record.method,
      before_divination: record.beforeDivination || null,
      hexagram: record.hexagram,
      interpretations: record.interpretations || [],
      feedback: record.feedback,
      duplicate: record.duplicate || null,
    }

    const { error } = await supabase
      .from('records')
      .upsert(row, { onConflict: 'id' })

    if (error) {
      if (error.code === '23505') {
        // 唯一约束冲突，跳过
        skipped++
      } else {
        console.error(`导入记录 ${record.id} 失败:`, error.message)
        errors++
      }
    } else {
      success++
    }
  }

  console.log(`导入完成: 成功 ${success}, 跳过 ${skipped}, 失败 ${errors}`)
}

async function main() {
  const jsonFile = process.argv[2]
  
  if (!jsonFile) {
    console.log('用法: node scripts/import-data.mjs <json-file>')
    console.log('')
    console.log('此脚本将导出的JSON数据导入到当前登录用户的Supabase数据库')
    console.log('')
    console.log('步骤:')
    console.log('1. 先在应用中登录你的账号')
    console.log('2. 运行此脚本导入数据')
    process.exit(1)
  }

  // 读取JSON文件
  let data
  try {
    const content = readFileSync(jsonFile, 'utf-8')
    data = JSON.parse(content)
  } catch (err) {
    console.error('读取JSON文件失败:', err.message)
    process.exit(1)
  }

  if (!data.records || !Array.isArray(data.records)) {
    console.error('JSON文件格式错误：缺少 records 数组')
    process.exit(1)
  }

  // 获取当前登录用户
  const user = await findUserByEmail()
  if (!user) {
    process.exit(1)
  }

  console.log(`当前用户: ${user.email} (${user.id})`)
  console.log(`待导入记录: ${data.records.length} 条`)

  // 导入记录
  await importRecords(data.records, user.id)
}

main().catch(console.error)
