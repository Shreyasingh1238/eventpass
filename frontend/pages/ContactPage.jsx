import { useState } from 'react'
import SuccessCheck from '../components/SuccessCheck'

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setLoading(true)
    setTimeout(() => {
      setSuccess(true)
      setLoading(false)
      setForm({ name: '', email: '', message: '' })
    }, 500)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="glass rounded-2xl p-6">
        <h1 className="text-3xl font-semibold text-white">Contact Us</h1>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <input
            className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white outline-none"
            placeholder="Name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
          <input
            className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white outline-none"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
          <textarea
            className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white outline-none"
            rows={5}
            placeholder="Message"
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
          />
          <button
            disabled={loading}
            className="animated-btn inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2 text-white disabled:opacity-60"
          >
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          {success && <SuccessCheck text="Message submitted successfully." />}
        </form>
      </div>
    </div>
  )
}

export default ContactPage
