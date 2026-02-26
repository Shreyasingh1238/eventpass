import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import EmptyState from '../components/EmptyState'
import { createEventFeedback, fetchEventAttendees, fetchEventById, fetchEventFeedback } from '../data/api'
import { getCategoryImage } from '../data/categoryImages'

const isManagerRole = (role) => role === 'volunteer' || role === 'admin'

const EventDetailsPage = ({ events, currentUser, onPayAndBuy }) => {
  const { id } = useParams()
  const eventFromList = useMemo(() => events.find((item) => (item._id || item.id) === id), [events, id])
  const [event, setEvent] = useState(eventFromList || null)
  const [eventLoading, setEventLoading] = useState(!eventFromList)
  const [imageSrc, setImageSrc] = useState('')
  const [bookingForm, setBookingForm] = useState({ fullName: '', phone: '' })
  const [paying, setPaying] = useState(false)
  const [attendees, setAttendees] = useState([])
  const [feedback, setFeedback] = useState([])
  const [feedbackLoading, setFeedbackLoading] = useState(true)
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' })
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)

  const managerView = isManagerRole(currentUser?.role)

  useEffect(() => {
    setEvent(eventFromList || null)
  }, [eventFromList])

  useEffect(() => {
    const loadEvent = async () => {
      if (eventFromList || !id) return
      setEventLoading(true)
      try {
        const response = await fetchEventById(id)
        setEvent(response.data || null)
      } catch {
        setEvent(null)
      } finally {
        setEventLoading(false)
      }
    }
    loadEvent()
  }, [eventFromList, id])

  useEffect(() => {
    if (!event) return
    setImageSrc(event.banner || event.image || getCategoryImage(event.category))
  }, [event])

  useEffect(() => {
    const loadFeedback = async () => {
      if (!event) return
      setFeedbackLoading(true)
      try {
        const response = await fetchEventFeedback(event._id || event.id)
        setFeedback(response.data || [])
      } catch {
        setFeedback([])
      } finally {
        setFeedbackLoading(false)
      }
    }
    loadFeedback()
  }, [event])

  useEffect(() => {
    if (!event || !managerView) return
    let timer
    const loadAttendees = async () => {
      try {
        const response = await fetchEventAttendees(event._id || event.id)
        setAttendees(response.data || [])
      } catch {
        setAttendees([])
      }
    }
    loadAttendees()
    timer = setInterval(loadAttendees, 15000)
    return () => clearInterval(timer)
  }, [event, managerView])

  if (eventLoading) return <EmptyState title="Loading event..." message="Please wait." />
  if (!event) return <EmptyState title="Event not found" message="This event may have been removed." />

  const handlePayment = async () => {
    if (!currentUser) {
      toast.error('Login first to continue booking')
      return
    }
    if (!bookingForm.fullName || !bookingForm.phone) {
      toast.error('Please fill attendee details')
      return
    }

    try {
      setPaying(true)
      await onPayAndBuy(event._id || event.id, bookingForm)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Payment failed')
    } finally {
      setPaying(false)
    }
  }

  const submitFeedback = async (e) => {
    e.preventDefault()
    if (!feedbackForm.comment.trim()) {
      toast.error('Please enter feedback')
      return
    }
    try {
      setFeedbackSubmitting(true)
      const response = await createEventFeedback(event._id || event.id, {
        rating: Number(feedbackForm.rating),
        comment: feedbackForm.comment.trim()
      })
      setFeedback((prev) => [response.data, ...prev])
      setFeedbackForm({ rating: 5, comment: '' })
      toast.success('Feedback submitted')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Feedback failed')
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass overflow-hidden rounded-3xl">
        <img
          src={imageSrc}
          onError={() => setImageSrc(getCategoryImage(event.category))}
          alt={event.title}
          loading="lazy"
          className="h-72 w-full object-cover"
        />
        <div className="space-y-4 p-6">
          <h1 className="text-3xl font-semibold text-white">{event.title}</h1>
          <p className="text-slate-300">{event.description}</p>
          <div className="grid gap-3 text-sm text-slate-200 md:grid-cols-2">
            <p>Date & Time: {new Date(event.date).toLocaleString()}</p>
            <p>Venue: {event.venue}</p>
            <p>Mode: {event.mode}</p>
            <p>Price: INR {event.price}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          {!managerView ? (
            <>
              <h2 className="text-xl font-semibold text-white">Attend This Event</h2>
              <p className="mt-2 text-sm text-slate-300">Fill details and complete payment to get ticket ID and QR.</p>
              <div className="mt-4 space-y-3">
                <input
                  value={bookingForm.fullName}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Full name"
                  className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white"
                />
                <input
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                  className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white"
                />
                <button
                  onClick={handlePayment}
                  disabled={paying}
                  className="animated-btn inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2 font-medium text-white disabled:opacity-60"
                >
                  {paying ? (
                    <>
                      <span className="spinner" /> Processing payment...
                    </>
                  ) : (
                    'Pay and Get Ticket'
                  )}
                </button>
                <Link to="/events" className="inline-flex text-sm text-cyan-300">
                  Back to events
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white">Attendee List (Realtime)</h2>
              <p className="mt-2 text-sm text-slate-300">People who filled details and booked this event.</p>
              <div className="mt-4 space-y-2">
                {!attendees.length && <p className="text-sm text-slate-300">No attendees yet.</p>}
                {attendees.map((person) => (
                  <div key={person.ticketId} className="rounded-lg border border-slate-700/50 bg-slate-900/40 px-3 py-2">
                    <p className="text-sm text-white">{person.attendeeName}</p>
                    <p className="text-xs text-slate-300">
                      Phone: {person.attendeePhone} | Booked: {new Date(person.bookedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white">Event Feedback</h2>
          {currentUser?.role === 'user' && (
            <form onSubmit={submitFeedback} className="mt-4 space-y-3">
              <select
                value={feedbackForm.rating}
                onChange={(e) => setFeedbackForm((prev) => ({ ...prev, rating: e.target.value }))}
                className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white"
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Very Good</option>
                <option value={3}>3 - Good</option>
                <option value={2}>2 - Average</option>
                <option value={1}>1 - Poor</option>
              </select>
              <textarea
                rows={3}
                value={feedbackForm.comment}
                onChange={(e) => setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience"
                className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white"
              />
              <button
                disabled={feedbackSubmitting}
                className="animated-btn inline-flex items-center justify-center rounded-lg border border-cyan-500 px-4 py-2 text-cyan-200 disabled:opacity-60"
              >
                {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}

          <div className="mt-5 space-y-3">
            {feedbackLoading && <p className="text-sm text-slate-300">Loading feedback...</p>}
            {!feedbackLoading && !feedback.length && <p className="text-sm text-slate-300">No feedback yet.</p>}
            {feedback.map((item) => (
              <div key={item._id} className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{item.userId?.name || 'User'}</p>
                  <p className="text-xs text-amber-300">
                    {'\u2605'.repeat(Number(item.rating || 0))}
                    {'\u2606'.repeat(5 - Number(item.rating || 0))}
                    <span className="ml-1 text-slate-300">({item.rating}/5)</span>
                  </p>
                </div>
                <p className="mt-1 text-sm text-slate-300">{item.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetailsPage
