import { useState } from 'react'
import { useAuth } from "../context/AuthContext"
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'



export default function Register() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await register(form)
      navigate('/profile', { replace: true })
    } catch (e) {
      setError(t('registrationFailed'))
    } finally {
      setLoading(false)
    }
  }

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">{t('createAccount')}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('joinEcoElectro')}
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={onSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fullName')}
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  className="input"
                  placeholder={t('enterFullName')}
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('emailAddress')}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input"
                  placeholder={t('enterEmail')}
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('password')}
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="input"
                  placeholder={t('createPassword')}
                  value={form.password}
                  onChange={(e) => updateForm('password', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('iWantTo')}
                </label>
                <select
                  id="role"
                  className="select"
                  value={form.role}
                  onChange={(e) => updateForm('role', e.target.value)}
                >
                  <option value="buyer">{t('buyAppliances')}</option>
                  <option value="seller">{t('sellAppliances')}</option>
                  <option value="repairman">{t('offerRepairServices')}</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('creatingAccount') : t('createAccountBtn')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('haveAccount')}{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  {t('signInHere')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 