import { test, expect } from '@playwright/test'

test.describe('yijing-bugua UI 测试 (Nothing Design)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
  })

  test('1. 未登录时重定向到登录页面', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('易经占卜')
    await expect(page.locator('text=登录')).toBeVisible()
    await expect(page.locator('text=注册新账号')).toBeVisible()
  })

  test('2. 登录页面包含用户名和密码输入框', async ({ page }) => {
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('3. 注册页面链接可点击', async ({ page }) => {
    await page.click('text=注册新账号')
    await expect(page.locator('h1')).toContainText('注册账号')
    await expect(page.locator('text=登录已有账号')).toBeVisible()
  })

  test('4. 导航到起卦页面需要登录，会重定向到登录页', async ({ page }) => {
    await page.goto('http://localhost:5173/divine')
    await page.waitForURL('**/login')
    await expect(page.locator('h1')).toContainText('易经占卜')
  })

  test('5. 导航到历史页面需要登录，会重定向到登录页', async ({ page }) => {
    await page.goto('http://localhost:5173/history')
    await page.waitForURL('**/login')
    await expect(page.locator('h1')).toContainText('易经占卜')
  })

  test('6. 导航到统计页面需要登录，会重定向到登录页', async ({ page }) => {
    await page.goto('http://localhost:5173/stats')
    await page.waitForURL('**/login')
    await expect(page.locator('h1')).toContainText('易经占卜')
  })

  test('7. 导航到设置页面需要登录，会重定向到登录页', async ({ page }) => {
    await page.goto('http://localhost:5173/settings')
    await page.waitForURL('**/login')
    await expect(page.locator('h1')).toContainText('易经占卜')
  })
})
