import { motion } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import { Link } from 'react-router-dom'
import { getCategoryImage } from '../data/categoryImages'

const RatingStars = ({ avg = 0, count = 0 }) => {
  const rounded = Math.round(avg)
  return (
    <div className="mt-2 flex items-center gap-1 text-xs">
      <span className="text-amber-300">{'\u2605'.repeat(rounded)}{'\u2606'.repeat(5 - rounded)}</span>
      <span className="text-slate-300">
        ({avg?.toFixed ? avg.toFixed(1) : Number(avg || 0).toFixed(1)} / 5, {count})
      </span>
    </div>
  )
}

const EventCard = ({ event }) => (
  <Tilt tiltMaxAngleX={9} tiltMaxAngleY={9} perspective={900} glareEnable glareMaxOpacity={0.08}>
    <motion.article
      whileHover={{ y: -8 }}
      className="glass group relative overflow-hidden rounded-2xl shadow-glass"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl border border-cyan-400/40" />
      </div>
      <img
        src={event.banner || event.image || getCategoryImage(event.category)}
        onError={(e) => {
          e.currentTarget.src = getCategoryImage(event.category)
        }}
        alt={event.title}
        loading="lazy"
        className="h-44 w-full object-cover"
      />
      <div className="p-4">
        <div className="mb-2 inline-flex rounded-full bg-cyan-500/20 px-2 py-1 text-xs text-cyan-300">
          {event.category}
        </div>
        <h3 className="text-lg font-semibold text-white">{event.title}</h3>
        <p className="mt-1 text-sm text-slate-300">
          {event.mode} - {event.venue}
        </p>
        <RatingStars avg={Number(event.avgRating || 0)} count={Number(event.reviewCount || 0)} />
        <p className="mt-3 text-sm text-slate-200">${event.price}</p>
        <Link
          to={`/events/${event._id || event.id}`}
          className="animated-btn mt-4 inline-flex w-full justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-2 text-sm font-medium text-white"
        >
          View Details
        </Link>
      </div>
    </motion.article>
  </Tilt>
)

export default EventCard
