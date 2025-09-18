// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import api, { setAuthToken } from "../api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore token + fetch user on reload
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }

    setAuthToken(token)
    api.get("/auth/me")
      .then((res) => {
        // ensure role always exists
        setUser({ ...res.data, role: res.data.role || "user" })
      })
      .catch((err) => {
        console.error("❌ Auth restore failed:", err.response?.data || err.message)
        setAuthToken(null)
        localStorage.removeItem("token")
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  // Login
  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password })
    const { token } = res.data
    localStorage.setItem("token", token)
    setAuthToken(token)

    setUser(null) // clear stale user
    const me = await api.get("/auth/me")
    const freshUser = { ...me.data, role: me.data.role || "user" }
    setUser(freshUser)
    return freshUser
  }, [])

  // Register
  const register = useCallback(async (payload) => {
    const res = await api.post("/auth/register", payload)
    const { token } = res.data
    localStorage.setItem("token", token)
    setAuthToken(token)

    setUser(null)
    const me = await api.get("/auth/me")
    const freshUser = { ...me.data, role: me.data.role || "user" }
    setUser(freshUser)
    return freshUser
  }, [])

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem("token")
    setAuthToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
