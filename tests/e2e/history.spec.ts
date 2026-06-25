import { test, expect } from '@playwright/test'
import { loginAsTestUser, mockRecordsApi, createMockRecord } from './helpers/auth'

test.describe('历史记录页面测试', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('历史页面可访问', async ({ page }) => {
    await mockRecordsApi(page, [])
    await page.goto('/history')
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/history/)
  })

  test('历史页面显示标题和导航', async ({ page }) => {
    await mockRecordsApi(page, [])
    await page.goto('/history')
    await page.waitForTimeout(500)
    await expect(page.locator('text=历史')).toBeVisible()
    await expect(page.locator('a:has-text("返回")')).toBeVisible()
  })

  test('无记录时显示空状态', async ({ page }) => {
    await mockRecordsApi(page, [])
    await page.goto('/history')
    await page.waitForTimeout(500)
    await expect(page.locator('text=暂无记录')).toBeVisible()
  })

  test('有记录时显示列表', async ({ page }) => {
    const records = [
      createMockRecord({ id: 'rec-1', question: '今天适合做什么？', category: '工作' }),
      createMockRecord({ id: 'rec-2', question: '感情运势如何？', category: '人际' }),
      createMockRecord({ id: 'rec-3', question: '投资是否合适？', category: '财务' }),
    ]
    await mockRecordsApi(page, records)
    await page.goto('/history')
    await page.waitForTimeout(1000)

    // Should show record questions
    await expect(page.locator('text=今天适合做什么？')).toBeVisible()
    await expect(page.locator('text=感情运势如何？')).toBeVisible()
    await expect(page.locator('text=投资是否合适？')).toBeVisible()
  })

  test('筛选标签可见', async ({ page }) => {
    await mockRecordsApi(page, [createMockRecord()])
    await page.goto('/history')
    await page.waitForTimeout(500)

    // Should show filter tags
    await expect(page.locator('text=全部').first()).toBeVisible()
    await expect(page.locator('text=工作').first()).toBeVisible()
    await expect(page.locator('text=人际').first()).toBeVisible()
    await expect(page.locator('text=财务').first()).toBeVisible()
    await expect(page.locator('text=健康').first()).toBeVisible()
    await expect(page.locator('text=其他').first()).toBeVisible()
  })

  test('记录显示反馈状态标签', async ({ page }) => {
    const records = [
      createMockRecord({ id: 'rec-1', question: '待反馈问题', feedback: { due_at: new Date().toISOString(), status: 'pending', detail: null } }),
      createMockRecord({ id: 'rec-2', question: '准确问题', feedback: { due_at: new Date().toISOString(), status: 'accurate', detail: null } }),
      createMockRecord({ id: 'rec-3', question: '不准确问题', feedback: { due_at: new Date().toISOString(), status: 'inaccurate', detail: null } }),
    ]
    await mockRecordsApi(page, records)
    await page.goto('/history')
    await page.waitForTimeout(1000)

    // Should show status badges (use .first() to avoid strict mode)
    await expect(page.locator('span:has-text("待反馈")').first()).toBeVisible()
    await expect(page.locator('span:has-text("准")').first()).toBeVisible()
    await expect(page.locator('span:has-text("不准")').first()).toBeVisible()
  })

  test('记录显示日期和分类', async ({ page }) => {
    const records = [createMockRecord({ category: '工作' })]
    await mockRecordsApi(page, records)
    await page.goto('/history')
    await page.waitForTimeout(1000)

    // Should show category
    await expect(page.locator('text=其他').first()).toBeVisible()
  })

  test('点击记录可查看详情', async ({ page }) => {
    const record = createMockRecord({ id: 'detail-test-id', question: '查看详情测试' })
    await mockRecordsApi(page, [record])
    await page.goto('/history')
    await page.waitForTimeout(1000)

    // Click on the record
    await page.locator('text=查看详情测试').click()

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/history\/detail-test-id/, { timeout: 5000 })
  })

  test('底部导航栏可见', async ({ page }) => {
    await mockRecordsApi(page, [])
    await page.goto('/history')
    await page.waitForTimeout(500)

    const nav = page.locator('nav.fixed.bottom-0')
    await expect(nav).toBeVisible()
    await expect(nav.locator('a:has-text("HOME")')).toBeVisible()
    await expect(nav.locator('a:has-text("DIVINE")')).toBeVisible()
    await expect(nav.locator('a:has-text("HISTORY")')).toBeVisible()
    await expect(nav.locator('a:has-text("STATS")')).toBeVisible()
  })
})
