import { useTranslation } from 'react-i18next';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useState } from 'react';

export default function ProductCard({ product, showEnergyClass = false }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Modal state
  const [modal, setModal] = useState({
    visible: false,
    type: 'success',
    message: '',
  });

  const handleOrderClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const orderData = {
        items: [
          {
            productId: product._id,
            quantity: 1, // ✅ ordering single product from card
            price: product.priceDzd,
          },
        ],
        totalAmount: product.priceDzd,
        totalItems: 1,
        shippingAddress: {
          street: "—", // ⚠️ You’ll need to collect real address from user
          city: "—",
          postalCode: "—",
          country: "Algeria",
        },
        paymentMethod: "Cash on Delivery", // ⚠️ replace with user choice if needed
        notes: "",
      };

      // ✅ No need to pass headers, api already has Authorization
      await api.post("/orders", orderData);

      setModal({
        visible: true,
        type: 'success',
        message: 'Commande passée',
      });
    } catch (error) {
      console.error("❌ Order failed:", error.response?.data || error.message);
      setModal({
        visible: true,
        type: 'error',
        message: 'Commande échouée',
      });
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      washing_machine: '🧺',
      refrigerator: '❄️',
      dishwasher: '🍽️',
      oven: '🔥',
      microwave: '📡',
      other: '🔌',
    };
    return icons[category] || '🔌';
  };

  const getConditionBadge = (condition) =>
    condition === 'new' ? (
      <span className="badge badge-success">{t('new')}</span>
    ) : (
      <span className="badge badge-warning">{t('used')}</span>
    );

  const getEnergyClassBadge = (energyClass) => {
    if (!energyClass) return null;

    let badgeClass = 'badge badge-info';
    if (energyClass === 'A+++' || energyClass === 'A++') {
      badgeClass = 'badge badge-success';
    } else if (energyClass === 'A+' || energyClass === 'A') {
      badgeClass = 'badge badge-warning';
    } else if (energyClass === 'B' || energyClass === 'C') {
      badgeClass = 'badge badge-danger';
    }

    return (
      <span className={badgeClass}>
        {t('energyClass')}: {energyClass}
      </span>
    );
  };

  const formatPrice = (price) => {
    if (price == null) return 'N/A';
    return price.toLocaleString('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
    });
  };

  return (
    <>
      {/* Product Card */}
      <div className="product-card">
        {/* Header */}
        <div className="product-header">
          <div className="product-icon">{getCategoryIcon(product.category)}</div>
          <div className="product-badges">
            {getConditionBadge(product.condition)}
            {showEnergyClass && getEnergyClassBadge(product.energy?.class)}
          </div>
        </div>

        {/* Content */}
        <div className="product-content">
          <h3 className="product-title">{product.title}</h3>

          {product.brand && (
            <p className="product-brand">
              <strong>{product.brand}</strong>
              {product.model && ` ${product.model}`}
            </p>
          )}

          {/* Price */}
          <div className="product-price">{formatPrice(product.priceDzd)} DA</div>

          {/* Seller Info */}
          {product.sellerId && (
            <div className="seller-info">
              <p className="seller-name">
                <strong>{t('seller')}:</strong> {product.sellerId.name}
              </p>
              {product.sellerId.profile?.wilaya && (
                <p className="seller-location">📍 {product.sellerId.profile.wilaya}</p>
              )}
            </div>
          )}

          {/* Custom Green Action Button */}
          <button
            onClick={handleOrderClick}
            style={{
              background: '#28a745',
              color: '#fff',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s',
              marginTop: '10px',
              width: '100%',
            }}
            onMouseOver={(e) => (e.target.style.background = '#218838')}
            onMouseOut={(e) => (e.target.style.background = '#28a745')}
          >
            {'commander maintenant'}
          </button>
        </div>
      </div>

      {/* Modal */}
      {modal.visible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: modal.type === 'success' ? '#e6f7f1' : '#fff0f0',
              padding: '30px 40px',
              borderRadius: '20px',
              boxShadow: '0px 8px 24px rgba(0,0,0,0.2)',
              textAlign: 'center',
              maxWidth: '400px',
              width: '90%',
              animation: 'scaleIn 0.25s ease-out',
            }}
          >
            <h2
              style={{
                color: modal.type === 'success' ? '#28a745' : '#e63946',
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '15px',
              }}
            >
              {modal.type === 'success' ? '✅ Succès' : '❌ Erreur'}
            </h2>
            <p style={{ fontSize: '16px', marginBottom: '20px', color: '#333' }}>
              {modal.message}
            </p>
            <button
              onClick={() =>
                setModal({ visible: false, type: 'success', message: '' })
              }
              style={{
                background: modal.type === 'success' ? '#28a745' : '#e63946',
                color: '#fff',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) =>
                (e.target.style.background =
                  modal.type === 'success' ? '#218838' : '#c82333')
              }
              onMouseOut={(e) =>
                (e.target.style.background =
                  modal.type === 'success' ? '#28a745' : '#e63946')
              }
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
