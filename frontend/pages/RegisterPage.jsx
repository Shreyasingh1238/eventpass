import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const RegisterPage = ({ onRegister, role = 'user', title, loginLink = '/login/user' }) => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: 'other'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill all fields.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    try {
      setLoading(true)
      const user = await onRegister({
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        age: Number(form.age) || undefined,
        gender: form.gender
      })
      toast.success('Account created')
      if (user.role === 'volunteer') navigate('/volunteer/dashboard')
      else navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="glass rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-white">{title || 'Create Account'}</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
          <input
            className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white outline-none"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
          />
          <input
            className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white outline-none"
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={(e) => update('age', e.target.value)}
          />
          <select
            className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white outline-none"
            value={form.gender}
            onChange={(e) => update('gender', e.target.value)}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white outline-none"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
          />
          {error && <p className="shake rounded-lg bg-rose-900/40 p-2 text-sm text-rose-200">{error}</p>}
          <button
            disabled={loading}
            className="animated-btn inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-2 font-medium text-white disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="spinner" /> Creating...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-300">
          Already registered?{' '}
          <Link to={loginLink} className="text-cyan-300">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
