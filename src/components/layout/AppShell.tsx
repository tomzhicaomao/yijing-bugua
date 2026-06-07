import { Outlet } from 'react-router-dom'

export default function AppShell() {
  return (
    <div className="min-h-svh flex flex-col">
      <Outlet />
    </div>
  )
}
