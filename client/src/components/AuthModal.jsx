import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        const response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });
        
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        onAuthSuccess(user);
        onClose();
        navigate("/"); // ✅ redirection vers Home après login
      } else {
        // Register
        const response = await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        onAuthSuccess(user);
        onClose();
        navigate("/"); // ✅ redirection vers Home après inscription
      }
    } catch (err) {
      setError(err.response?.data?.message || t('failedToSave'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'buyer'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isLogin ? t('signIn') : t('createAccount')}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">{t('fullName')}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder={t('enterFullName')}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">{t('emailAddress')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder={t('enterEmail')}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder={isLogin ? t('enterPassword') : t('createPassword')}
              required
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">{t('iWantTo')}</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="buyer">{t('buyAppliances')}</option>
                <option value="seller">{t('sellAppliances')}</option>
                <option value="repairman">{t('offerRepairServices')}</option>
              </select>
            </div>
          )}

          {error && (
            <div className="message error">
              {error}
            </div>
          )}

          {/* ✅ Bouton vert stylisé */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => e.target.style.background = "#218838"}
            onMouseOut={(e) => e.target.style.background = "#28a745"}
          >
            {loading ? (isLogin ? t('signingIn') : t('creatingAccount')) : (isLogin ? t('signIn') : t('createAccountBtn'))}
          </button>
        </form>

        <div className="modal-footer">
          <p>
            {isLogin ? t('dontHaveAccount') : t('haveAccount')}{" "}
            <button
              type="button"
              className="link-btn"
              onClick={toggleMode}
            >
              {isLogin ? t('signUpHere') : t('signInHere')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;





