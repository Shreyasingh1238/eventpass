import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  withCredentials: true
})

export const fetchEvents = async (params = {}) => {
  const { data } = await api.get('/events', { params })
  return data
}

export const fetchEventById = async (eventId) => {
  const { data } = await api.get(`/events/${eventId}`)
  return data
}

export const fetchEventAttendees = async (eventId) => {
  const { data } = await api.get(`/events/${eventId}/attendees`)
  return data
}

export const fetchEventFeedback = async (eventId) => {
  const { data } = await api.get(`/events/${eventId}/feedback`)
  return data
}

export const createEventFeedback = async (eventId, payload) => {
  const { data } = await api.post(`/events/${eventId}/feedback`, payload)
  return data
}

export const registerUser = async (payload) => {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export const loginUser = async (payload) => {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export const adminLogin = async (payload) => {
  const { data } = await api.post('/admin/auth/login', payload)
  return data
}

export const logoutUser = async () => {
  const { data } = await api.post('/auth/logout')
  return data
}

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me')
  return data
}

export const buyTicket = async (eventId) => {
  const { data } = await api.post('/tickets/buy', { eventId })
  return data
}

export const createPaymentOrder = async (eventId) => {
  const { data } = await api.post('/payments/create-order', { eventId })
  return data
}

export const verifyPaymentAndIssueTicket = async (payload) => {
  const { data } = await api.post('/payments/verify', payload)
  return data
}

export const fetchMyTickets = async () => {
  const { data } = await api.get('/tickets/my')
  return data
}

export const verifyCheckin = async (ticketId) => {
  const { data } = await api.post('/checkin/verify', { ticketId })
  return data
}

export const fetchAdminSales = async (params = {}) => {
  const { data } = await api.get('/admin/sales', { params })
  return data
}

export const fetchAdminCheckins = async () => {
  const { data } = await api.get('/admin/checkins')
  return data
}

export const fetchAdminEvents = async (params = {}) => {
  const { data } = await api.get('/admin/events', { params })
  return data
}

export const createAdminEvent = async (payload) => {
  const { data } = await api.post('/admin/events', payload)
  return data
}

export const updateAdminEvent = async (id, payload) => {
  const { data } = await api.put(`/admin/events/${id}`, payload)
  return data
}

export const deleteAdminEvent = async (id) => {
  const { data } = await api.delete(`/admin/events/${id}`)
  return data
}

export const fetchAdminEventRequests = async (params = {}) => {
  const { data } = await api.get('/admin/event-requests', { params })
  return data
}

export const approveEventRequest = async (id) => {
  const { data } = await api.patch(`/admin/event-requests/${id}/approve`)
  return data
}

export const rejectEventRequest = async (id, reason = '') => {
  const { data } = await api.patch(`/admin/event-requests/${id}/reject`, { reason })
  return data
}

export const fetchAdminOverview = async () => {
  const { data } = await api.get('/admin/analytics/overview')
  return data
}

export const fetchAdminCharts = async () => {
  const { data } = await api.get('/admin/analytics/charts')
  return data
}

export const createVolunteerEventRequest = async (payload) => {
  const { data } = await api.post('/volunteer/event-requests', payload)
  return data
}

export const fetchVolunteerEventRequests = async () => {
  const { data } = await api.get('/volunteer/event-requests/me')
  return data
}

export const fetchVolunteerDashboard = async () => {
  const { data } = await api.get('/volunteer/dashboard')
  return data
}

export const getSalesCsvUrl = () =>
  `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/export/sales.csv`

export default api
