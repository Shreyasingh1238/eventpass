import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import EmptyState from '../components/EmptyState'
import { refreshTicketQr } from '../data/api'

const QRDisplayPage = ({ tickets, onRefreshTickets }) => {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const [qrKey, setQrKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [qrBroken, setQrBroken] = useState(false)
  const ticket = useMemo(() => tickets.find((item) => item.ticketId === ticketId), [tickets, ticketId])

  if (!ticket) return <EmptyState title="Ticket missing" message="No matching ticket found." />

  return (
    <div className="mx-auto max-w-xl">
      <div className="glass rounded-2xl p-6 text-center">
        <h1 className="text-2xl font-semibold text-white">Ticket QR</h1>
        <div className="mx-auto mt-5 grid h-64 w-64 place-items-center rounded-xl bg-white p-2">
          {qrBroken ? (
            <p className="px-3 text-center text-sm text-slate-600">QR image unavailable. Click Refresh QR.</p>
          ) : (
            <img
              key={qrKey}
              src={ticket.qrCode}
              alt={ticket.ticketId}
              className="h-full w-full object-contain transition duration-300"
              onError={() => setQrBroken(true)}
            />
          )}
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
            if (refreshing) return
            setRefreshing(true)
            try {
              const response = await refreshTicketQr(ticket.ticketId)
              await onRefreshTickets?.()
              setQrKey((prev) => prev + 1)
              setQrBroken(false)
              const nextTicketId = response?.data?.ticketId
              if (nextTicketId && nextTicketId !== ticket.ticketId) {
                navigate(`/ticket/${nextTicketId}/qr`, { replace: true })
              }
              toast.success('QR refreshed')
            } catch (error) {
              toast.error(error?.response?.data?.message || 'QR refresh failed')
            } finally {
              setRefreshing(false)
            }
          }}
          className="animated-btn ml-2 mt-6 inline-flex rounded-lg border border-slate-500 px-5 py-2 font-medium text-slate-100 disabled:opacity-60"
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh QR'}
        </button>
      </div>
    </div>
  )
}

export default QRDisplayPage
