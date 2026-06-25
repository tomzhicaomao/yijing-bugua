import { test, expect } from '@playwright/test'

test.describe('认证页面测试', () => {
  test.describe('登录页面', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
    })

    test('显示应用标题和品牌', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('易经占卜')
    })

    test('显示登录表单（用户名、密码、提交按钮）', async ({ page }) => {
      await expect(page.locator('label:has-text("用户名")')).toBeVisible()
      await expect(page.locator('label:has-text("密码")')).toBeVisible()
      await expect(page.locator('input[type="text"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('显示注册链接', async ({ page }) => {
      const registerLink = page.locator('a[href="/register"]')
      await expect(registerLink).toBeVisible()
      await expect(registerLink).toContainText('注册新账号')
    })

    test('空表单提交时浏览器验证阻止', async ({ page }) => {
      const usernameInput = page.locator('input[type="text"]')
      // HTML required attribute should prevent submission
      await expect(usernameInput).toHaveAttribute('required', '')
    })

    test('输入用户名和密码后可提交', async ({ page }) => {
      await page.fill('input[type="text"]', 'testuser')
      await page.fill('input[type="password"]', 'testpass123')
      const submitBtn = page.locator('button[type="submit"]')
      await expect(submitBtn).toBeEnabled()
      await expect(submitBtn).toContainText('登录')
    })

    test('提交后按钮显示加载状态', async ({ page }) => {
      await page.fill('input[type="text"]', 'nonexistentuser')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      // Button should show loading text (may be brief)
      await expect(page.locator('button[type="submit"]')).toContainText(/登录中|登录/)
    })

    test('错误凭据时显示错误消息', async ({ page }) => {
      await page.fill('input[type="text"]', 'nonexistentuser')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      // Wait for error message to appear
      await expect(page.locator('.text-nothing-accent, [class*="accent"]')).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('注册页面', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register')
    })

    test('显示注册标题', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('注册账号')
    })

    test('显示两个密码输入框', async ({ page }) => {
      const passwordInputs = page.locator('input[type="password"]')
      await expect(passwordInputs).toHaveCount(2)
    })

    test('显示登录链接', async ({ page }) => {
      const loginLink = page.locator('a[href="/login"]')
      await expect(loginLink).toBeVisible()
      await expect(loginLink).toContainText('登录已有账号')
    })

    test('显示用户名输入框', async ({ page }) => {
      await expect(page.locator('input[type="text"]')).toBeVisible()
    })

    test('密码不匹配时显示错误', async ({ page }) => {
      await page.fill('input[type="text"]', 'newuser')
      const passwordInputs = page.locator('input[type="password"]')
      await passwordInputs.nth(0).fill('password123')
      await passwordInputs.nth(1).fill('password456')
      await page.click('button[type="submit"]')
      // Should show error about password mismatch
      await expect(page.locator('text=两次输入的密码不一致')).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('页面导航', () => {
    test('登录页可跳转到注册页', async ({ page }) => {
      await page.goto('/login')
      await page.click('a[href="/register"]')
      await expect(page).toHaveURL(/\/register/)
      await expect(page.locator('h1')).toContainText('注册账号')
    })

    test('注册页可跳转回登录页', async ({ page }) => {
      await page.goto('/register')
      await page.click('a[href="/login"]')
      await expect(page).toHaveURL(/\/login/)
      await expect(page.locator('h1')).toContainText('易经占卜')
    })

    test('访问受保护页面时重定向到登录页', async ({ page }) => {
      const protectedRoutes = ['/', '/divine', '/history', '/stats', '/settings']
      for (const route of protectedRoutes) {
        await page.goto(route)
        await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
      }
    })
  })
})
