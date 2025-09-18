import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const emptyProduct = {
  title: "",
  priceDzd: "",
  condition: "new",
  category: "other",
  description: "",
  images: [],
  specs: {
    brand: "",
    model: "",
    energyClass: "",
    powerWatts: "",
    annualKwh: "",
  },
};

export default function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products/mine");
      setProducts(data);
    } catch (error) {
      console.error("Impossible de charger les produits :", error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Impossible de charger les notifications :", error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadNotifications();
  }, []);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateSpecs = (field, value) => {
    setForm((prev) => ({
      ...prev,
      specs: { ...prev.specs, [field]: value },
    }));
  };

  const resetForm = () => {
    setForm(emptyProduct);
    setEditingId(null);
  };

  const createProduct = async () => {
    if (!form.title || !form.priceDzd) {
      alert("Veuillez remplir le titre et le prix");
      return;
    }

    const payload = {
      ...form,
      priceDzd: Number(form.priceDzd) || 0,
      specs: {
        ...form.specs,
        powerWatts: Number(form.specs.powerWatts) || 0,
        annualKwh: Number(form.specs.annualKwh) || 0,
      },
      images:
        typeof form.images === "string"
          ? form.images.split(",").map((url) => url.trim()).filter(Boolean)
          : form.images,
    };

    try {
      const { data } = await api.post("/products", payload);
      setProducts([data, ...products]);
      resetForm();
    } catch (error) {
      console.error("Product creation failed:", error.response?.data || error.message);
      alert("Échec de la création du produit. Vérifiez les champs et réessayez.");
    }
  };

  const startEdit = (product) => {
    setForm({
      title: product.title || "",
      priceDzd: product.priceDzd?.toString() || "",
      condition: product.condition || "new",
      category: product.category || "other",
      description: product.description || "",
      specs: product.specs || emptyProduct.specs,
      images: product.images?.join(", ") || "",
    });
    setEditingId(product._id);
  };

  const updateProduct = async () => {
    const payload = {
      ...form,
      priceDzd: Number(form.priceDzd) || 0,
      specs: {
        ...form.specs,
        powerWatts: Number(form.specs.powerWatts) || 0,
        annualKwh: Number(form.specs.annualKwh) || 0,
      },
      images:
        typeof form.images === "string"
          ? form.images.split(",").map((url) => url.trim()).filter(Boolean)
          : form.images,
    };

    try {
      const { data } = await api.put(`/products/${editingId}`, payload);
      setProducts(products.map((p) => (p._id === editingId ? data : p)));
      resetForm();
    } catch (error) {
      alert("Échec de la mise à jour du produit. Veuillez réessayer.");
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      alert("Échec de la suppression du produit. Veuillez réessayer.");
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      washing_machine: "🧺",
      refrigerator: "❄️",
      dishwasher: "🍽️",
      oven: "🔥",
      microwave: "📡",
      other: "🔌",
    };
    return icons[category] || "🔌";
  };

  return (
    <div style={{ background: "#f8fdf9", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            background: "#28a745",
            color: "#FFFFF0",
            padding: "30px",
            borderRadius: "16px",
            textAlign: "center",
            marginBottom: "40px",
            boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
            position: "relative",
          }}
        >
          <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>
            📦 Tableau de bord Vendeur
          </h1>
          <p style={{ marginTop: "10px", fontSize: "18px" }}>
            Gérez vos annonces et suivez l’intérêt des acheteurs
          </p>

          
        </div>

        {/* Form */}
        <div
          style={{
            borderRadius: "14px",
            background: "#f5fcfa",
            padding: "30px",
            marginBottom: "30px",
            boxShadow: "0px 4px 15px rgba(0,0,0,0.15)",
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              marginBottom: "20px",
              color: "#28a745",
              textAlign: "center",
            }}
          >
            {editingId ? "✏️ Modifier le Produit" : "➕ Ajouter un Nouveau Produit"}
          </h2>

          {/* Inputs */}
          <div
            className="grid grid-2"
            style={{ display: "grid", gap: "15px", gridTemplateColumns: "1fr 1fr" }}
          >
            <input
              type="text"
              placeholder="Titre du produit *"
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            <input
              type="number"
              min="0"
              placeholder="Prix (DZD) *"
              value={form.priceDzd}
              onChange={(e) => updateForm("priceDzd", e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />

            <select
              value={form.category}
              onChange={(e) => updateForm("category", e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            >
              <option value="washing_machine">Machine à laver</option>
              <option value="refrigerator">Réfrigérateur</option>
              <option value="dishwasher">Lave-vaisselle</option>
              <option value="oven">Four</option>
              <option value="microwave">Micro-ondes</option>
              <option value="other">Autre</option>
            </select>

            <select
              value={form.condition}
              onChange={(e) => updateForm("condition", e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            >
              <option value="new">Neuf</option>
              <option value="used">Occasion</option>
            </select>
          </div>

          <textarea
            rows={3}
            placeholder="Description..."
            value={form.description}
            onChange={(e) => updateForm("description", e.target.value)}
            style={{
              marginTop: "15px",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              width: "100%",
            }}
          />

          <input
            type="text"
            placeholder="URLs d’images (séparées par des virgules)"
            value={form.images}
            onChange={(e) => updateForm("images", e.target.value)}
            style={{
              marginTop: "15px",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              width: "100%",
            }}
          />

          {/* Specs */}
          <h3
            style={{
              marginTop: "20px",
              fontWeight: "bold",
              color: "#28a745",
              fontSize: "18px",
              textAlign: "center",
            }}
          >
            Spécifications
          </h3>
          <div
            className="grid grid-2"
            style={{ display: "grid", gap: "15px", marginTop: "10px", gridTemplateColumns: "1fr 1fr" }}
          >
            <input
              type="text"
              placeholder="Marque"
              value={form.specs.brand}
              onChange={(e) => updateSpecs("brand", e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            <input
              type="text"
              placeholder="Modèle"
              value={form.specs.model}
              onChange={(e) => updateSpecs("model", e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            <input
              type="text"
              placeholder="Classe Énergétique"
              value={form.specs.energyClass}
              onChange={(e) => updateSpecs("energyClass", e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            <input
              type="number"
              placeholder="Puissance (Watts)"
              value={form.specs.powerWatts}
              onChange={(e) => updateSpecs("powerWatts", e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            <input
              type="number"
              placeholder="Consommation annuelle (kWh)"
              value={form.specs.annualKwh}
              onChange={(e) => updateSpecs("annualKwh", e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
          </div>

          {/* Buttons */}
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button
              onClick={editingId ? updateProduct : createProduct}
              style={{
                background: "#28a745",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                marginRight: "10px",
              }}
            >
              {editingId ? "Mettre à jour" : "Ajouter"}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                style={{
                  background: "#ccc",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>
            )}
          </div>
        </div>

        {/* Products */}
        <div
          style={{
            background: "#FFFFF0",
            padding: "25px",
            borderRadius: "14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "20px", color: "#28a745" }}>
            📋 Liste des Produits ({products.length})
          </h2>

          {loading ? (
            <p style={{ textAlign: "center", color: "#666" }}>Chargement des produits...</p>
          ) : products.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>
              Aucun produit pour le moment. Ajoutez votre premier produit ci-dessus !
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {products.map((product) => (
                <div
                  key={product._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "15px",
                    border: "1px solid #eee",
                    borderRadius: "10px",
                    background: "#fff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  }}
                >
                  <div>
                    <h3 style={{ fontWeight: "bold" }}>
                      {getCategoryIcon(product.category)} {product.title}
                    </h3>
                    <p style={{ color: "#666" }}>
                      {(product.priceDzd ?? 0).toLocaleString()} DZD •{" "}
                      {product.condition === "new" ? "Neuf" : "Occasion"}
                    </p>
                    {product.specs?.brand && (
                      <p style={{ color: "#555", fontSize: "14px" }}>
                        {product.specs.brand} {product.specs.model} • Classe: {product.specs.energyClass}
                      </p>
                    )}
                    {product.images?.length > 0 && (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        style={{ marginTop: "8px", maxWidth: "90px", borderRadius: "6px" }}
                      />
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => startEdit(product)}
                      style={{
                        background: "#DBE4C9",
                        color: "#28a745",
                        padding: "6px 14px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        marginRight: "8px",
                      }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteProduct(product._id)}
                      style={{
                        background: "red",
                        color: "#fff",
                        padding: "6px 14px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
