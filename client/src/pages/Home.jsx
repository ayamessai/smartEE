import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/images/objectifs-de-developpement-durable-nature-morte.jpg"; 
import heroImage2 from "../assets/images/household appliance realistic.jpg"; 

import "../styles/home.css";

const Home = () => {
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleEnergyClick = (e) => {
    if (!user) {
      e.preventDefault();
      setShowPopup(true);
    }
  };

  return (
    <div className="home">
      {/* HERO SECTION */}
      <section
        className="hero"
        style={{
          backgroundImage: `url(${heroImage2})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "100px 20px",
          textAlign: "center",
          color: "#FFFFF0",
        }}
      >
        {/* Overlay */}
        <div
          style={{
            backgroundColor: "rgba(106, 206, 130, 0.8)",
            borderRadius: "16px",
            padding: "50px 30px",
            maxWidth: "900px",
            margin: "0 auto",
            boxShadow: "0px 6px 18px rgba(0,0,0,0.25)",
          }}
        >
          <h1 style={{ fontSize: "48px", fontWeight: "bold", marginBottom: "20px" }}>
            🌱 SmartEE
          </h1>
          <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
            Comparez et choisissez vos appareils selon leur efficacité énergétique
          </h2>
          <p style={{ fontSize: "18px", lineHeight: "1.6", marginBottom: "25px" }}>
            Découvrez les économies d'énergie et d'argent que vous pouvez réaliser en choisissant
            des appareils plus efficaces. Faites des choix éclairés pour un avenir durable 🌍
          </p>

          <div>
            <Link
              to="/marketplace"
              className="btn"
              style={{
                background: "#28a745",
                color: "#FFFFF0",
                padding: "12px 24px",
                borderRadius: "10px",
                fontWeight: "bold",
                marginRight: "1rem",
                textDecoration: "none",
              }}
            >
              Voir les Produits
            </Link>
            <Link
              to={user ? "/energy" : "#"}
              onClick={handleEnergyClick}
              className="btn"
              style={{
                background: "#DBE4C9",
                color: "#28a745",
                padding: "12px 24px",
                borderRadius: "10px",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              Comparaison Énergétique
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features" style={{ padding: "60px 20px", background: "#e6f7f1" }}>
        <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#28a745" }}>
          Pourquoi choisir SmartEE ?
        </h2>

        <div className="grid grid-3" style={{ gap: "20px" }}>
          <div className="card" style={{ padding: "20px", borderRadius: "12px", background: "#FFFFF0", boxShadow: "0 3px 10px rgba(0,0,0,0.1)" }}>
            <h3>⚡ Comparaison Énergétique</h3>
            <p>
              Comparez facilement la consommation énergétique de différents appareils et découvrez
              les économies potentielles sur votre facture d'électricité.
            </p>
          </div>

          <div className="card" style={{ padding: "20px", borderRadius: "12px", background: "#FFFFF0", boxShadow: "0 3px 10px rgba(0,0,0,0.1)" }}>
            <h3>💰 Tarification Algérienne</h3>
            <p>
              Calculs basés sur les tarifs réels de Sonelgaz : 1.779 DA/kWh (0-125 kWh) et 4.179
              DA/kWh (126+ kWh) pour les particuliers.
            </p>
          </div>

          <div className="card" style={{ padding: "20px", borderRadius: "12px", background: "#FFFFF0", boxShadow: "0 3px 10px rgba(0,0,0,0.1)" }}>
            <h3>🌍 Impact Environnemental</h3>
            <p>
              Choisissez des appareils plus efficaces pour réduire votre empreinte carbone et
              contribuer à un avenir plus durable.
            </p>
          </div>
        </div>
      </section>

      {/* ENERGY CLASSES SECTION */}
      <section className="energy-classes" style={{ padding: "60px 20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#28a745" }}>
          Classes Énergétiques
        </h2>

        <div className="grid grid-4" style={{ gap: "20px" }}>
          <div className="card" style={{ textAlign: "center", background: "#FFFFF0", borderRadius: "12px", padding: "20px" }}>
            <div className="energy-badge energy-a-plus-plus-plus">A+++</div>
            <h4>Très Économe</h4>
            <p>Consommation minimale</p>
          </div>

          <div className="card" style={{ textAlign: "center", background: "#FFFFF0", borderRadius: "12px", padding: "20px" }}>
            <div className="energy-badge energy-a-plus-plus">A++</div>
            <h4>Très Économe</h4>
            <p>Excellente efficacité</p>
          </div>

          <div className="card" style={{ textAlign: "center", background: "#FFFFF0", borderRadius: "12px", padding: "20px" }}>
            <div className="energy-badge energy-a-plus">A+</div>
            <h4>Économe</h4>
            <p>Bonne efficacité</p>
          </div>

          <div className="card" style={{ textAlign: "center", background: "#FFFFF0", borderRadius: "12px", padding: "20px" }}>
            <div className="energy-badge energy-a">A</div>
            <h4>Standard</h4>
            <p>Efficacité moyenne</p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="cta" style={{ padding: "60px 20px", background: "#e6f7f1" }}>
        <div
          className="card"
          style={{
            textAlign: "center",
            background: "#28a745",
            color: "#FFFFF0",
            borderRadius: "16px",
            padding: "40px 20px",
            maxWidth: "800px",
            margin: "0 auto",
            boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
          }}
        >
          <h2>Prêt à économiser de l'énergie ?</h2>
          <p>
            Commencez par explorer nos produits et utilisez nos outils de comparaison pour faire le
            meilleur choix pour votre maison et votre portefeuille.
          </p>
          <Link
            to="/marketplace"
            className="btn"
            style={{
              background: "#FFFFF0",
              color: "#28a745",
              padding: "12px 24px",
              borderRadius: "10px",
              fontWeight: "bold",
              marginTop: "1rem",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Commencer Maintenant
          </Link>
        </div>
      </section>

      {/* POPUP MODERNE VERT */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#e6f7f1",
              padding: "30px",
              borderRadius: "16px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
              textAlign: "center",
              maxWidth: "400px",
            }}
          >
            <h2 style={{ color: "#28a745", marginBottom: "15px" }}>🔒 Accès restreint</h2>
            <p style={{ marginBottom: "20px", color: "#333" }}>
              Vous devez être connecté pour utiliser la comparaison énergétique.
            </p>
            <button
              onClick={() => {
                setShowPopup(false);
                window.location.href = "/login";
              }}
              style={{
                background: "#28a745",
                color: "#fff",
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Se connecter
            </button>
            <br />
            <button
              onClick={() => setShowPopup(false)}
              style={{
                marginTop: "10px",
                background: "#ccc",
                color: "#333",
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
