import React, { useState, useEffect, useRef } from "react";
//import axios from "axios";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function ComparaisonEnergie() {
  const [categorie, setCategorie] = useState("refrigerator");
  const [produits, setProduits] = useState([]);
  const [selectionnes, setSelectionnes] = useState([]);
  const navigate = useNavigate();
  const selectionSectionRef = useRef(null);

  useEffect(() => {
    fetchProduits(categorie);
  }, [categorie]);

  const fetchProduits = async (cat) => {
    try {
      //const res = await axios.get( `http://localhost:4000/api/products?category=${cat}`);
      const res = await api.get(`/products?category=${cat}`);
      setProduits(res.data.products || []);
      setSelectionnes([]);
    } catch (err) {
      console.error("Erreur lors du chargement des produits:", err);
      setProduits([]);
    }
  };

  const handleSelectProduit = (produit) => {
    if (selectionnes.find((p) => p._id === produit._id)) return;

    if (selectionnes.length < 2) {
      const newSelection = [...selectionnes, produit];
      setSelectionnes(newSelection);

      if (newSelection.length === 2 && selectionSectionRef.current) {
        setTimeout(() => {
          selectionSectionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 300);
      }
    } else {
      setSelectionnes([produit]);
    }
  };

  const retirerProduit = (id) => {
    setSelectionnes(selectionnes.filter((p) => p._id !== id));
  };

  const allerAuxResultats = () => {
    if (selectionnes.length !== 2) {
      alert("Veuillez sélectionner exactement 2 produits.");
      return;
    }
    navigate("/resultats", { state: { produits: selectionnes } });
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* HEADER SECTION */}
      <div
        style={{
          //background: "linear-gradient(135deg, #e6f7f1, #28a745)",
          //borderRadius: "16px",
          borderRadius: "14px",
          background: "#e6f7f1",
          padding: "40px 20px",
          textAlign: "center",
          marginBottom: "30px",
          boxShadow: "0px 4px 15px rgba(0,0,0,0.2)",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "#000",
            marginBottom: "15px",
          }}
        >
          ⚡ Comparaison Énergétique
        </h1>
        <p
          style={{
            fontSize: "18px",
            fontWeight: "500",
            color: "#000",
            marginBottom: "25px",
          }}
        >
          Sélectionnez deux produits et découvrez lequel vous fera{" "}
          <span style={{ color: "#28a745", fontWeight: "bold" }}>
            économiser le plus d’énergie
          </span>{" "}
          !
        </p>

        {/* Category select */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: "#f8fef9",
            padding: "10px 20px",
            borderRadius: "12px",
            boxShadow: "0px 3px 8px rgba(0,0,0,0.1)",
          }}
        >
          <label
            style={{
              fontWeight: "600",
              fontSize: "16px",
              color: "#000",
            }}
          >
            Catégorie :
          </label>
          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #28a745",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            <option value="refrigerator">Réfrigérateur</option>
            <option value="washing_machine">Machine à laver</option>
          </select>
        </div>
      </div>

      {/* CATEGORY TITLE */}
      <h2
        style={{
          fontSize: "20px",
          fontWeight: "600",
          color: "#28a745",
          padding: "0 300px",
          marginBottom: "15px",
        }}
      >
        📋 Liste des {categorie === "refrigerator" ? "réfrigérateurs" : "machines à laver"} disponibles
      </h2>

      {/* PRODUITS LIST */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          padding: "0 300px",
          marginBottom: "30px",
        }}
      >
        {produits.map((p) => {
          const consommation = p.energy?.consumption_kwh_an;
          const disabled = !consommation || consommation === 0;
          const isSelected = selectionnes.find((sel) => sel._id === p._id);

          return (
            <div
              key={p._id}
              style={{
                padding: "15px",
                border: "1px solid #28a745",
                borderRadius: "12px",
                backgroundColor: "#f8fef9",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
                position: "relative",
                textAlign: "center",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
            >
              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  ✓
                </div>
              )}

              <h3>{p.brand} {p.model}</h3>
              <p><strong>Prix :</strong> {p.priceDzd ? `${p.priceDzd.toLocaleString()} DZD` : "N/A"}</p>
              <p><strong>Classe :</strong> {p.energy?.class || "N/A"}</p>
              <p><strong>Consommation :</strong> {consommation ? `${consommation} kWh/an` : "N/A"}</p>

              <button
                onClick={() => handleSelectProduit(p)}
                disabled={disabled}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: isSelected ? "#e6f7f1" : "#28a745",
                  color: "#000",
                  border: "none",
                  borderRadius: "8px",
                  cursor: disabled ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseOver={(e) => {
                  if (!disabled) e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {isSelected ? "✔ Sélectionné" : "➕ Sélectionner"}
              </button>

              {disabled && <p style={{ color: "red", fontSize: "13px" }}>⚠️ Infos de consommation indisponibles</p>}
            </div>
          );
        })}
      </div>

      {/* Selected Products */}
      {selectionnes.length > 0 && (
        <div
          ref={selectionSectionRef}
          style={{
            marginTop: "40px",
            padding: "25px",
            backgroundColor: "#e6f7f1",
            borderRadius: "16px",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "22px",
              fontWeight: "600",
              color: "#28a745",
            }}
          >
            ⭐ Produits sélectionnés
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            {selectionnes.map((p) => (
              <div
                key={p._id}
                style={{
                  width: "220px",
                  padding: "16px",
                  border: "2px solid #28a745",
                  borderRadius: "14px",
                  backgroundColor: "#e6f7f1",
                  boxShadow: "0px 3px 8px rgba(0,0,0,0.12)",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <h4 style={{ marginBottom: "6px", fontWeight: "bold", color: "#000" }}>
                  {p.brand} {p.model}
                </h4>
                <p style={{ fontSize: "14px", color: "#000" }}>
                  Classe {p.energy?.class || "N/A"}
                </p>
                <p style={{ fontSize: "14px", color: "#000" }}>
                  {p.energy?.consumption_kwh_an || "N/A"} kWh/an
                </p>

                <button
                  onClick={() => retirerProduit(p._id)}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "transparent",
                    border: "none",
                    color: "#28a745",
                    fontSize: "18px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compare button */}
      {selectionnes.length === 2 && (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <button
            onClick={allerAuxResultats}
            style={{
              padding: "14px 26px",
              background: "linear-gradient(90deg, #28a745, #e6f7f1)",
              color: "#000",
              border: "none",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0px 4px 12px rgba(0,0,0,0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            🚀 Voir la comparaison détaillée →
          </button>
        </div>
      )}
    </div>
  );
}
