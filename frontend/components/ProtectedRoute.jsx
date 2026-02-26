import { Navigate } from 'react-router-dom'

const roleToLogin = {
  admin: '/admin/login',
  volunteer: '/login/volunteer',
  user: '/login/user'
}

const ProtectedRoute = ({ user, allowedRoles = [], children }) => {
  if (!user) {
    const fallbackRole = allowedRoles[0] || 'user'
    return <Navigate to={roleToLogin[fallbackRole] || '/'} replace />
  }
  if (allowedRoles.length && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default ProtectedRoute
