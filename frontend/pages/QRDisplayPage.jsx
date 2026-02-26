import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState'

const QRDisplayPage = ({ tickets, onRefreshTickets }) => {
  const { ticketId } = useParams()
  const [qrKey, setQrKey] = useState(0)
  const ticket = useMemo(() => tickets.find((item) => item.ticketId === ticketId), [tickets, ticketId])

  if (!ticket) return <EmptyState title="Ticket missing" message="No matching ticket found." />

  return (
    <div className="mx-auto max-w-xl">
      <div className="glass rounded-2xl p-6 text-center">
        <h1 className="text-2xl font-semibold text-white">Ticket QR</h1>
        <div className="mx-auto mt-5 grid h-64 w-64 place-items-center rounded-xl bg-white p-2">
          <img
            key={qrKey}
            src={ticket.qrCode}
            alt={ticket.ticketId}
            className="h-full w-full object-contain transition duration-300"
          />
        </div>
        <div className="mt-4 space-y-1 text-left text-sm text-slate-200">
          <p>Event: {ticket.eventId?.title}</p>
          <p>Ticket ID: {ticket.ticketId}</p>
          <p>Status: {ticket.checkedIn ? 'Checked-in' : 'Active'}</p>
        </div>
        <a
          href={ticket.qrCode}
          download={`${ticket.ticketId}.png`}
          className="animated-btn mt-6 inline-flex rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2 font-medium text-white"
        >
          Download QR
        </a>
        <button
          onClick={async () => {
            await onRefreshTickets?.()
            setQrKey((prev) => prev + 1)
          }}
          className="animated-btn ml-2 mt-6 inline-flex rounded-lg border border-slate-500 px-5 py-2 font-medium text-slate-100"
        >
          Refresh QR
        </button>
      </div>
    </div>
  )
}

export default QRDisplayPage
