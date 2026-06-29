import { test, expect } from '@playwright/test'
import { loginAsTestUser } from './helpers/auth'

test.describe('起卦流程测试（完整 4 步向导）', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('进入起卦页面，显示步骤指示器', async ({ page }) => {
    await page.goto('/divine')
    await page.waitForTimeout(500)

    // Step indicator should be visible
    const stepIndicator = page.locator('.step-dot, [class*="step"]')
    await expect(stepIndicator.first()).toBeVisible()

    // Should show step 1 content — question input
    await expect(page.locator('h1:has-text("你想问什么")')).toBeVisible()
  })

  test('步骤 1：输入问题和选择分类', async ({ page }) => {
    await page.goto('/divine')
    await page.waitForTimeout(500)

    // Type a question
    const textarea = page.locator('textarea')
    await expect(textarea).toBeVisible()
    await textarea.fill('今天天气如何？')

    // Verify character count updates
    await expect(page.locator('text=/\\/100/')).toBeVisible()

    // Select a category
    const categoryTag = page.locator('button:has-text("工作"), span:has-text("工作")')
    await categoryTag.first().click()

    // Click next
    const nextBtn = page.locator('button:has-text("下一步"), button:has-text("NEXT")')
    await expect(nextBtn.first()).toBeEnabled()
    await nextBtn.first().click()

    // Should advance to step 2
    await expect(page.locator('h1:has-text("记录你的判断")')).toBeVisible({ timeout: 5000 })
  })

  test('步骤 2：记录预判信息（可选）', async ({ page }) => {
    await page.goto('/divine')
    await page.waitForTimeout(500)

    // Fill step 1
    await page.locator('textarea').fill('测试问题')
    await page.locator('button:has-text("工作"), span:has-text("工作")').first().click()
    await page.locator('button:has-text("下一步"), button:has-text("NEXT")').first().click()

    // Step 2 should be visible
    await expect(page.locator('h1:has-text("记录你的判断")')).toBeVisible({ timeout: 5000 })

    // Optional fields should be visible
    await expect(page.locator('text=YOUR EXPECTATION')).toBeVisible()
    await expect(page.locator('text=CONFIDENCE')).toBeVisible()
    await expect(page.locator('text=INTENDED ACTION')).toBeVisible()

    // Fill optional expectation
    const expectationInput = page.locator('input[placeholder*="预期"], input[placeholder*="期望"], input[placeholder*="结果"]')
    if (await expectationInput.count() > 0) {
      await expectationInput.first().fill('我觉得会顺利')
    }

    // Select confidence (click a number)
    const confidenceButtons = page.locator('button:has-text("3")')
    if (await confidenceButtons.count() > 0) {
      await confidenceButtons.first().click()
    }

    // Continue
    const continueBtn = page.locator('button:has-text("保存并继续"), button:has-text("跳过")')
    await expect(continueBtn.first()).toBeVisible()
    await continueBtn.first().click()

    // Should advance to step 3
    await expect(page.locator('h1:has-text("选择起卦方式")')).toBeVisible({ timeout: 5000 })
  })

  test('步骤 3：选择起卦方式', async ({ page }) => {
    await page.goto('/divine')
    await page.waitForTimeout(500)

    // Navigate through steps 1 & 2
    await page.locator('textarea').fill('测试问题')
    await page.locator('button:has-text("工作"), span:has-text("工作")').first().click()
    await page.locator('button:has-text("下一步"), button:has-text("NEXT")').first().click()
    await expect(page.locator('h1:has-text("记录你的判断")')).toBeVisible({ timeout: 5000 })
    await page.locator('button:has-text("跳过")').first().click()

    // Step 3: Method selection
    await expect(page.locator('h1:has-text("选择起卦方式")')).toBeVisible({ timeout: 5000 })

    // Should show two methods
    await expect(page.locator('p:has-text("虚拟摇卦")').first()).toBeVisible()
    await expect(page.locator('text=手动输入')).toBeVisible()
    await expect(page.locator('text=THREE COINS')).toBeVisible()
    await expect(page.locator('text=MANUAL ENTRY')).toBeVisible()

    // Select virtual method and start
    await page.locator('p:has-text("虚拟摇卦")').first().click()
    const castBtn = page.locator('button:has-text("开始起卦"), button:has-text("CAST")')
    await expect(castBtn.first()).toBeVisible()
    await castBtn.first().click()

    // Should advance to step 4 (casting)
    await expect(page.locator('h1:has-text("虚拟摇卦")')).toBeVisible({ timeout: 5000 })
  })

  test('步骤 4：虚拟摇卦界面显示铜钱', async ({ page }) => {
    await page.goto('/divine')
    await page.waitForTimeout(500)

    // Navigate to step 4
    await page.locator('textarea').fill('测试问题')
    await page.locator('button:has-text("工作"), span:has-text("工作")').first().click()
    await page.locator('button:has-text("下一步"), button:has-text("NEXT")').first().click()
    await expect(page.locator('h1:has-text("记录你的判断")')).toBeVisible({ timeout: 5000 })
    await page.locator('button:has-text("跳过")').first().click()
    await expect(page.locator('h1:has-text("选择起卦方式")')).toBeVisible({ timeout: 5000 })
    await page.locator('p:has-text("虚拟摇卦")').first().click()
    await page.locator('button:has-text("开始起卦"), button:has-text("CAST")').first().click()

    // Step 4: Casting
    await expect(page.locator('h1:has-text("虚拟摇卦")')).toBeVisible({ timeout: 5000 })

    // Should show 3 coins
    const coins = page.locator('[data-testid="coin"]')
    await expect(coins).toHaveCount(3)

    // Should show line progress
    await expect(page.locator('text=初爻').first()).toBeVisible()
    await expect(page.locator('text=1/6').first()).toBeVisible()

    // Should show hexagram board
    await expect(page.locator('text=本卦').first()).toBeVisible()
  })

  test('步骤 4：掷铜钱动画和结果', async ({ page }) => {
    await page.goto('/divine')
    await page.waitForTimeout(500)

    // Navigate to step 4
    await page.locator('textarea').fill('测试问题')
    await page.locator('button:has-text("工作"), span:has-text("工作")').first().click()
    await page.locator('button:has-text("下一步"), button:has-text("NEXT")').first().click()
    await expect(page.locator('h1:has-text("记录你的判断")')).toBeVisible({ timeout: 5000 })
    await page.locator('button:has-text("跳过")').first().click()
    await expect(page.locator('h1:has-text("选择起卦方式")')).toBeVisible({ timeout: 5000 })
    await page.locator('p:has-text("虚拟摇卦")').first().click()
    await page.locator('button:has-text("开始起卦"), button:has-text("CAST")').first().click()
    await expect(page.locator('h1:has-text("虚拟摇卦")')).toBeVisible({ timeout: 5000 })

    // Click a coin to toss using evaluate
    await page.evaluate(() => {
      const coin = document.querySelector('[data-testid="coin"]')
      if (coin) (coin as HTMLElement).click()
    })

    // Wait for animation and auto-confirm (longer timeout)
    await page.waitForTimeout(3000)

    // Should show result (背/字 count and line value)
    const resultSection = page.locator('text=/\\d+ 背 \\d+ 字/')
    await expect(resultSection).toBeVisible({ timeout: 10000 })
  })

})
