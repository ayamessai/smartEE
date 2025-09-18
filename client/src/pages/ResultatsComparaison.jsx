import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import bgImage from "../assets/images/homme-rousse-joyeux-immobilier-dans-des-verres-celebrant-l-achat-d-une-maison-montrant-la-decoupe-de-papier-a-la-maison-et.jpg";
import iconImage from "../assets/images/save-energy_10104847.png";

export default function ResultatsComparaison() {
  const location = useLocation();
  const navigate = useNavigate();
  const produits = location.state?.produits || [];

  if (produits.length !== 2) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Aucune comparaison disponible</h2>
        <button onClick={() => navigate("/")}>Retour</button>
      </div>
    );
  }

  // Données
  const tarif = 5.34; // DZD par kWh
  const data = produits.map((p) => {
    let consommation = p.energy?.consumption_kwh_an || 0;

    if (consommation > 0 && consommation < 10) {
      consommation = consommation * 365;
    }

    return {
      modele: `${p.brand} ${p.model}`,
      consommation,
      coutAnnuel: consommation * tarif,
      prix: p.priceDzd || 0,
    };
  });

  const [moinsCher, plusCher] = [...data].sort(
    (a, b) => a.coutAnnuel - b.coutAnnuel
  );
  const economie = plusCher.coutAnnuel - moinsCher.coutAnnuel;
  const economieKwh = (plusCher.consommation - moinsCher.consommation).toFixed(0);
  const economiePct = ((economie / plusCher.coutAnnuel) * 100).toFixed(1);

  const colorsCheapest = data.map((p) =>
    p.modele === moinsCher.modele ? "#28a745" : "#6c757d"
  );
  const productColors = data.reduce((acc, p, i) => {
    acc[p.modele] = colorsCheapest[i];
    return acc;
  }, {});

  const labelWithStar = (modele) =>
    modele === moinsCher.modele ? `⭐ ${modele}` : modele;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
      {/* HEADER */}
      <div
        style={{
          position: "relative",
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "16px",
          padding: "60px 20px",
          marginBottom: "30px",
          textAlign: "center",
          overflow: "hidden",
          boxShadow: "0px 6px 18px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.2))",
            borderRadius: "16px",
          }}
        ></div>

        <div style={{ position: "relative", zIndex: 2 }}>
          <h1
            style={{
              fontSize: "40px",
              fontWeight: "900",
              color: "#f8f9fa",
              textShadow: "2px 2px 10px rgba(0,0,0,0.8)",
              marginBottom: "10px",
            }}
          >
            📊 Résultats de la comparaison énergétique
          </h1>
          <p
            style={{
              fontSize: "20px",
              fontWeight: "500",
              color: "#e9ecef",
              textShadow: "1px 1px 6px rgba(0,0,0,0.7)",
              marginBottom: "25px",
            }}
          >
            Découvrez vos économies et faites le meilleur choix ⚡
          </p>

          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: "10px",
              padding: "14px 28px",
              border: "none",
              borderRadius: "12px",
              backgroundColor: "rgba(255,255,255,0.9)",
              color: "#212529",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px",
              transition: "all 0.3s ease",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.3)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(0,123,255,0.9)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)")
            }
          >
            ← Retour
          </button>
        </div>
      </div>

      {/* Économies potentielles */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "25px",
          borderRadius: "14px",
          background: "#e6f7f1",
          marginBottom: "30px",
          gap: "20px",
        }}
      >
        <img
          src={iconImage}
          alt="Économies"
          style={{
            width: "160px",
            height: "auto",
            objectFit: "contain",
            borderRadius: "10px",
          }}
        />

        <div style={{ textAlign: "center", flex: 1 }}>
          <h2>💡 Économies potentielles</h2>
          <p>
            En choisissant <strong>{labelWithStar(moinsCher.modele)}</strong>, vous
            pouvez économiser :
          </p>
          <h3 style={{ fontSize: "26px", color: "#28a745" }}>
            {economie.toFixed(0)} DZD / an
          </h3>
          <p>
            Soit l’équivalent de <strong>{economieKwh} kWh</strong> économisés chaque
            année ⚡
          </p>
          <p>
            ≈ <strong>{economiePct}%</strong> d’économie par rapport à{" "}
            {plusCher.modele}
          </p>
        </div>
      </div>

      {/* Consommation & coût annuel */}
      <div
        style={{
          padding: "20px",
          borderRadius: "14px",
          backgroundColor: "#ffffff",
          marginBottom: "30px",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h2>🔌 Consommation et coût annuel</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="modele" tickFormatter={labelWithStar} />
            <YAxis yAxisId="left" orientation="left" stroke="#4e73df" />
            <YAxis yAxisId="right" orientation="right" stroke="#1cc88a" />
            <Tooltip labelFormatter={labelWithStar} />
            <Legend formatter={labelWithStar} />
            <Bar yAxisId="left" dataKey="consommation" name="Consommation (kWh)">
              {data.map((entry, i) => (
                <Cell key={i} fill={colorsCheapest[i]} />
              ))}
            </Bar>
            <Bar yAxisId="right" dataKey="coutAnnuel" name="Coût Annuel (DZD)">
              {data.map((entry, i) => (
                <Cell key={i} fill={colorsCheapest[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p style={{ textAlign: "center", marginTop: "10px", color: "#555" }}>
          📘 Ce graphique compare la consommation (kWh/an) et le coût annuel (DZD).  
          Plus les barres sont basses, plus l’appareil est économique.
        </p>
      </div>

      {/* Évolution comparative */}
      <div
        style={{
          padding: "20px",
          borderRadius: "14px",
          background: "#f8f9fc",
          marginBottom: "30px",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h2>📈 Évolution comparative</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={Array.from({ length: 10 }, (_, i) => {
              const year = i + 1;
              return {
                year,
                [`${data[0].modele} (kWh)`]: data[0].consommation * year,
                [`${data[1].modele} (kWh)`]: data[1].consommation * year,
                [`${data[0].modele} (DZD)`]: data[0].coutAnnuel * year,
                [`${data[1].modele} (DZD)`]: data[1].coutAnnuel * year,
              };
            })}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ paddingLeft: 20 }}
            />
            <Line
              type="monotone"
              dataKey={`${data[0].modele} (DZD)`}
              stroke={productColors[data[0].modele]}
              strokeWidth={3}
              dot={false}
              name={`${data[0].modele} - Coût (DZD)`}
            />
            <Line
              type="monotone"
              dataKey={`${data[1].modele} (DZD)`}
              stroke={productColors[data[1].modele]}
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={false}
              name={`${data[1].modele} - Coût (DZD)`}
            />
            <Line
              type="monotone"
              dataKey={`${data[0].modele} (kWh)`}
              stroke={productColors[data[0].modele]}
              strokeWidth={2}
              dot={false}
              name={`${data[0].modele} - Conso (kWh)`}
            />
            <Line
              type="monotone"
              dataKey={`${data[1].modele} (kWh)`}
              stroke={productColors[data[1].modele]}
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
              name={`${data[1].modele} - Conso (kWh)`}
            />
          </LineChart>
        </ResponsiveContainer>
        <p style={{ textAlign: "center", marginTop: "10px", color: "#555" }}>
          📘 Ici, on observe l’évolution du coût et de la consommation sur 10 ans.  
          Les courbes les plus plates représentent l’appareil le plus économe.
        </p>
      </div>

      {/* Prix d’achat */}
      <div
        style={{
          padding: "20px",
          borderRadius: "14px",
          background: "#fff7e6",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h2>💰 Comparaison du prix d’achat</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="prix"
              nameKey="modele"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ modele }) => labelWithStar(modele)}
            >
              {data.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={colorsCheapest[i]} />
              ))}
            </Pie>
            <Legend formatter={labelWithStar} />
            <Tooltip labelFormatter={labelWithStar} />
          </PieChart>
        </ResponsiveContainer>
        <p style={{ textAlign: "center", marginTop: "10px", color: "#555" }}>
          📘 Ce camembert montre la répartition du prix d’achat entre les produits.  
          Plus la part est petite, moins l’investissement initial est élevé.
        </p>
      </div>
    </div>
  );
}
