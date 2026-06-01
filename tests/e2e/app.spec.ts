import { test, expect } from '@playwright/test'

test.describe('yijing-bugua 完整流程测试', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.evaluate(() => {
      indexedDB.deleteDatabase('yijing-bugua')
      localStorage.clear()
    })
  })

  test('1. 首页加载', async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await expect(page.locator('h1')).toContainText('易经占卜')
    await expect(page.getByRole('link', { name: '开始起卦' })).toBeVisible()
    await expect(page.getByRole('navigation').getByRole('link', { name: '历史' })).toBeVisible()
  })

  test('2. 导航', async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.getByRole('navigation').getByRole('link', { name: '历史' }).click()
    await expect(page.locator('h2')).toContainText('历史记录')

    await page.goto("http://localhost:5173/stats")
    await expect(page.locator('h2')).toContainText('统计面板')

    await page.goto("http://localhost:5173/settings")
    await expect(page.getByText('DeepSeek API Key')).toBeVisible()
  })

  test('3. 设置 - API Key 保存', async ({ page }) => {
    await page.goto('http://localhost:5173/settings')
    await page.locator('input[type="password"]').fill('sk-test-key-12345')
    await page.getByRole('button', { name: '保存' }).click()
    await expect(page.getByText('已保存')).toBeVisible()
  })

  test('4. 手动起卦完整流程', async ({ page }) => {
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

  test('5. 历史记录 - 空状态和记录显示', async ({ page }) => {
    await page.goto('http://localhost:5173/history')
    await expect(page.getByText('暂无记录')).toBeVisible()

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
    await page.goto('http://localhost:5173/history')
    await expect(page.getByText('测试历史')).toBeVisible()
  })

  test('6. 设置 - 版本信息', async ({ page }) => {
    await page.goto('http://localhost:5173/settings')
    await expect(page.getByText('版本信息')).toBeVisible()
    await expect(page.getByRole('button', { name: '导出数据' })).toBeVisible()
    await expect(page.getByRole('button', { name: '导入数据' })).toBeVisible()
  })

  test('7. 无 API Key 时规则引擎回退', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('deepseek-api-key'))
    await page.goto('http://localhost:5173/divine')
    await page.fill('textarea', '无API测试')
    await page.getByRole('button', { name: '人际' }).click()
    await page.getByRole('button', { name: '下一步' }).click()
    await page.getByRole('button', { name: '保存并继续' }).click()
    await page.getByRole('button', { name: '手动输入' }).click()
    await page.getByRole('button', { name: '开始起卦' }).click()
    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: '2 背' }).click()
    }
    await page.waitForURL(/\/result\//)
    await expect(page.getByText('暂无 AI 解读')).toBeVisible()
  })
})
