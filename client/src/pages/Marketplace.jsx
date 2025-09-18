import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";
import ProductSort from "../components/ProductSort";
import "../styles/marketplace.css";

export default function Marketplace() {
  const { t } = useTranslation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({
    category: "",
    priceRange: "",
    energyClass: "",
  });

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalProducts: 0,
    hasNext: false,
    hasPrev: false,
  });

  // ✅ Modal d’erreur
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: "",
  });

  useEffect(() => {
    fetchProducts();
  }, [appliedFilters, sortBy, sortOrder]);

  const fetchProducts = async (
    page = pagination.current || 1,
    newFilters = appliedFilters,
    newSortBy = sortBy,
    newSortOrder = sortOrder
  ) => {
    try {
      setLoading(true);

      if (newFilters !== appliedFilters) setAppliedFilters(newFilters);
      if (newSortBy !== sortBy) setSortBy(newSortBy);
      if (newSortOrder !== sortOrder) setSortOrder(newSortOrder);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        sortBy: newSortBy,
        sortOrder: newSortOrder,
      });

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== "") {
          if (key === "priceRange") {
            const [min, max] = value.split("-");
            if (max === "+") {
              params.append("minPrice", min);
            } else {
              params.append("minPrice", min);
              params.append("maxPrice", max);
            }
          } else {
            params.append(key, value);
          }
        }
      });

      const response = await api.get(`/products?${params.toString()}`);

      setProducts(response.data.products);
      setPagination(response.data.pagination);
      setFilters(response.data.filters);
    } catch (err) {
      console.error("Erreur Axios :", err);
      setErrorModal({
        visible: true,
        message:
          err.response?.data?.message ||
          "Impossible de charger les produits. Vérifiez votre connexion.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    fetchProducts(1, newFilters, sortBy, sortOrder);
  };

  const handleClearFilters = () => {
    setAppliedFilters({ category: "", priceRange: "", energyClass: "" });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleSortChange = (field, order) => {
    fetchProducts(1, appliedFilters, field, order);
  };

  const handlePageChange = (page) => {
    fetchProducts(page, appliedFilters, sortBy, sortOrder);
  };

  if (loading && products.length === 0) {
    return (
      <div className="marketplace-page">
        <div className="container loading-section">
          <div className="loading-spinner"></div>
          <p>{t("loadingProducts")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-page">
      <div className="container">
        {/* ✅ Modal Erreur */}
        {errorModal.visible && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: "#fff0f0",
                padding: "30px",
                borderRadius: "16px",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
                textAlign: "center",
                maxWidth: "400px",
                animation: "fadeIn 0.3s ease-in-out",
              }}
            >
              <h2 style={{ color: "red", marginBottom: "15px" }}>❌ Erreur</h2>
              <p style={{ fontSize: "16px", marginBottom: "20px" }}>
                {errorModal.message}
              </p>
              <button
                onClick={() => setErrorModal({ visible: false, message: "" })}
                style={{
                  background: "red",
                  color: "#fff",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Page Header */}
        <header className="page-header">
          <h1 className="page-title">{t("marketplace")}</h1>
          <p className="page-subtitle">{t("browseAppliances")}</p>
        </header>

        {/* Filters */}
        <section className="filters-section horizontal-filters">
          <ProductFilters
            filters={filters}
            appliedFilters={appliedFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            layout="horizontal"
          />
        </section>

        {/* Sorting */}
        <section className="sort-section">
          <ProductSort
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            totalProducts={pagination.totalProducts}
          />
        </section>

        {/* Products */}
        {products.length > 0 ? (
          <>
            <section className="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  showEnergyClass={true}
                />
              ))}
            </section>

            {/* Pagination */}
            {pagination.total > 1 && (
              <nav className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={!pagination.hasPrev}
                  className="btn btn-secondary"
                >
                  {t("previous")}
                </button>

                <span className="page-info">
                  {t("page")} {pagination.current} {t("of")} {pagination.total}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={!pagination.hasNext}
                  className="btn btn-secondary"
                >
                  {t("next")}
                </button>
              </nav>
            )}
          </>
        ) : (
          <section className="empty-state">
            <div className="card">
              <div className="empty-icon">🔍</div>
              <h3>{t("noProductsFound")}</h3>
              <p>
                {appliedFilters.category
                  ? t("noProductsInCategory", {
                      category: t(appliedFilters.category),
                    })
                  : t("selectCategoryToStart")}
              </p>
              {Object.values(appliedFilters).some(
                (value) => value && value !== ""
              ) && (
                <button
                  onClick={handleClearFilters}
                  className="btn btn-primary"
                >
                  {t("clearAllFilters")}
                </button>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
