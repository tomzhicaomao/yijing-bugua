/**
 * Playwright E2E test helpers — Supabase auth mocking
 *
 * Strategy: intercept Supabase REST calls at the network level and
 * inject a fake session into localStorage so the React AuthContext
 * picks it up on page load.
 */
import { type Page } from '@playwright/test'

// ── Constants ────────────────────────────────────────────────────────
const PROJECT_REF = 'hiqnvjeoaqtdkevpalvp'
const STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`

// ── Mock data ────────────────────────────────────────────────────────
export const MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'testuser@yijing-bugua.local',
  email_confirmed_at: '2026-01-01T00:00:00.000Z',
  phone: '',
  confirmation_sent_at: '',
  confirmed_at: '2026-01-01T00:00:00.000Z',
  last_sign_in_at: '2026-06-24T00:00:00.000Z',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: {},
  identities: [],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-06-24T00:00:00.000Z',
  is_anonymous: false,
}

const MOCK_SESSION = {
  access_token: 'mock-access-token-' + Date.now(),
  refresh_token: 'mock-refresh-token-' + Date.now(),
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: MOCK_USER,
}

// ── Core helpers ─────────────────────────────────────────────────────

/**
 * Set up Supabase auth mocking for a page.
 * Call this BEFORE navigating to any protected route.
 *
 * What it does:
 *  1. Intercepts all calls to the Supabase REST API
 *  2. Injects a mock session into localStorage
 */
export async function mockSupabaseAuth(page: Page) {
  // Intercept Supabase auth endpoints
  await page.route(`**/auth/v1/**`, async (route) => {
    const url = route.request().url()

    // Token exchange (signIn)
    if (url.includes('/auth/v1/token')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: MOCK_SESSION.access_token,
          refresh_token: MOCK_SESSION.refresh_token,
          expires_in: MOCK_SESSION.expires_in,
          expires_at: MOCK_SESSION.expires_at,
          token_type: MOCK_SESSION.token_type,
          user: MOCK_USER,
        }),
      })
      return
    }

    // Get user/session
    if (url.includes('/auth/v1/user') || url.includes('/auth/v1/session')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_USER),
      })
      return
    }

    // Logout
    if (url.includes('/auth/v1/logout')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      return
    }

    // Refresh token
    if (url.includes('/auth/v1/token?grant_type=refresh_token')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-refreshed-token-' + Date.now(),
          refresh_token: MOCK_SESSION.refresh_token,
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: MOCK_USER,
        }),
      })
      return
    }

    // Default: pass through
    await route.continue()
  })

  // Also intercept Supabase REST API (PostgREST) for data queries
  await page.route(`**/rest/v1/**`, async (route) => {
    // Return empty arrays for most queries
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
      headers: {
        'content-range': '0-0/0',
        'content-profile': 'public',
      },
    })
  })
}

/**
 * Inject mock auth session into localStorage.
 * Must be called AFTER page.goto() so the origin is set.
 */
export async function injectAuthSession(page: Page) {
  await page.evaluate(
    ({ key, session }) => {
      localStorage.setItem(key, JSON.stringify(session))
    },
    { key: STORAGE_KEY, session: MOCK_SESSION }
  )
}

/**
 * Full login flow: mock APIs + inject session + navigate
 */
export async function loginAsTestUser(page: Page) {
  await mockSupabaseAuth(page)
  await page.goto('/')
  await injectAuthSession(page)
  // Reload so AuthContext picks up the session
  await page.reload()
  // Wait for the app to fully load and recognize the session
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(300)
}

/**
 * Clear auth session from localStorage
 */
export async function clearAuthSession(page: Page) {
  await page.evaluate((key) => {
    localStorage.removeItem(key)
  }, STORAGE_KEY)
}

/**
 * Intercept the records API to return mock data
 */
export async function mockRecordsApi(page: Page, records: unknown[] = []) {
  await page.route(`**/rest/v1/records*`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(records),
        headers: {
          'content-range': `0-${records.length - 1}/${records.length}`,
        },
      })
    } else {
      // POST/PATCH/DELETE — return success
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      })
    }
  })
}

/**
 * Generate a mock divination record
 */
export function createMockRecord(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: crypto.randomUUID?.() ?? '00000000-0000-0000-0000-000000000099',
    schema_version: 1,
    timestamp: new Date().toISOString(),
    question: '测试问题：今天适合做什么？',
    category: '其他',
    method: 'virtual',
    hexagram: {
      original: { number: 1, name: '乾', lines: [7, 7, 7, 7, 7, 7] },
      changed: null,
      changing_lines: [],
      mutual: null,
    },
    interpretations: [
      {
        id: 'mock-interp-1',
        model: 'deepseek-chat',
        summary: '乾卦象征天，代表刚健中正、自强不息。',
        claims: [
          { id: 'c1', text: '此卦利于行动', status: null },
          { id: 'c2', text: '事业有上升趋势', status: null },
        ],
        created_at: new Date().toISOString(),
      },
    ],
    feedback: {
      due_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: 'pending',
      detail: null,
    },
    user_id: MOCK_USER.id,
    ...overrides,
  }
}
