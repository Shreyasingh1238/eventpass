import { useState } from 'react'
import { motion } from 'framer-motion'
import { verifyCheckin } from '../data/api'

const ScannerPage = ({ currentUser }) => {
  const [ticketId, setTicketId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!ticketId.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const response = await verifyCheckin(ticketId.trim())
      setResult({ type: 'success', text: response.message || 'Check-in successful' })
      setTicketId('')
    } catch (error) {
      const status = error?.response?.data?.status
      const text = error?.response?.data?.message || 'Invalid ticket'
      setResult({ type: status === 'duplicate' ? 'duplicate' : 'invalid', text })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {currentUser && (
        <p className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
          Hey {currentUser.role} {currentUser.name}
        </p>
      )}
      <h1 className="text-3xl font-semibold text-white">Volunteer Scanner</h1>
      <div className="glass mt-6 rounded-2xl p-6">
        <div className="relative grid h-72 place-items-center overflow-hidden rounded-xl border border-slate-600">
          <div className="text-slate-300">Camera Placeholder</div>
          <motion.div
            animate={{ y: [0, 220, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute left-6 right-6 h-0.5 bg-cyan-400"
          />
        </div>
        <div className="mt-5 flex gap-2">
                <input
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Enter / paste ticketId"
                  className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white outline-none"
                />
                <button
                  onClick={submit}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                >
                  {loading ? <span className="spinner" /> : null}
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
        {result && (
          <p
            className={`mt-4 rounded-lg p-3 text-sm ${
              result.type === 'success'
                ? 'bg-emerald-900/40 text-emerald-200'
                : result.type === 'duplicate'
                  ? 'bg-amber-900/40 text-amber-200'
                  : 'bg-rose-900/40 text-rose-200'
            }`}
          >
            {result.text}
          </p>
        )}
      </div>
    </div>
  )
}

export default ScannerPage
