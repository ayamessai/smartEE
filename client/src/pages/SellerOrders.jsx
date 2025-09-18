import { useEffect, useState } from "react";
import { fetchSellerOrders, updateOrderStatus } from "../api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const SellerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetchSellerOrders();
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
      toast.success(`✅ Order ${status}`);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update order");
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading orders...</p>;

  return (
    <div style={{ padding: "60px 20px", background: "#f7f9fc", minHeight: "100vh" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "30px",
          maxWidth: "1000px",
          margin: "0 auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>
          Seller Dashboard – Orders
        </h1>

        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#e9ecef", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>Order ID</th>
                <th style={{ padding: "10px" }}>Buyer</th>
                <th style={{ padding: "10px" }}>Product</th>
                <th style={{ padding: "10px" }}>Price</th>
                <th style={{ padding: "10px" }}>Status</th>
                <th style={{ padding: "10px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "10px" }}>{order.id}</td>
                  <td style={{ padding: "10px" }}>{order.buyer?.name}</td>
                  <td style={{ padding: "10px" }}>{order.product?.name}</td>
                  <td style={{ padding: "10px" }}>${order.product?.price}</td>
                  <td style={{ padding: "10px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "8px",
                        background:
                          order.status === "pending"
                            ? "#ffeeba"
                            : order.status === "confirmed"
                            ? "#c3e6cb"
                            : order.status === "shipped"
                            ? "#bee5eb"
                            : "#f5c6cb",
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px" }}>
                    {order.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(order.id, "confirmed")}
                          style={{
                            marginRight: "10px",
                            background: "#28a745",
                            color: "#fff",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, "canceled")}
                          style={{
                            background: "#dc3545",
                            color: "#fff",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {order.status === "confirmed" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "shipped")}
                        style={{
                          background: "#007bff",
                          color: "#fff",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Mark Shipped
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;
