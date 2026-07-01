import { test, expect } from '@playwright/test'

test('Debug Supabase connection', async ({ page }) => {
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', err => errors.push(err.message))

  await page.goto('https://yijing.tomzhicaomao.dpdns.org/login')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(3000)

  // Check what env vars are available
  const envCheck = await page.evaluate(() => {
    return {
      hasSupabaseUrl: typeof (window as any).__VITE_SUPABASE_URL__,
      location: window.location.href,
    }
  })

  console.log('Errors:', JSON.stringify(errors, null, 2))
  console.log('Env check:', JSON.stringify(envCheck, null, 2))

  // Try to fill in login form and watch network
  const usernameInput = page.getByPlaceholder('请输入用户名')
  const passwordInput = page.getByPlaceholder('请输入密码')
  const loginBtn = page.getByRole('button', { name: '登录' })

  await usernameInput.fill('test')
  await passwordInput.fill('123456')

  // Watch for network requests
  const requests: string[] = []
  page.on('request', req => {
    if (req.url().includes('supabase')) {
      requests.push(`${req.method()} ${req.url()}`)
    }
  })
  page.on('response', res => {
    if (res.url().includes('supabase')) {
      requests.push(`RESPONSE ${res.status()} ${res.url()}`)
    }
  })

  await loginBtn.click()
  await page.waitForTimeout(5000)

  console.log('Supabase requests:', JSON.stringify(requests, null, 2))
  console.log('Console errors:', JSON.stringify(errors, null, 2))

  await page.screenshot({ path: '/tmp/debug-supabase.png', fullPage: true })
})
