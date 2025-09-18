import { useEffect, useState } from "react";
import api from "../api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const { data } = await api.post(`/notifications/${id}/read`);
      setNotifications(notifications.map((n) => (n._id === id ? data : n)));
    } catch (error) {
      alert("Impossible de marquer comme lue. Réessayez.");
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l’instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ background: "#f8fdf9", padding: "40px 20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            background: "#28a745",
            color: "#FFFFF0",
            padding: "25px",
            borderRadius: "16px",
            textAlign: "center",
            marginBottom: "30px",
            boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
          }}
        >
          <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>🔔 Notifications</h1>
          <p style={{ marginTop: "8px", fontSize: "16px" }}>
            Suivez l’intérêt des acheteurs pour vos produits
          </p>
        </div>

        {/* Résumé */}
        <div
          style={{
            borderRadius: "14px",
            background: "#f5fcfa",
            padding: "20px",
            marginBottom: "25px",
            boxShadow: "0px 4px 15px rgba(0,0,0,0.15)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#28a745" }}>Résumé</h2>
            <p style={{ color: "#555" }}>
              {notifications.length} notification{notifications.length !== 1 ? "s" : ""} au total
            </p>
          </div>
          {unreadCount > 0 && (
            <span
              style={{
                background: "#28a745",
                color: "#fff",
                fontWeight: "bold",
                padding: "6px 14px",
                borderRadius: "20px",
              }}
            >
              {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Liste des notifications */}
        {loading ? (
          <p style={{ textAlign: "center", color: "#666" }}>Chargement...</p>
        ) : notifications.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              padding: "40px",
              textAlign: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>📭</div>
            <p>Aucune notification pour l’instant</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {notifications.map((n) => (
              <div
                key={n._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "18px",
                  borderRadius: "12px",
                  background: n.isRead ? "#f9f9f9" : "#fff",
                  border: n.isRead ? "1px solid #eee" : "1px solid #28a745",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                }}
              >
                <div>
                  <p style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    {n.buyerId?.name} a commandé <span style={{ color: "#28a745" }}>{n.productId?.title}</span>
                  </p>
                  <p style={{ fontSize: "14px", color: "#666" }}>
                    Prix : {(n.productId?.priceDzd ?? 0).toLocaleString()} DZD
                  </p>
                  <p style={{ fontSize: "12px", color: "#888" }}>{getTimeAgo(n.createdAt)}</p>
                </div>
                <div>
                  {!n.isRead ? (
                    <button
                      onClick={() => markAsRead(n._id)}
                      style={{
                        background: "#28a745",
                        color: "#fff",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Marquer comme lue
                    </button>
                  ) : (
                    <span
                      style={{
                        background: "#DBE4C9",
                        color: "#28a745",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      ✔ Vue
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
