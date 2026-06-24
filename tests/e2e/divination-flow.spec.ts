import { test, expect } from '@playwright/test'

test.describe('Divination flow', () => {

  test('divination page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/divine')
    await page.waitForURL('**/login')
    await expect(page.locator('h1')).toContainText('易经占卜')
  })

  test('history page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/history')
    await page.waitForURL('**/login')
    await expect(page.locator('h1')).toContainText('易经占卜')
  })

  test('login page has working register link', async ({ page }) => {
    await page.goto('/login')
    await page.click('text=注册新账号')
    await expect(page.locator('h1')).toContainText('注册账号')
  })

  test('login page shows login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('register page shows registration form', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('h1')).toContainText('注册账号')
    await expect(page.locator('input[type="password"]')).toHaveCount(2)
  })
})
