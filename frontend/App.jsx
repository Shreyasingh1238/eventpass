import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import RootLayout from './layouts/RootLayout'
import PageTransition from './components/PageTransition'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EventListingPage from './pages/EventListingPage'
import EventDetailsPage from './pages/EventDetailsPage'
import VolunteerDashboardPage from './pages/VolunteerDashboardPage'
import VolunteerEventsPage from './pages/VolunteerEventsPage'
import MyTicketsPage from './pages/MyTicketsPage'
import QRDisplayPage from './pages/QRDisplayPage'
import ScannerPage from './pages/ScannerPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ContactPage from './pages/ContactPage'
import TermsPage from './pages/TermsPage'
import NotFoundPage from './pages/NotFoundPage'
import {
  adminLogin,
  createPaymentOrder,
  fetchEvents,
  fetchMyTickets,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  verifyPaymentAndIssueTicket
} from './data/api'

const App = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [theme, setTheme] = useState(() => localStorage.getItem('eventpass_theme') || 'dark')
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [tickets, setTickets] = useState([])

  const loadEvents = useCallback(async () => {
    setEventsLoading(true)
    try {
      const response = await fetchEvents({ page: 1, limit: 100 })
      setEvents(response.data || [])
    } catch {
      setEvents([])
      toast.error('Failed to load events')
    } finally {
      setEventsLoading(false)
    }
  }, [])

  const loadCurrentUser = useCallback(async () => {
    try {
      const response = await getCurrentUser()
      setCurrentUser(response.data || null)
    } catch {
      setCurrentUser(null)
    }
  }, [])

  const loadMyTickets = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'user') {
      setTickets([])
      return
    }
    try {
      const response = await fetchMyTickets()
      setTickets(response.data || [])
    } catch {
      setTickets([])
    }
  }, [currentUser])

  useEffect(() => {
    loadCurrentUser()
    loadEvents()
  }, [loadCurrentUser, loadEvents])

  useEffect(() => {
    loadMyTickets()
  }, [loadMyTickets])

  useEffect(() => {
    const isLight = theme === 'light'
    document.documentElement.classList.toggle('light', isLight)
    localStorage.setItem('eventpass_theme', theme)
  }, [theme])

  const handleLogin = async (email, password, role = 'user') => {
    try {
      const response =
        role === 'admin' ? await adminLogin({ email, password }) : await loginUser({ email, password, role })
      const user = response.data.user
      setCurrentUser(user)
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error?.response?.data?.message || 'Login failed' }
    }
  }

  const handleRegister = async (payload) => {
    const response = await registerUser(payload)
    setCurrentUser(response.data.user)
    return response.data.user
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch {
      // no-op
    }
    setCurrentUser(null)
    setTickets([])
    navigate('/')
  }

  const handleMockPaymentAndBuy = async (eventId, attendee = {}) => {
    if (!currentUser) {
      toast.error('Please login first')
      navigate('/login/user')
      return
    }
    await createPaymentOrder(eventId)
    await verifyPaymentAndIssueTicket({
      eventId,
      attendeeName: attendee.fullName || '',
      attendeePhone: attendee.phone || '',
      mockSuccess: true
    })
    toast.success('Mock payment success. Ticket created')
    await loadMyTickets()
    navigate('/my-tickets')
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          element={
            <RootLayout
              currentUser={currentUser}
              onLogout={handleLogout}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        >
          <Route
            path="/"
            element={
              <PageTransition>
                <LandingPage events={events} currentUser={currentUser} />
              </PageTransition>
            }
          />
          <Route path="/login" element={<Navigate to="/login/user" replace />} />
          <Route
            path="/login/user"
            element={
              <PageTransition>
                <LoginPage onLogin={handleLogin} role="user" title="User Login" registerLink="/register/user" />
              </PageTransition>
            }
          />
          <Route
            path="/login/volunteer"
            element={
              <PageTransition>
                <LoginPage
                  onLogin={handleLogin}
                  role="volunteer"
                  title="Volunteer Login"
                  registerLink="/register/volunteer"
                />
              </PageTransition>
            }
          />
          <Route
            path="/admin/login"
            element={
              <PageTransition>
                <LoginPage onLogin={handleLogin} role="admin" title="Admin Login" registerLink="/" />
              </PageTransition>
            }
          />
          <Route path="/register" element={<Navigate to="/register/user" replace />} />
          <Route
            path="/register/user"
            element={
              <PageTransition>
                <RegisterPage onRegister={handleRegister} role="user" title="Register as User" loginLink="/login/user" />
              </PageTransition>
            }
          />
          <Route
            path="/register/volunteer"
            element={
              <PageTransition>
                <RegisterPage
                  onRegister={handleRegister}
                  role="volunteer"
                  title="Register as Volunteer"
                  loginLink="/login/volunteer"
                />
              </PageTransition>
            }
          />
          <Route
            path="/events"
            element={
              <PageTransition>
                <EventListingPage loading={eventsLoading} events={events} />
              </PageTransition>
            }
          />
          <Route
            path="/events/:id"
            element={
              <PageTransition>
                <EventDetailsPage
                  events={events}
                  currentUser={currentUser}
                  onPayAndBuy={handleMockPaymentAndBuy}
                />
              </PageTransition>
            }
          />
          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute user={currentUser} allowedRoles={['user']}>
                <PageTransition>
                  <MyTicketsPage tickets={tickets} />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/dashboard"
            element={
              <ProtectedRoute user={currentUser} allowedRoles={['volunteer']}>
                <PageTransition>
                  <VolunteerDashboardPage currentUser={currentUser} />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/events"
            element={
              <ProtectedRoute user={currentUser} allowedRoles={['volunteer']}>
                <PageTransition>
                  <VolunteerEventsPage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route path="/volunteer" element={<Navigate to="/volunteer/events" replace />} />
          <Route
            path="/scanner"
            element={
              <ProtectedRoute user={currentUser} allowedRoles={['volunteer']}>
                <PageTransition>
                  <ScannerPage currentUser={currentUser} />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ticket/:ticketId/qr"
            element={
              <ProtectedRoute user={currentUser} allowedRoles={['user']}>
                <PageTransition>
                  <QRDisplayPage tickets={tickets} onRefreshTickets={loadMyTickets} />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute user={currentUser} allowedRoles={['admin']}>
                <PageTransition>
                  <AdminDashboardPage currentUser={currentUser} />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <PageTransition>
                <ContactPage />
              </PageTransition>
            }
          />
          <Route
            path="/terms"
            element={
              <PageTransition>
                <TermsPage />
              </PageTransition>
            }
          />
          <Route
            path="*"
            element={
              <PageTransition>
                <NotFoundPage />
              </PageTransition>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default App
