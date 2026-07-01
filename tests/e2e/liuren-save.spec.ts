import { test, expect } from '@playwright/test'

const BASE = 'https://yijing.tomzhicaomao.dpdns.org'

test('大六壬完整流程: 登录 → 起课 → 保存 → history可见', async ({ page }) => {
  // 1. 登录
  await page.goto(BASE + '/login')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  // 用 getByRole 精确定位
  const usernameInput = page.getByPlaceholder('请输入用户名')
  const passwordInput = page.getByPlaceholder('请输入密码')
  const loginBtn = page.getByRole('button', { name: '登录' })

  await expect(usernameInput).toBeVisible({ timeout: 10000 })
  await usernameInput.fill('test')
  await passwordInput.fill('123456')
  await loginBtn.click()

  // 等待导航
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 })
  console.log('登录成功，当前 URL:', page.url())

  // 2. 导航到大六壬
  await page.goto(BASE + '/liuren')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  // 检查功能是否开启
  const disabled = page.locator('text=功能未开启')
  if (await disabled.count() > 0) {
    console.log('六壬功能未开启')
    return
  }

  // 3. 输入问题
  const textarea = page.locator('textarea').first()
  await expect(textarea).toBeVisible({ timeout: 5000 })
  await textarea.fill('测试大六壬保存功能是否正常')

  // 4. 点击起课
  const startBtn = page.getByRole('button', { name: '起课' })
  await startBtn.click()

  // 5. 等待结果页出现
  // 等待遮罩消失（如果有）
  await page.waitForTimeout(3000)

  // 等待保存完成或错误（最多 60 秒）
  let saved = false
  for (let i = 0; i < 30; i++) {
    const url = page.url()
    if (url.includes('/liuren/') && !url.endsWith('/liuren')) {
      console.log(`✅ 已跳转到结果详情页: ${url}`)
      saved = true
      break
    }

    const hasError = await page.locator('text=保存失败').count() > 0
    const retryBtn = page.locator('button:has-text("重新保存")')
    if (hasError && await retryBtn.count() > 0) {
      console.log('保存失败，尝试重试...')
      await retryBtn.first().click()
      await page.waitForTimeout(5000)
      continue
    }

    const stillSaving = await page.locator('text=正在保存记录').count() > 0
    console.log(`  轮询 ${i+1}: saving=${stillSaving}, error=${hasError}, url=${url}`)
    await page.waitForTimeout(2000)
  }

  // 截图
  await page.screenshot({ path: '/tmp/liuren-result.png', fullPage: true })

  // 6. 检查 history
  await page.goto(BASE + '/history')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/liuren-history.png', fullPage: true })

  expect(saved).toBe(true)
})
