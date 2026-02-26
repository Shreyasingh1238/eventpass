import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import AnimatedSection from '../components/AnimatedSection'
import EventCard from '../components/EventCard'

const LandingPage = ({ events, currentUser }) => {
  const { scrollY } = useScroll()
  const yParallax = useTransform(scrollY, [0, 500], [0, 120])
  const [glow, setGlow] = useState({ x: 50, y: 40 })

  return (
    <div className="space-y-20">
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-24 z-0 h-[520px]"
        style={{
          background: `radial-gradient(320px at ${glow.x}% ${glow.y}%, rgba(56,189,248,0.24), transparent 60%)`
        }}
      />

      <AnimatedSection
        id="hero"
        className="relative grid gap-8 overflow-hidden rounded-3xl py-14 md:grid-cols-2"
      >
        <motion.div
          className="absolute inset-0 -z-10"
          style={{ y: yParallax }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setGlow({
              x: ((e.clientX - rect.left) / rect.width) * 100,
              y: ((e.clientY - rect.top) / rect.height) * 100
            })
          }}
        >
          <div className="absolute -left-10 top-8 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute right-0 top-20 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl" />
        </motion.div>

        <div className="relative z-10">
          {currentUser && (
            <p className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
              Hey {currentUser.role} {currentUser.name}
            </p>
          )}
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Virtual Event Ticketing Platform</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-white md:text-5xl">
            Sell, Manage, and Verify Event Access with Smart QR Check-in
          </h1>
          <p className="mt-5 max-w-xl text-slate-300">
            EventPass Pro helps teams launch modern event experiences with frictionless ticket purchase and secure entry.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/events"
              className="animated-btn rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 font-medium text-white"
            >
              Explore Events
            </Link>
          </div>
        </div>
        <div className="glass relative z-10 rounded-3xl p-6">
          <div className="h-full rounded-2xl border border-cyan-500/30 bg-slate-900/70 p-6">
            <p className="text-slate-300">Role-based Access</p>
            <div className="mt-5 grid gap-3">
              <motion.div whileHover={{ rotateX: 8, rotateY: -8 }} className="rounded-xl bg-slate-800/80 p-4">
                <p className="text-sm text-slate-300">User</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link to="/login/user" className="animated-btn rounded-md bg-cyan-500/20 px-3 py-1.5 text-xs text-cyan-200">
                    Login as User
                  </Link>
                  <Link to="/register/user" className="animated-btn rounded-md border border-cyan-500/40 px-3 py-1.5 text-xs text-cyan-200">
                    Register as User
                  </Link>
                </div>
              </motion.div>
              <motion.div whileHover={{ rotateX: -8, rotateY: 8 }} className="rounded-xl bg-slate-800/80 p-4">
                <p className="text-sm text-slate-300">Volunteer</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    to="/login/volunteer"
                    className="animated-btn rounded-md bg-blue-500/20 px-3 py-1.5 text-xs text-blue-200"
                  >
                    Login as Volunteer
                  </Link>
                  <Link
                    to="/register/volunteer"
                    className="animated-btn rounded-md border border-blue-500/40 px-3 py-1.5 text-xs text-blue-200"
                  >
                    Register as Volunteer
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="features">
        <h2 className="text-3xl font-semibold text-white">Features</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {['Role-based Access', 'Secure QR Tickets', 'Realtime Analytics UI', 'Responsive Dashboard'].map((item) => (
            <div key={item} className="glass rounded-xl p-5">
              <p className="font-medium text-white">{item}</p>
            </div>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection id="how-it-works">
        <h2 className="text-3xl font-semibold text-white">How It Works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {['Browse Events', 'Purchase Ticket', 'Scan QR on Entry'].map((step, index) => (
            <div key={step} className="glass rounded-xl p-5">
              <p className="text-sm text-cyan-300">Step {index + 1}</p>
              <p className="mt-1 font-medium text-white">{step}</p>
            </div>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection id="upcoming">
        <h2 className="text-3xl font-semibold text-white">Upcoming Events</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {events.slice(0, 4).map((event) => (
            <EventCard key={event._id || event.id} event={event} />
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection id="cta" className="glass rounded-3xl p-10 text-center">
        <h2 className="text-3xl font-semibold text-white">Ready to attend your next event?</h2>
        <p className="mt-3 text-slate-300">Browse events, book your ticket, and get instant QR access.</p>
        <Link
          to="/events"
          className="animated-btn mt-6 inline-flex rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 font-medium text-white"
        >
          Explore Events
        </Link>
      </AnimatedSection>
    </div>
  )
}

export default LandingPage
