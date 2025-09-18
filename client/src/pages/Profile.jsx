// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import api from "../api";
import toast from "react-hot-toast";

const Profile = () => {
  const { t } = useTranslation();
  const { user, setUser, logout } = useAuth();
  const [form, setForm] = useState({
    bio: "",
    experienceYears: 0,
    wilaya: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Always fetch fresh user on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data); // update AuthContext
      } catch (err) {
        console.error("❌ Failed to fetch profile:", err);
        toast.error(t("failedToFetchProfile"));
      }
    };
    fetchProfile();
  }, [setUser, t]);

  // ✅ Sync form when user changes
  useEffect(() => {
    if (user?.profile) {
      setForm({
        bio: user.profile.bio || "",
        experienceYears: user.profile.experienceYears || 0,
        wilaya: user.profile.wilaya || "",
        phone: user.profile.phone || "",
      });
    }
  }, [user]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const save = async () => {
    try {
      setLoading(true);
      const res = await api.put("/auth/me/profile", form);
      setUser(res.data); // update context with new profile
      toast.success("✅ " + t("profileUpdated"));
    } catch (err) {
      console.error(err);
      toast.error("❌ " + t("updateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const del = async () => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      await api.delete("/auth/me");
      logout();
      toast.success("🗑 " + t("accountDeleted"));
    } catch (error) {
      toast.error(t("failedToDelete"));
    }
  };

  return (
    <div style={{ padding: "60px 20px", background: "#e6f7f1", minHeight: "100vh" }}>
      <div
        style={{
          background: "#FFFFF0",
          borderRadius: "16px",
          padding: "40px",
          maxWidth: "800px",
          margin: "0 auto",
          boxShadow: "0px 6px 18px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#28a745", marginBottom: "10px" }}>
          {t("profileSettings")}
        </h1>
        <p style={{ marginBottom: "30px", color: "#555" }}>{t("completeProfile")}</p>

        {/* User Info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
              {t("fullName")}
            </label>
            <input
              type="text"
              value={user?.name || ""}
              disabled
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                background: "#f5f5f5",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
              {t("emailAddress")}
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                background: "#f5f5f5",
              }}
            />
          </div>
        </div>

        {/* Editable Profile Fields */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
            {t("bio")}
          </label>
          <textarea
            rows={3}
            placeholder={t("tellAboutYourself")}
            value={form.bio}
            onChange={(e) => updateForm("bio", e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              resize: "none",
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
              {t("experienceYears")}
            </label>
            <input
              type="number"
              min="0"
              value={form.experienceYears}
              onChange={(e) => updateForm("experienceYears", Number(e.target.value))}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #ddd",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
              {t("wilaya")}
            </label>
            <input
              type="text"
              value={form.wilaya}
              onChange={(e) => updateForm("wilaya", e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #ddd",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
            {t("phoneNumber")}
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => updateForm("phone", e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        {/* Save Button */}
        <div style={{ textAlign: "right" }}>
          <button
            onClick={save}
            disabled={loading}
            style={{
              background: "#28a745",
              color: "#FFFFF0",
              padding: "12px 24px",
              borderRadius: "10px",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            {loading ? t("saving") : t("saveChanges")}
          </button>
        </div>

        {/* Danger Zone */}
        <div
          style={{
            marginTop: "40px",
            padding: "20px",
            background: "#ffe6e6",
            borderRadius: "12px",
            border: "1px solid #ffcccc",
          }}
        >
          <h2 style={{ color: "#cc0000", marginBottom: "10px" }}>{t("dangerZone")}</h2>
          <p style={{ marginBottom: "15px" }}>{t("deleteAccountWarning")}</p>
          <button
            onClick={del}
            style={{
              background: "#cc0000",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {t("deleteAccount")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
