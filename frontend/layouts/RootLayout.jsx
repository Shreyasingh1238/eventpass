import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ScrollProgress from '../components/ScrollProgress'

const RootLayout = ({ currentUser, onLogout, theme, onToggleTheme }) => (
  <div className="min-h-screen">
    <ScrollProgress />
    <Navbar currentUser={currentUser} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <Outlet />
    </main>
    <footer className="mt-16 border-t border-slate-700/40 py-8 text-center text-sm text-slate-500">
      Copyright 2026 EventPass Pro. All rights reserved.
    </footer>
  </div>
)

export default RootLayout

