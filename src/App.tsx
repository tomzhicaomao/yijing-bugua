import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import HomeView from './pages/HomeView'
import DivineView from './pages/DivineView'
import ResultView from './pages/ResultView'
import HistoryView from './pages/HistoryView'
import HistoryDetailView from './pages/HistoryDetailView'
import StatsView from './pages/StatsView'
import SettingsView from './pages/SettingsView'
import Login from './auth/Login'
import Register from './auth/Register'
import { FEATURE_LIUREN_ENABLED } from './lib/constants'

// 六壬模块 - 懒加载
const LiurenView = lazy(() => import('./pages/LiurenView'))
const LiurenResultView = lazy(() => import('./pages/LiurenResultView'))

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-nothing-bg flex items-center justify-center">
      <div className="space-y-2 w-48">
        <div className="h-4 bg-nothing-bg-secondary rounded animate-pulse" />
        <div className="h-4 bg-nothing-bg-secondary rounded animate-pulse w-3/4" />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route path="/" element={<HomeView />} />
            <Route path="/divine" element={<DivineView />} />
            <Route path="/result/:id" element={<ResultView />} />
            <Route path="/history" element={<HistoryView />} />
            <Route path="/history/:id" element={<HistoryDetailView />} />
            <Route path="/stats" element={<StatsView />} />
            <Route path="/settings" element={<SettingsView />} />

            {/* 六壬路由 */}
            {FEATURE_LIUREN_ENABLED && (
              <>
                <Route path="/liuren" element={
                  <Suspense fallback={<PageSkeleton />}>
                    <ProtectedRoute><LiurenView /></ProtectedRoute>
                  </Suspense>
                } />
                <Route path="/liuren/:id" element={
                  <Suspense fallback={<PageSkeleton />}>
                    <ProtectedRoute><LiurenResultView /></ProtectedRoute>
                  </Suspense>
                } />
              </>
            )}
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
