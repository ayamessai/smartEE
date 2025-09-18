// src/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: false,
})

// ✅ Automatically attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export default api

// ================== SELLER API HELPERS ==================

// ✅ Get all orders belonging to the logged-in seller
export const fetchSellerOrders = () => api.get("/orders/seller")

// ✅ Update a specific order’s status
export const updateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status })
