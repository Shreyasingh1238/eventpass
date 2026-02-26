import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, NavLink, useNavigate } from 'react-router-dom'

const baseLinks = [
  { to: '/events', label: 'Events' },
  { to: '/contact', label: 'Contact' },
  { to: '/terms', label: 'Terms' }
]

const Navbar = ({ currentUser, onLogout, theme, onToggleTheme }) => {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const dashboardPath = useMemo(() => {
    if (!currentUser) return null
    if (currentUser.role === 'admin') return '/admin/dashboard'
    if (currentUser.role === 'volunteer') return '/volunteer/dashboard'
    return '/events'
  }, [currentUser])

const links = useMemo(() => {
    if (currentUser?.role === 'admin') return [{ to: '/admin/dashboard', label: 'Admin' }, ...baseLinks]
    if (currentUser?.role === 'volunteer') {
      return [{ to: '/volunteer/events', label: 'Volunteer' }, { to: '/scanner', label: 'Scanner' }, ...baseLinks]
    }
    if (currentUser?.role === 'user') return [{ to: '/my-tickets', label: 'My Tickets' }, ...baseLinks]
    return baseLinks
  }, [currentUser])

  return (
    <header
      className={`sticky top-2 z-50 mx-auto w-[96%] max-w-7xl rounded-2xl border backdrop-blur-xl transition-all ${
        scrolled
          ? 'border-cyan-400/25 bg-slate-950/55 shadow-[0_10px_30px_rgba(0,0,0,0.35)]'
          : 'border-slate-600/35 bg-slate-900/35'
      }`}
    >
      <nav className="mx-auto flex w-full items-center justify-between gap-3 px-3 py-3 sm:px-6">
        <Link to="/" className="text-lg font-semibold tracking-tight text-white">
          EventPass <span className="text-cyan-400">Pro</span>
        </Link>

        <div className="hidden items-center gap-4 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-md px-2 py-1 text-sm transition ${
                  isActive ? 'bg-cyan-400/15 text-cyan-300' : 'text-slate-300 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            onClick={onToggleTheme}
            className="animated-btn rounded-lg border border-slate-500 px-3 py-1.5 text-sm text-slate-100"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          {currentUser ? (
            <>
              {currentUser.role !== 'user' && (
                <button
                  onClick={() => navigate(dashboardPath)}
                  className="animated-btn rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200"
                >
                  Dashboard
                </button>
              )}
              <button
                onClick={onLogout}
                className="animated-btn rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1.5 text-sm font-medium text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login/user"
                className="animated-btn rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200"
              >
                User Login
              </Link>
              <Link
                to="/login/volunteer"
                className="animated-btn rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200"
              >
                Volunteer Login
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-200 lg:hidden"
        >
          Menu
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-slate-700/50 lg:hidden"
          >
            <div className="grid gap-1 p-3">
              <button
                onClick={() => {
                  onToggleTheme()
                  setMobileOpen(false)
                }}
                className="rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800/70"
              >
                Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </button>

              {currentUser ? (
                <>
                  {currentUser.role !== 'user' && (
                    <button
                      onClick={() => {
                        navigate(dashboardPath)
                        setMobileOpen(false)
                      }}
                      className="rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800/70"
                    >
                      Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onLogout()
                      setMobileOpen(false)
                    }}
                    className="rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800/70"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login/user"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800/70"
                  >
                    User Login
                  </NavLink>
                  <NavLink
                    to="/login/volunteer"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800/70"
                  >
                    Volunteer Login
                  </NavLink>
                  <NavLink
                    to="/register/user"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800/70"
                  >
                    Register User
                  </NavLink>
                  <NavLink
                    to="/register/volunteer"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800/70"
                  >
                    Register Volunteer
                  </NavLink>
                </>
              )}

              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm ${
                      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-200 hover:bg-slate-800/70'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
