import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import HomeView from './pages/HomeView'
import DivineView from './pages/DivineView'
import ResultView from './pages/ResultView'
import HistoryView from './pages/HistoryView'
import HistoryDetailView from './pages/HistoryDetailView'
import StatsView from './pages/StatsView'
import SettingsView from './pages/SettingsView'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomeView />} />
          <Route path="/divine" element={<DivineView />} />
          <Route path="/result/:id" element={<ResultView />} />
          <Route path="/history" element={<HistoryView />} />
          <Route path="/history/:id" element={<HistoryDetailView />} />
          <Route path="/stats" element={<StatsView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
