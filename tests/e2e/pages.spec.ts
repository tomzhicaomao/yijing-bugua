import { test, expect } from '@playwright/test'
import { loginAsTestUser, mockRecordsApi, createMockRecord } from './helpers/auth'

test.describe('统计页面测试', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('统计页面可访问', async ({ page }) => {
    await mockRecordsApi(page, [])
    await page.goto('/stats')
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/stats/)
  })

  test('无数据时显示空状态提示', async ({ page }) => {
    await mockRecordsApi(page, [])
    await page.goto('/stats')
    await page.waitForTimeout(1000)
    await expect(page.locator('text=暂无数据')).toBeVisible()
  })

  test('有数据时显示统计卡片', async ({ page }) => {
    const records = [
      createMockRecord({ feedback: { due_at: '', status: 'accurate', detail: null } }),
      createMockRecord({ feedback: { due_at: '', status: 'inaccurate', detail: null } }),
      createMockRecord({ feedback: { due_at: '', status: 'pending', detail: null } }),
      createMockRecord({ category: '工作', feedback: { due_at: '', status: 'accurate', detail: null } }),
      createMockRecord({ category: '工作', feedback: { due_at: '', status: 'accurate', detail: null } }),
      createMockRecord({ category: '工作', feedback: { due_at: '', status: 'accurate', detail: null } }),
      createMockRecord({ category: '工作', feedback: { due_at: '', status: 'accurate', detail: null } }),
      createMockRecord({ category: '工作', feedback: { due_at: '', status: 'accurate', detail: null } }),
    ]
    await mockRecordsApi(page, records)
    await page.goto('/stats')
    await page.waitForTimeout(1000)

    // Should show stats cards with numbers
    await expect(page.locator('text=总次数')).toBeVisible()
    await expect(page.locator('text=反馈率')).toBeVisible()
    await expect(page.locator('text=准确率')).toBeVisible()
    await expect(page.locator('text=已反馈')).toBeVisible()
  })

  test('显示按分类统计', async ({ page }) => {
    const records = [
      createMockRecord({ category: '工作', feedback: { due_at: '', status: 'accurate', detail: null } }),
      createMockRecord({ category: '工作', feedback: { due_at: '', status: 'accurate', detail: null } }),
      createMockRecord({ category: '工作', feedback: { due_at: '', status: 'accurate', detail: null } }),
      createMockRecord({ category: '工作', feedback: { due_at: '', status: 'accurate', detail: null } }),
      createMockRecord({ category: '工作', feedback: { due_at: '', status: 'accurate', detail: null } }),
      createMockRecord({ category: '人际', feedback: { due_at: '', status: 'inaccurate', detail: null } }),
      createMockRecord({ category: '人际', feedback: { due_at: '', status: 'inaccurate', detail: null } }),
      createMockRecord({ category: '人际', feedback: { due_at: '', status: 'inaccurate', detail: null } }),
      createMockRecord({ category: '人际', feedback: { due_at: '', status: 'inaccurate', detail: null } }),
      createMockRecord({ category: '人际', feedback: { due_at: '', status: 'inaccurate', detail: null } }),
    ]
    await mockRecordsApi(page, records)
    await page.goto('/stats')
    await page.waitForTimeout(1000)

    // Should show category breakdown
    await expect(page.locator('text=按分类')).toBeVisible()
    await expect(page.locator('text=工作').first()).toBeVisible()
    await expect(page.locator('text=人际').first()).toBeVisible()
  })

  test('显示顶部导航和底部导航', async ({ page }) => {
    await mockRecordsApi(page, [])
    await page.goto('/stats')
    await page.waitForTimeout(500)

    // Top nav
    await expect(page.locator('text=统计')).toBeVisible()
    await expect(page.locator('a:has-text("返回")')).toBeVisible()

    // Bottom nav
    const nav = page.locator('nav.fixed.bottom-0')
    await expect(nav).toBeVisible()
  })
})

test.describe('设置页面测试', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('设置页面可访问', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/settings/)
  })

  test('设置页面显示标题', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForTimeout(500)
    await expect(page.locator('text=设置, text=SETTINGS')).toBeVisible()
  })

  test('设置页面显示返回链接', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForTimeout(500)
    await expect(page.locator('a:has-text("返回")')).toBeVisible()
  })

  test('设置页面显示底部导航', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForTimeout(500)
    const nav = page.locator('nav.fixed.bottom-0')
    await expect(nav).toBeVisible()
  })
})
