import { useEffect, useState } from 'react'
import { animate, motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import toast from 'react-hot-toast'
import { fetchVolunteerDashboard } from '../data/api'

const StatCard = ({ title, value, prefix = '' }) => {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const controls = animate(0, Number(value) || 0, {
      duration: 1.1,
      onUpdate: (latest) => setDisplay(Math.round(latest))
    })
    return () => controls.stop()
  }, [value])
  return (
    <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-4">
      <p className="text-sm text-slate-300">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-white">
        {prefix}
        {display}
      </p>
    </motion.div>
  )
}

const VolunteerDashboardPage = ({ currentUser }) => {
  const [dashboard, setDashboard] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchVolunteerDashboard()
        setDashboard(response.data || null)
      } catch {
        toast.error('Failed to load dashboard')
      }
    }
    load()
  }, [])

  const cards = dashboard?.cards || {}
  const charts = dashboard?.charts || {}
  const insights = dashboard?.insights || []

  return (
    <div className="space-y-6">
      {currentUser && (
        <p className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
          Hey volunteer {currentUser.name}
        </p>
      )}
      <h1 className="text-3xl font-semibold text-white">Volunteer Analytics Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Accepted Events" value={cards.myEvents || 0} />
        <StatCard title="Tickets Sold" value={cards.totalTicketsSold || 0} />
        <StatCard title="Remaining Tickets" value={cards.remainingTickets || 0} />
        <StatCard title="Revenue" value={cards.revenue || 0} prefix="INR " />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-white">Age Group Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.ageGroups || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip />
                <Bar dataKey="value" fill="#22d3ee" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-white">Event Popularity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.popularity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip />
                <Bar dataKey="tickets" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(insights.length ? insights : ['Most popular age group for AI events: 21-25']).map((insight) => (
          <div key={insight} className="glass rounded-2xl border border-cyan-400/30 p-4 text-cyan-200">
            {insight}
          </div>
        ))}
      </div>
    </div>
  )
}

export default VolunteerDashboardPage
