import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const LoginPage = ({ onLogin, role = 'user', title, registerLink = '/register/user' }) => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('All fields are required.')
      return
    }
    setLoading(true)
    const result = await onLogin(email, password, role)
    setLoading(false)
    if (!result?.success) {
      setError(result?.error || 'Invalid email or password.')
      toast.error('Login failed')
      return
    }
    const user = result.user
    toast.success('Login successful')
    if (user.role === 'admin') navigate('/admin/dashboard')
    else if (user.role === 'volunteer') navigate('/volunteer/dashboard')
    else navigate('/')
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="glass rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-white">{title || 'Welcome Back'}</h1>
        <p className="mt-2 text-sm text-slate-300">Login to access your tickets and dashboard.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white outline-none"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="space-y-2">
            <input
              className="fancy-input w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white outline-none"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="text-xs text-cyan-300"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'Hide password' : 'Show password'}
            </button>
          </div>
          {error && <p className="shake rounded-lg bg-rose-900/40 p-2 text-sm text-rose-200">{error}</p>}
          <button
            disabled={loading}
            className="animated-btn inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-2 font-medium text-white disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="spinner" /> Signing in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        {role !== 'admin' && (
          <p className="mt-4 text-sm text-slate-300">
            Don&apos;t have an account?{' '}
            <Link to={registerLink} className="text-cyan-300">
              Register
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default LoginPage
