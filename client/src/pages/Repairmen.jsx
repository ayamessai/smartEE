import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Repairmen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [repairmen, setRepairmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wilaya, setWilaya] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);

  const searchRepairmen = async (selectedWilaya = "") => {
    setLoading(true);
    setSearchPerformed(true);

    try {
      const path = user ? "/repairmen" : "/repairmen/preview";
      const { data } = await api.get(path, {
        params: selectedWilaya ? { wilaya: selectedWilaya } : {},
      });
      setRepairmen(data);
    } catch (error) {
      console.error("Failed to search repairmen:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load ALL repairmen on first render
  useEffect(() => {
    searchRepairmen();
  }, [user]);

  // Refetch whenever wilaya changes
  useEffect(() => {
    if (wilaya) {
      searchRepairmen(wilaya);
    } else {
      searchRepairmen(); // if cleared, show all again
    }
  }, [wilaya]);

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="text-yellow-400">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400">☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i} className="text-gray-300">☆</span>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const wilayas = [
    "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar",
    "Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger",
    "Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma",
    "Constantine","Médéa","Mostaganem","M’Sila","Mascara","Ouargla","Oran","El Bayadh",
    "Illizi","Bordj Bou Arreridj","Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued",
    "Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent","Ghardaïa",
    "Relizane","Timimoun","Bordj Badji Mokhtar","Ouled Djellal","Béni Abbès","In Salah",
    "In Guezzam","Touggourt","Djanet","El M’Ghair","El Meniaa"
  ];

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* HERO SECTION */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <div
          style={{
            backgroundColor: "#28a745",
            padding: "60px 20px",
            textAlign: "center",
            boxShadow: "0px 6px 18px rgba(0,0,0,0.3)",
            borderRadius: "20px",
            marginBottom: "40px",
          }}
        >
          <h1
            style={{
              fontSize: "38px",
              fontWeight: "900",
              color: "#fff",
              marginBottom: "10px",
            }}
          >
            🔧 {t("findRepairServices")}
          </h1>
          <p
            style={{
              fontSize: "18px",
              fontWeight: "500",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {t("connectProfessionals")}
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px 40px 20px" }}>
        
        {/* Filter Form */}
        <div style={{ background: "#ffffff", padding: "30px", borderRadius: "16px", marginBottom: "40px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", flexDirection: "row", gap: "20px", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("searchByWilaya")}</label>
              <select
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc", width: "100%" }}
              >
                <option value="">{t("wilayaPlaceholderSearch")}</option>
                {wilayas.map((w, i) => (
                  <option key={i} value={w}>
                    {i + 1} - {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!user && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                💡 <strong>{t("loginRequired")}:</strong> {t("loginRequiredDesc")}
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ background: "#fff", padding: "30px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <p style={{ color: "#666" }}>{t("searching")}</p>
          </div>
        ) : repairmen.length === 0 ? (
          <div style={{ background: "#fff", padding: "30px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div className="text-4xl mb-4">🔍</div>
            <h3 style={{ fontSize: "20px", fontWeight: "bold" }}>{t("noRepairmenFound")}</h3>
            <p style={{ color: "#666" }}>{t("tryAdjusting")}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px" }}>
            {repairmen.map((repairman) => (
              <div
                key={repairman._id}
                style={{
                  background: "#fff",
                  padding: "20px",
                  borderRadius: "16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s ease, boxShadow 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                }}
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">👨‍🔧</div>
                  <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>{repairman.name}</h3>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  {repairman.profile?.wilaya && <p>📍 {t("wilaya")}: {repairman.profile.wilaya}</p>}
                  {repairman.profile?.experienceYears > 0 && (
                    <p>⏰ {repairman.profile.experienceYears} {repairman.profile.experienceYears !== 1 ? t("years") : t("year")} {t("experience")}</p>
                  )}
                  {repairman.profile?.ratingsAvg > 0 && <div>⭐ {getRatingStars(repairman.profile.ratingsAvg)}</div>}
                  {user ? (
                    repairman.profile?.phone ? (
                      <p>📞 {t("phoneNumber")}: {repairman.profile.phone}</p>
                    ) : (
                      <p className="italic text-gray-500">📞 {t("noPhoneNumber")}</p>
                    )
                  ) : (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md text-center text-xs text-gray-600">
                      {t("loginToView")}
                    </div>
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
