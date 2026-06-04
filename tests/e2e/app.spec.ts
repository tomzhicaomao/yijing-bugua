import { test, expect } from '@playwright/test'

test.describe('yijing-bugua 完整流程测试', () => {

  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB and localStorage
    await page.goto('http://localhost:5173/')
    await page.evaluate(() => {
      indexedDB.deleteDatabase('yijing-bugua')
      localStorage.clear()
    })
  })

  test('1. 首页加载 - 重定向到登录页', async ({ page }) => {
    await page.goto('http://localhost:5173/')
    // Should redirect to login page
    await expect(page.locator('h2')).toContainText('登录易经占卜')
  })

  test('2. 注册和登录流程', async ({ page }) => {
    // Go to register page
    await page.goto('http://localhost:5173/register')
    await expect(page.locator('h2')).toContainText('注册易经占卜')

    // Fill registration form
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', 'testpass123')
    await page.fill('input[name="confirmPassword"]', 'testpass123')
    
    // Submit registration
    await page.getByRole('button', { name: '注册' }).click()
    
    // Wait for redirect to login page
    await page.waitForURL('**/login')
    await expect(page.locator('h2')).toContainText('登录易经占卜')

    // Login
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', 'testpass123')
    await page.getByRole('button', { name: '登录' }).click()
    
    // Wait for redirect to home page
    await page.waitForURL('**/')
    await expect(page.locator('h1')).toContainText('易经占卜')
  })

  test('3. 导航', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/login')
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', 'testpass123')
    await page.getByRole('button', { name: '登录' }).click()
    await page.waitForURL('**/')

    // Navigate to history
    await page.getByRole('navigation').getByRole('link', { name: '历史' }).click()
    await expect(page.locator('h2')).toContainText('历史记录')

    // Navigate to stats
    await page.goto('http://localhost:5173/stats')
    await expect(page.locator('h2')).toContainText('统计面板')

    // Navigate to settings
    await page.goto('http://localhost:5173/settings')
    await expect(page.getByText('设置')).toBeVisible()
  })

  test('4. 设置 - API Key 保存', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/login')
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', 'testpass123')
    await page.getByRole('button', { name: '登录' }).click()
    await page.waitForURL('**/')

    // Go to settings
    await page.goto('http://localhost:5173/settings')
    await page.locator('input[type="password"]').fill('sk-test-key-12345')
    await page.getByRole('button', { name: '保存' }).first().click()
    await expect(page.getByText('已保存')).toBeVisible()
  })

  test('5. 手动起卦完整流程', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/login')
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', 'testpass123')
    await page.getByRole('button', { name: '登录' }).click()
    await page.waitForURL('**/')

    // Go to divination
    await page.goto('http://localhost:5173/divine')
    await page.fill('textarea', '这次项目能顺利上线吗')
    await page.getByRole('button', { name: '财务' }).click()
    await page.getByRole('button', { name: '下一步' }).click()
    await page.getByRole('button', { name: '保存并继续' }).click()
    await page.getByRole('button', { name: '手动输入' }).click()
    await page.getByRole('button', { name: '开始起卦' }).click()

    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: '2 背' }).click()
    }

    await page.waitForURL(/\/result\//)
    await expect(page.getByText('卦辞')).toBeVisible()
    await expect(page.getByText('反馈结果')).toBeVisible()
  })

  test('6. 历史记录 - 空状态和记录显示', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/login')
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', 'testpass123')
    await page.getByRole('button', { name: '登录' }).click()
    await page.waitForURL('**/')

    // Check empty history
    await page.goto('http://localhost:5173/history')
    await expect(page.getByText('暂无记录')).toBeVisible()

    // Do a quick divination  
    await page.goto('http://localhost:5173/divine')
    await page.fill('textarea', '测试历史')
    await page.getByRole('button', { name: '其他' }).click()
    await page.getByRole('button', { name: '下一步' }).click()
    await page.getByRole('button', { name: '保存并继续' }).click()
    await page.getByRole('button', { name: '手动输入' }).click()
    await page.getByRole('button', { name: '开始起卦' }).click()
    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: '2 背' }).click()
    }
    await page.waitForURL(/\/result\//)
    
    // Check history has record
    await page.goto('http://localhost:5173/history')
    await expect(page.getByText('测试历史')).toBeVisible()
  })

  test('7. 设置 - 版本信息', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/login')
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', 'testpass123')
    await page.getByRole('button', { name: '登录' }).click()
    await page.waitForURL('**/')

    // Go to settings
    await page.goto('http://localhost:5173/settings')
    await expect(page.getByText('版本信息')).toBeVisible()
    await expect(page.getByRole('button', { name: '导出数据' })).toBeVisible()
    await expect(page.getByRole('button', { name: '导入数据' })).toBeVisible()
  })
})
