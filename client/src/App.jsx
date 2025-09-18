import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import Marketplace from './pages/Marketplace'
import Repairmen from './pages/Repairmen'
import Energy from './pages/Energy'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import SellerDashboard from './pages/SellerDashboard'
import Basket from './pages/Basket'
import Notifications from './pages/Notifications'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import { AuthProvider } from "./context/AuthContext"
import Protected from './components/Protected'
import './styles/home.css'

// Energy comparison pages
import ComparaisonEnergie from "./pages/Energy"
import ResultatsComparaison from "./pages/ResultatsComparaison"

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/repairmen" element={<Repairmen />} />
            <Route path="/energy" element={<Energy />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/basket" element={<Basket />} />

            {/* 🔐 Protected routes */}
            <Route path="/profile" element={<Protected><Profile /></Protected>} />
            <Route path="/seller/dashboard" element={<Protected role="seller"><SellerDashboard /></Protected>} />
            <Route path="/notifications" element={<Protected role="seller"><Notifications /></Protected>} />

            {/* ⚡ Energy comparison */}
            <Route path="/comparaison" element={<ComparaisonEnergie />} />
            <Route path="/resultats" element={<ResultatsComparaison />} />

            {/* Fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}
