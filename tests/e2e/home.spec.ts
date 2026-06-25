import { test, expect } from '@playwright/test'
import { loginAsTestUser, mockRecordsApi, createMockRecord } from './helpers/auth'

test.describe('首页测试（已登录）', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('已登录用户可以看到首页', async ({ page }) => {
    await page.goto('/')
    // Should not redirect to login
    await expect(page).toHaveURL(/\/$/)
    // Wait for content to load
    await page.waitForTimeout(1000)
  })

  test('首页显示底部导航栏', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    // Check bottom nav links
    const nav = page.locator('nav.fixed.bottom-0')
    await expect(nav).toBeVisible()
    await expect(nav.locator('text=HOME')).toBeVisible()
    await expect(nav.locator('a:has-text("DIVINE")')).toBeVisible()
    await expect(nav.locator('a:has-text("HISTORY")')).toBeVisible()
    await expect(nav.locator('a:has-text("STATS")')).toBeVisible()
  })

  test('首页显示起卦入口', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    // Look for a link/button to start divination
    const divineLink = page.locator('a[href="/divine"], button:has-text("起卦"), a:has-text("起卦")')
    await expect(divineLink.first()).toBeVisible()
  })

  test('首页显示历史和统计链接', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    await expect(page.locator('a[href="/history"]').first()).toBeVisible()
    await expect(page.locator('a[href="/stats"]').first()).toBeVisible()
  })

  test('导航到起卦页面', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    await page.click('a[href="/divine"]')
    await expect(page).toHaveURL(/\/divine/)
  })

  test('导航到历史页面', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    await page.click('a[href="/history"]')
    await expect(page).toHaveURL(/\/history/)
  })

  test('导航到统计页面', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    await page.click('a[href="/stats"]')
    await expect(page).toHaveURL(/\/stats/)
  })
})
