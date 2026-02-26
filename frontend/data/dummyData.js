export const users = [
  { id: 'u1', name: 'Alice Johnson', email: 'user@eventpass.com', password: '123456', role: 'user' },
  { id: 'u2', name: 'Mark Admin', email: 'admin@eventpass.com', password: '123456', role: 'admin' },
  { id: 'u3', name: 'Nina Volunteer', email: 'volunteer@eventpass.com', password: '123456', role: 'volunteer' }
]

export const tickets = [
  { id: 't1', userId: 'u1', eventId: 'e1', seat: 'A-12', status: 'active' },
  { id: 't2', userId: 'u1', eventId: 'e3', seat: 'C-03', status: 'checked-in' }
]

export const scannerMessages = {
  success: 'Ticket verified. Check-in successful.',
  duplicate: 'This ticket has already been used.',
  invalid: 'Invalid QR code. Please scan again.'
}

export const termsSections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By using EventPass Pro, you agree to all terms described on this page and future updates.'
  },
  {
    title: '2. User Responsibilities',
    body: 'Users must provide accurate information, protect their credentials, and comply with event policies.'
  },
  {
    title: '3. Ticketing Policy',
    body: 'Tickets are non-transferable unless otherwise stated by the event organizer. Refund rules vary by event.'
  },
  {
    title: '4. Data and Privacy',
    body: 'EventPass Pro stores account and ticket metadata for authentication and access control workflows.'
  },
  {
    title: '5. Liability Limits',
    body: 'The platform is provided as-is for demo usage in this frontend-only build without service guarantees.'
  }
]

