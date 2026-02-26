import { useEffect, useMemo, useState } from 'react'
import { animate, motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import toast from 'react-hot-toast'
import {
  approveEventRequest,
  fetchAdminCharts,
  fetchAdminEventRequests,
  fetchAdminOverview,
  getSalesCsvUrl,
  rejectEventRequest
} from '../data/api'

const tabs = ['Overview', 'Event Requests', 'Charts', 'Export']

const palette = ['#22d3ee', '#3b82f6', '#818cf8', '#06b6d4', '#0ea5e9']

const tooltipStyle = {
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  border: '1px solid rgba(56, 189, 248, 0.35)',
  color: '#e2e8f0',
  borderRadius: '10px'
}

const CustomTooltip = ({ active, label, payload }) => {
  if (!active || !payload || !payload.length) return null
  const title = label || payload?.[0]?.name || payload?.[0]?.payload?.name || ''
  return (
    <div style={tooltipStyle} className="px-3 py-2 text-sm">
      <p className="text-slate-100">{title}</p>
      {payload.map((item) => (
        <p key={item.dataKey} style={{ color: item.color || '#67e8f9' }}>
          {item.dataKey}: {item.value}
        </p>
      ))}
    </div>
  )
}

const pieLabel = ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`

const Counter = ({ value, prefix = '', suffix = '' }) => {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const numeric = Number(value) || 0
    const controls = animate(0, numeric, {
      duration: 1.2,
      onUpdate: (latest) => setDisplay(Math.round(latest))
    })
    return () => controls.stop()
  }, [value])

  return (
    <span>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}

const StatCard = ({ label, value, prefix = '' }) => (
  <motion.div whileHover={{ y: -6 }} className="glass rounded-2xl p-4">
    <p className="text-sm text-slate-300">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-white">
      <Counter value={value} prefix={prefix} />
    </p>
  </motion.div>
)

const AdminDashboardPage = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('Overview')
  const [overview, setOverview] = useState(null)
  const [charts, setCharts] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [overviewResponse, chartsResponse, requestsResponse] = await Promise.all([
        fetchAdminOverview(),
        fetchAdminCharts(),
        fetchAdminEventRequests({ status: 'pending', page: 1, limit: 50 })
      ])
      setOverview(overviewResponse.data?.cards || null)
      setCharts(chartsResponse.data || null)
      setRequests(requestsResponse.data || [])
    } catch {
      toast.error('Failed to load admin analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const pendingCount = useMemo(() => requests.filter((request) => request.status === 'pending').length, [requests])

  const handleApprove = async (id) => {
    setProcessingId(id)
    try {
      await approveEventRequest(id)
      toast.success('Event request approved')
      await loadData()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Approve failed')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id) => {
    setProcessingId(id)
    try {
      await rejectEventRequest(id, 'Rejected by admin')
      toast.success('Event request rejected')
      await loadData()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Reject failed')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
      <aside className="glass sticky top-24 h-fit rounded-2xl p-4">
        <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
        <p className="mt-1 text-xs text-slate-300">Pending requests: {pendingCount}</p>
        <div className="mt-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                activeTab === tab ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-200 hover:bg-slate-800/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </aside>

      <section className="space-y-6">
        {currentUser && (
          <p className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
            Hey admin {currentUser.name}
          </p>
        )}
        <h1 className="text-3xl font-semibold text-white">SaaS Analytics Dashboard</h1>

        {(activeTab === 'Overview' || activeTab === 'Charts') && overview && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Users" value={overview.totalUsers || 0} />
            <StatCard label="Total Volunteers" value={overview.totalVolunteers || 0} />
            <StatCard label="Accepted Volunteers" value={overview.acceptedVolunteers || 0} />
            <StatCard label="Pending Volunteers" value={overview.pendingVolunteers || 0} />
            <StatCard label="Total Events" value={overview.totalEvents || 0} />
            <StatCard label="Tickets Sold" value={overview.totalTicketsSold || 0} />
            <StatCard label="Total Revenue" value={overview.totalRevenue || 0} prefix="INR " />
          </div>
        )}

        {activeTab === 'Event Requests' && (
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xl font-semibold text-white">Volunteer Event Requests</h2>
            <div className="mt-4 space-y-4">
              {!loading && !requests.length && <p className="text-sm text-slate-300">No pending requests.</p>}
              {requests.map((request) => (
                <motion.div key={request._id} whileHover={{ y: -3 }} className="rounded-xl border border-slate-700/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{request.title}</p>
                      <p className="text-xs text-slate-300">
                        {request.category} | {request.mode} | INR {request.price}
                      </p>
                      <p className="text-xs text-slate-400">
                        by {request.volunteerId?.name || 'Volunteer'} ({request.volunteerId?.email || 'n/a'})
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        disabled={processingId === request._id}
                        onClick={() => handleApprove(request._id)}
                        className="animated-btn rounded-lg bg-emerald-600/80 px-3 py-1.5 text-sm text-white disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        disabled={processingId === request._id}
                        onClick={() => handleReject(request._id)}
                        className="animated-btn rounded-lg bg-rose-600/80 px-3 py-1.5 text-sm text-white disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{request.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Charts' && charts && (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="glass rounded-2xl p-4">
              <h3 className="mb-4 text-lg font-semibold text-white">Events vs Tickets Sold</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.eventsVsTickets || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#cbd5e1" />
                    <YAxis stroke="#cbd5e1" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="tickets" fill="#22d3ee" radius={[8, 8, 0, 0]} animationDuration={900} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <h3 className="mb-4 text-lg font-semibold text-white">Tickets Sold Over Time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.ticketsOverTime || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#cbd5e1" />
                    <YAxis stroke="#cbd5e1" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="tickets" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <h3 className="mb-4 text-lg font-semibold text-white">Ticket Share by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.eventCategoryDistribution || []}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={85}
                      label={pieLabel}
                      labelLine={false}
                      animationDuration={1000}
                    >
                      {(charts.eventCategoryDistribution || []).map((entry, index) => (
                        <Cell key={entry.name} fill={palette[index % palette.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <h3 className="mb-4 text-lg font-semibold text-white">User Age Histogram</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.userAgeHistogram || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#cbd5e1" />
                    <YAxis stroke="#cbd5e1" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#818cf8" radius={[8, 8, 0, 0]} animationDuration={900} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass rounded-2xl p-4 xl:col-span-2">
              <h3 className="mb-4 text-lg font-semibold text-white">Volunteer Status Donut</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.volunteerStatusDonut || []}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={80}
                      outerRadius={120}
                      animationDuration={1000}
                      label={pieLabel}
                      labelLine={false}
                    >
                      {(charts.volunteerStatusDonut || []).map((entry, index) => (
                        <Cell key={entry.name} fill={index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Export' && (
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xl font-semibold text-white">Export Data</h2>
            <p className="mt-2 text-sm text-slate-300">Download current ticket sales as CSV.</p>
            <a
              href={getSalesCsvUrl()}
              target="_blank"
              rel="noreferrer"
              className="animated-btn mt-4 inline-flex rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-medium text-white"
            >
              Export Sales CSV
            </a>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminDashboardPage
