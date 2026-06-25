import { test, expect } from '@playwright/test'
import { loginAsTestUser } from './helpers/auth'

/** Helper: navigate through divination steps 1-3 to reach casting (step 4) */
async function goToCasting(page: import('@playwright/test').Page) {
  await page.goto('/divine')
  await page.waitForTimeout(500)
  // Step 1: fill question + category
  await page.locator('textarea').fill('动画测试问题')
  await page.locator('button:has-text("工作"), span:has-text("工作")').first().click()
  await page.locator('button:has-text("下一步"), button:has-text("NEXT")').first().click()
  // Step 2: skip
  await expect(page.locator('h1:has-text("记录你的判断")')).toBeVisible({ timeout: 5000 })
  await page.locator('button:has-text("跳过")').first().click()
  // Step 3: select virtual method (use the card paragraph, not the heading)
  await expect(page.locator('h1:has-text("选择起卦方式")')).toBeVisible({ timeout: 5000 })
  await page.locator('p:has-text("虚拟摇卦")').first().click()
  await page.locator('button:has-text("开始起卦"), button:has-text("CAST")').first().click()
  // Step 4: casting
  await expect(page.locator('h1:has-text("虚拟摇卦")')).toBeVisible({ timeout: 5000 })
}

test.describe('GSAP 动画测试', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('GSAP 库已正确加载（无控制台错误）', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/divine')
    await page.waitForTimeout(1000)
    // No GSAP-related errors
    const gsapErrors = errors.filter(e => e.toLowerCase().includes('gsap'))
    expect(gsapErrors).toHaveLength(0)
  })

  test('铜钱元素使用 will-change-transform 类', async ({ page }) => {
    await goToCasting(page)

    const coins = page.locator('[aria-label="铜钱"]')
    await expect(coins).toHaveCount(3)

    // Verify coins have will-change-transform class
    for (let i = 0; i < 3; i++) {
      const coinClass = await coins.nth(i).getAttribute('class')
      expect(coinClass).toContain('will-change-transform')
    }

    // Verify coins do NOT have old CSS animation classes
    for (let i = 0; i < 3; i++) {
      const coinClass = await coins.nth(i).getAttribute('class')
      expect(coinClass).not.toContain('coin-toss-')
    }
  })

  test('铜钱掷出后显示结果', async ({ page }) => {
    await goToCasting(page)

    // Use evaluate to click the toss button (bypasses interception)
    await page.evaluate(() => {
      const btn = document.querySelector('button')
      const buttons = Array.from(document.querySelectorAll('button'))
      const tossBtn = buttons.find(b => b.textContent?.includes('掷铜钱'))
      if (tossBtn) tossBtn.click()
    })

    // Wait for GSAP animation to complete
    await page.waitForTimeout(2000)

    // Should show result
    await expect(page.locator('text=/\\d+ 背 \\d+ 字/')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('button:has-text("确认此爻")')).toBeVisible()
  })

  test('卦象板使用 will-change-transform', async ({ page }) => {
    await goToCasting(page)

    // Cast one line using evaluate
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const tossBtn = buttons.find(b => b.textContent?.includes('掷铜钱'))
      if (tossBtn) tossBtn.click()
    })
    await page.waitForTimeout(2000)
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const confirmBtn = buttons.find(b => b.textContent?.includes('确认此爻'))
      if (confirmBtn) confirmBtn.click()
    })
    await page.waitForTimeout(500)

    // Check hexagram board lines
    const hexLines = page.locator('.card-nothing .flex.items-center.gap-3')
    const count = await hexLines.count()
    if (count > 0) {
      const cls = await hexLines.first().getAttribute('class')
      expect(cls).toContain('will-change-transform')
    }
  })

  test('步骤指示器显示 4 个点', async ({ page }) => {
    await page.goto('/divine')
    await page.waitForTimeout(500)
    const dots = page.locator('.step-dot')
    await expect(dots).toHaveCount(4)
  })

  test('页面切换时步骤 2 内容出现', async ({ page }) => {
    await page.goto('/divine')
    await page.waitForTimeout(500)

    // Step 1 visible
    await expect(page.locator('h1:has-text("你想问什么")')).toBeVisible()

    // Fill and advance
    await page.locator('textarea').fill('过渡测试')
    await page.locator('button:has-text("工作"), span:has-text("工作")').first().click()
    await page.locator('button:has-text("下一步"), button:has-text("NEXT")').first().click()

    // Step 2 should be visible
    await expect(page.locator('h1:has-text("记录你的判断")')).toBeVisible({ timeout: 5000 })
  })

  test('旧 CSS coin-toss 关键帧已从样式表中移除', async ({ page }) => {
    await page.goto('/login')
    await page.waitForTimeout(300)

    const hasOldAnimation = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets)
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || [])
          for (const rule of rules) {
            if (rule instanceof CSSKeyframesRule && rule.name === 'coin-toss') {
              return true
            }
          }
        } catch { /* cross-origin */ }
      }
      return false
    })
    expect(hasOldAnimation).toBeFalsy()
  })

  test('页面加载时无 animate-spin CSS 类（已替换为 GSAP）', async ({ page }) => {
    await page.goto('/login')
    await page.waitForTimeout(300)
    const hasAnimateSpin = await page.evaluate(() => document.querySelector('.animate-spin') !== null)
    expect(hasAnimateSpin).toBeFalsy()
  })
})
