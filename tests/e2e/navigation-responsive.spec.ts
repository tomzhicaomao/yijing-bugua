import { test, expect } from '@playwright/test'
import { loginAsTestUser } from './helpers/auth'

test.describe('导航测试', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('底部导航栏在所有页面可见', async ({ page }) => {
    const pages = ['/', '/divine', '/history', '/stats', '/settings']
    for (const route of pages) {
      await page.goto(route)
      await page.waitForTimeout(500)
      const nav = page.locator('nav.fixed.bottom-0')
      await expect(nav).toBeVisible({ timeout: 5000 })
    }
  })

  test('底部导航栏有 4 个导航项', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    const nav = page.locator('nav.fixed.bottom-0')
    // HOME is a span (active page), others are links — total 4 items
    const items = nav.locator('a, span.font-mono')
    await expect(items).toHaveCount(4)
  })

  test('HOME 链接导航到首页', async ({ page }) => {
    await page.goto('/history')
    await page.waitForTimeout(500)
    await page.locator('nav.fixed.bottom-0 a:has-text("HOME")').click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('DIVINE 链接导航到起卦页', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    await page.locator('nav.fixed.bottom-0 a:has-text("DIVINE")').click()
    await expect(page).toHaveURL(/\/divine/)
  })

  test('HISTORY 链接导航到历史页', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    await page.locator('nav.fixed.bottom-0 a:has-text("HISTORY")').click()
    await expect(page).toHaveURL(/\/history/)
  })

  test('STATS 链接导航到统计页', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    await page.locator('nav.fixed.bottom-0 a:has-text("STATS")').click()
    await expect(page).toHaveURL(/\/stats/)
  })

  test('起卦页返回按钮回到首页', async ({ page }) => {
    await page.goto('/divine')
    await page.waitForTimeout(500)
    await page.locator('a:has-text("返回")').first().click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('历史页返回按钮回到首页', async ({ page }) => {
    await page.goto('/history')
    await page.waitForTimeout(500)
    await page.locator('a:has-text("返回")').first().click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('统计页返回按钮回到首页', async ({ page }) => {
    await page.goto('/stats')
    await page.waitForTimeout(500)
    await page.locator('a:has-text("返回")').first().click()
    await expect(page).toHaveURL(/\/$/)
  })
})

test.describe('响应式布局测试', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('移动端视口下登录页面正常显示', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }) // iPhone X
    await page.goto('/login')
    await page.waitForTimeout(300)

    await expect(page.locator('h1:has-text("易经占卜")')).toBeVisible()
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('移动端视口下起卦页面正常显示', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/divine')
    await page.waitForTimeout(500)

    await expect(page.locator('h1:has-text("你想问什么")')).toBeVisible()
    await expect(page.locator('textarea')).toBeVisible()
  })

  test('平板视口下页面正常显示', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }) // iPad
    await page.goto('/login')
    await page.waitForTimeout(300)

    await expect(page.locator('h1:has-text("易经占卜")')).toBeVisible()
    await expect(page.locator('input[type="text"]')).toBeVisible()
  })

  test('桌面视口下页面正常显示', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/login')
    await page.waitForTimeout(300)

    await expect(page.locator('h1:has-text("易经占卜")')).toBeVisible()
  })

  test('移动端底部导航栏始终可见', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.waitForTimeout(500)

    const nav = page.locator('nav.fixed.bottom-0')
    await expect(nav).toBeVisible()
  })

  test('移动端铜钱界面适配小屏幕', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/divine')
    await page.waitForTimeout(500)

    // Navigate to casting
    await page.locator('textarea').fill('移动端测试')
    await page.locator('button:has-text("工作"), span:has-text("工作")').first().click()
    await page.locator('button:has-text("下一步"), button:has-text("NEXT")').first().click()
    await expect(page.locator('h1:has-text("记录你的判断")')).toBeVisible({ timeout: 5000 })
    await page.locator('button:has-text("跳过")').first().click()
    await expect(page.locator('h1:has-text("选择起卦方式")')).toBeVisible({ timeout: 5000 })
    await page.locator('p:has-text("虚拟摇卦")').first().click()
    await page.locator('button:has-text("开始起卦"), button:has-text("CAST")').first().click()

    // Verify coins are visible on mobile
    await expect(page.locator('h1:has-text("虚拟摇卦")')).toBeVisible({ timeout: 5000 })
    const coins = page.locator('[aria-label="铜钱"]')
    await expect(coins).toHaveCount(3)

    // Verify toss button is visible and clickable
    const tossBtn = page.locator('button:has-text("掷铜钱")')
    await expect(tossBtn).toBeVisible()
  })
})
