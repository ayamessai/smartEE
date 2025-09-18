import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from "react-router-dom";
import '../styles/home.css'; 

const Basket = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      fetchOrders();
    } else setLoading(false);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders/my');
      setOrders(data);
    } catch (err) {
      setMessage('❌ Erreur lors du chargement du panier');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;
    try {
      await api.put(`/orders/${orderId}/cancel`);
      setMessage('✅ Commande annulée avec succès');
      fetchOrders();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Erreur lors de l\'annulation');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      confirmed: { text: 'Confirmée', color: 'bg-blue-100 text-blue-800', icon: '✅' },
      shipped: { text: 'Expédiée', color: 'bg-indigo-100 text-indigo-800', icon: '🚚' },
      delivered: { text: 'Livrée', color: 'bg-green-100 text-green-800', icon: '📦' },
      cancelled: { text: 'Annulée', color: 'bg-red-100 text-red-800', icon: '❌' },
    };
    const s = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800', icon: '❓' };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${s.color}`}>
        {s.icon} {s.text}
      </span>
    );
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatOrderNumber = (orderId) => `CMD-${orderId.slice(-8).toUpperCase()}`;

  if (loading) return <div className="text-center py-20 text-xl">⏳ Chargement du panier...</div>;

  return (
    <div style={{ padding: "60px 20px", background: "#f8fdf9" }}>

      {/* HERO SECTION */}
      <div
        style={{
          background: "#28a745",
          color: "#FFFFF0",
          padding: "40px",
          borderRadius: "16px",
          textAlign: "center",
          marginBottom: "40px",
          boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
        }}
      >
        <h1 style={{ fontSize: "36px", fontWeight: "bold" }}>🛒 Mon Panier</h1>
        <p style={{ marginTop: "10px", fontSize: "18px" }}>
        Consultez, suivez et gérez vos achats en toute simplicité.
        </p>
      </div>


      <div className="py-10 px-4 max-w-7xl mx-auto">
        {message && (
          <div className={`mb-6 p-4 rounded ${message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        {!user && (
          <div className="card text-center p-6 shadow-md">
            <p>Vous devez être connecté pour accéder à votre panier.</p>
          </div>
        )}

        {user && orders.length === 0 && (
          <div className="card text-center p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-2">Votre panier est vide</h3>
            <p className="mb-4">🛒 Commencez par explorer nos produits éco-énergétiques !</p>
            <button className="btn" style={{ background: "#28a745", color: "#FFFFF0" }} onClick={() => navigate("/marketplace")}>
              Voir les Produits
            </button>
          </div>
        )}

        {user && orders.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div key={order._id} className="card p-6 flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow rounded-lg">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">{formatOrderNumber(order._id)}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">📅 {formatDate(order.orderDate)}</p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-gray-700">
                        <span>{item.name} x{item.quantity}</span>
                        <span>{(item.price * item.quantity).toLocaleString()} DA</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <strong>Total: {order.totalAmount?.toLocaleString()} DA</strong>
                  <div className="flex space-x-2">
                    <button
                      className="btn px-4 py-2 rounded font-semibold"
                      style={{ background: "#28a745", color: "#FFFFF0" }}
                      onClick={() => { setSelectedOrder(order); setShowOrderDetails(true); }}
                    >
                      Voir détails
                    </button>
                    {order.status === 'pending' && (
                      <button
                        className="btn px-4 py-2 rounded font-semibold"
                        style={{ background: "#DB4437", color: "#FFFFF0" }}
                        onClick={() => cancelOrder(order._id)}
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODERN MODAL */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-3xl font-bold"
              onClick={() => setShowOrderDetails(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">Détails {formatOrderNumber(selectedOrder._id)}</h2>
            <p className="mb-2"><strong>Date :</strong> {formatDate(selectedOrder.orderDate)}</p>
            <p className="mb-2"><strong>Statut :</strong> {getStatusBadge(selectedOrder.status)}</p>
            <p className="mb-4"><strong>Total :</strong> {selectedOrder.totalAmount?.toLocaleString()} DA</p>

            <h3 className="font-semibold mb-2">🛒 Articles</h3>
            <div className="space-y-2 mb-4">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-gray-700">
                  <span>{item.name} ({item.quantity} × {item.price.toLocaleString()} DA)</span>
                  <span>{(item.price * item.quantity).toLocaleString()} DA</span>
                </div>
              ))}
            </div>

            {selectedOrder.notes && (
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-semibold mb-1">📝 Notes</h4>
                <p>{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Basket;
