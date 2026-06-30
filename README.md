# 易经占卜 + 大六壬

React web app for I Ching divination and Da Liu Ren (大六壬) — one of the Three Styles of Chinese metaphysics.

## Features

- **铜钱摇卦**: Virtual coin casting with animated 3D coins
- **大六壬**: 正时/活时起课，完整天地盘、四课、三传、九宗门算法
- **AI 解读**: LLM-based interpretation with confidence scoring
- **历史记录**: Supabase-backed persistence with feedback tracking
- **PWA**: Installable on mobile

## Quick Start

```bash
npm install
npm run dev          # http://localhost:3000
```

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build (tsc + vite)
npm run test         # Unit tests (Vitest)
npx playwright test  # E2E tests (Playwright)
```

## Environment

Create `.env` with:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Deploy

Auto-deploys to Vercel on push to `main`.

## Tech Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Supabase · GSAP · Playwright
