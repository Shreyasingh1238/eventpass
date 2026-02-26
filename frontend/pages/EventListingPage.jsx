import { useMemo, useState } from 'react'
import EventCard from '../components/EventCard'
import EmptyState from '../components/EmptyState'
import SkeletonCard from '../components/SkeletonCard'

const PER_PAGE = 6

const EventListingPage = ({ loading, events }) => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)

  const categories = useMemo(() => ['All', ...new Set(events.map((event) => event.category))], [events])

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const searchMatch = event.title.toLowerCase().includes(search.toLowerCase())
      const filterMatch = category === 'All' || event.category === category
      return searchMatch && filterMatch
    })
  }, [events, search, category])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const sliced = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <h1 className="text-3xl font-semibold text-white">Event Listings</h1>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px]">
        <input
          placeholder="Search events..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white outline-none focus:border-cyan-400"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white outline-none"
        >
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading && Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)}
        {!loading && !sliced.length && (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState title="No events found" message="Try changing filters or search terms." />
          </div>
        )}
        {!loading && sliced.map((event) => <EventCard key={event._id || event.id} event={event} />)}
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <button
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Previous
        </button>
        <span className="px-2 py-2 text-sm text-slate-300">
          Page {page} of {totalPages}
        </span>
        <button
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default EventListingPage
