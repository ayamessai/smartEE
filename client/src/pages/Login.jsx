import { useState } from 'react'
import { useAuth } from "../context/AuthContext"
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'



export default function Login() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)


  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/', { replace: true }) // ✅ retour à Home après login
    } catch (e) {
      setError(t('invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">{t('welcomeBack')}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('signInToContinue')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white shadow-lg rounded-xl p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Erreur */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('emailAddress')}
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder={t('enterEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('password')}
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder={t('enterPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* ✅ Bouton vert */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base font-semibold rounded-lg transition-colors"
              style={{
                backgroundColor: "#28a745",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseOver={(e) => (e.target.style.background = "#218838")}
              onMouseOut={(e) => (e.target.style.background = "#28a745")}
            >
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('dontHaveAccount')}{' '}
              <Link
                to="/register"
                className="font-semibold text-green-600 hover:text-green-500"
              >
                {t('signUpHere')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
