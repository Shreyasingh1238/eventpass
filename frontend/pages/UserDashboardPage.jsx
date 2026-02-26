import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'

const UserDashboardPage = ({ tickets, currentUser }) => {
  const [previewTicket, setPreviewTicket] = useState(null)

  return (
    <div>
      {currentUser && (
        <p className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
          Hey {currentUser.role} {currentUser.name}
        </p>
      )}
      <h1 className="text-3xl font-semibold text-white">User Dashboard</h1>
      <p className="mt-2 text-slate-300">Purchased tickets and QR previews.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {!tickets.length && (
          <div className="md:col-span-2">
            <EmptyState title="No tickets yet" message="Purchase an event ticket to see it here." />
          </div>
        )}
        {tickets.map((ticket) => (
          <div key={ticket._id} className="glass rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white">{ticket.eventId?.title || 'Unknown Event'}</h3>
            <p className="mt-1 text-sm text-slate-300">Ticket: {ticket.ticketId}</p>
            <p className="mt-1 text-sm text-slate-300">Status: {ticket.checkedIn ? 'Checked-in' : 'Active'}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setPreviewTicket(ticket)}
                className="animated-btn rounded-lg border border-slate-500 px-3 py-2 text-sm text-slate-100"
              >
                QR Preview
              </button>
              <Link
                to={`/ticket/${ticket.ticketId}/qr`}
                className="animated-btn rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-2 text-sm text-white"
              >
                Open QR Page
              </Link>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {previewTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              className="glass w-full max-w-sm rounded-2xl p-6"
            >
            <h3 className="text-lg font-semibold text-white">QR Preview</h3>
            <div className="mt-4 grid h-52 place-items-center rounded-xl bg-white p-3 text-slate-800">
              <img src={previewTicket.qrCode} alt={previewTicket.ticketId} className="h-full w-full object-contain" />
            </div>
            <button
              onClick={() => setPreviewTicket(null)}
              className="mt-4 w-full rounded-lg border border-slate-500 px-3 py-2 text-slate-100"
            >
              Close
            </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserDashboardPage
