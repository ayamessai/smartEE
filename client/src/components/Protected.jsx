// src/components/Protected.jsx
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Protected({ children, role }) {
  const { user, loading } = useAuth()

  // Show spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9fafb]">
        <div className="p-6 bg-white shadow rounded-2xl text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#28a745] border-t-transparent mx-auto mb-3"></div>
          <p className="text-gray-700 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Ensure fallback role
  const userRole = user?.role || "user"

  // Role-based access control
  if (role) {
    if (Array.isArray(role)) {
      if (!role.includes(userRole)) {
        return <Navigate to="/" replace />
      }
    } else {
      if (userRole !== role) {
        return <Navigate to="/" replace />
      }
    }
  }

  // Render protected content
  return children
}
