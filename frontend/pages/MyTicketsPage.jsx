import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'

const MyTicketsPage = ({ tickets = [] }) => (
  <div>
    <h1 className="text-3xl font-semibold text-white">My Tickets</h1>
    <p className="mt-2 text-slate-300">Your booked events and QR tickets.</p>

    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {!tickets.length && (
        <div className="md:col-span-2">
          <EmptyState title="No tickets yet" message="Book an event to see your ticket here." />
        </div>
      )}
      {tickets.map((ticket) => (
        <div key={ticket._id} className="glass rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-white">{ticket.eventId?.title || 'Event'}</h3>
          <p className="mt-1 text-sm text-slate-300">Ticket ID: {ticket.ticketId}</p>
          <p className="mt-1 text-sm text-slate-300">Status: {ticket.checkedIn ? 'Checked-in' : 'Active'}</p>
          <Link
            to={`/ticket/${ticket.ticketId}/qr`}
            className="animated-btn mt-4 inline-flex rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm text-white"
          >
            View QR
          </Link>
        </div>
      ))}
    </div>
  </div>
)

export default MyTicketsPage
