import { Link } from 'react-router-dom'

const NotFoundPage = () => (
  <div className="mx-auto max-w-lg text-center">
    <h1 className="text-5xl font-bold text-white">404</h1>
    <p className="mt-3 text-slate-300">The page you requested does not exist.</p>
    <Link
      to="/"
      className="animated-btn mt-6 inline-flex rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2 text-white"
    >
      Back to Home
    </Link>
  </div>
)

export default NotFoundPage

