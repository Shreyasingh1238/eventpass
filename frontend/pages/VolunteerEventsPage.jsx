import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { createVolunteerEventRequest, fetchVolunteerDashboard } from '../data/api'
import { getCategoryImage } from '../data/categoryImages'

const initialForm = {
  title: '',
  description: '',
  date: '',
  venue: '',
  mode: 'virtual',
  price: '',
  image: '',
  category: 'AI'
}

const VolunteerEventsPage = () => {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(initialForm)

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetchVolunteerDashboard()
      setDashboard(response.data || null)
    } catch {
      toast.error('Failed to load volunteer events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const submitRequest = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.date || !form.venue || !form.price) {
      toast.error('Please fill all required fields')
      return
    }
    setSubmitting(true)
    try {
      await createVolunteerEventRequest({
        ...form,
        price: Number(form.price)
      })
      toast.success('Event request submitted')
      setForm(initialForm)
      await loadData()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const acceptedEvents = dashboard?.acceptedEvents || []

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="glass rounded-2xl p-5">
        <h2 className="text-xl font-semibold text-white">Create Event Request</h2>
        <form onSubmit={submitRequest} className="mt-4 space-y-3">
          <input
            value={form.title}
            onChange={(e) => updateForm('title', e.target.value)}
            placeholder="Event title"
            className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white"
          />
          <textarea
            value={form.description}
            onChange={(e) => updateForm('description', e.target.value)}
            placeholder="Description"
            rows={3}
            className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) => updateForm('date', e.target.value)}
              className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white"
            />
            <input
              value={form.venue}
              onChange={(e) => updateForm('venue', e.target.value)}
              placeholder="Venue"
              className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white"
            />
            <select
              value={form.mode}
              onChange={(e) => updateForm('mode', e.target.value)}
              className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white"
            >
              <option value="virtual">Virtual</option>
              <option value="physical">Physical</option>
            </select>
            <select
              value={form.category}
              onChange={(e) => updateForm('category', e.target.value)}
              className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white"
            >
              <option>AI</option>
              <option>Dance</option>
              <option>Singing</option>
              <option>Concert</option>
              <option>Fashion Show</option>
            </select>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => updateForm('price', e.target.value)}
              placeholder="Ticket price"
              className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white"
            />
            <input
              value={form.image}
              onChange={(e) => updateForm('image', e.target.value)}
              placeholder="Optional image URL"
              className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white"
            />
          </div>
          <button
            disabled={submitting}
            className="animated-btn inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="spinner" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </button>
        </form>
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="text-xl font-semibold text-white">Accepted Events (User Feedback Visible)</h2>
        <div className="mt-4 space-y-4">
          {!loading && !acceptedEvents.length && (
            <p className="text-sm text-slate-300">No accepted events yet. Submit and wait for admin approval.</p>
          )}
          {acceptedEvents.map((event) => (
            <div key={event._id} className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-3">
              <div className="flex gap-3">
                <img
                  src={event.image || getCategoryImage(event.category)}
                  onError={(e) => {
                    e.currentTarget.src = getCategoryImage(event.category)
                  }}
                  alt={event.title}
                  className="h-16 w-24 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{event.title}</p>
                  <p className="text-xs text-slate-300">
                    {event.category} | {event.mode} | INR {event.price}
                  </p>
                  <p className="text-xs text-slate-300">Event Time: {new Date(event.date).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VolunteerEventsPage
