import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";
import logo from "../assets/images/logo-eco-electro.png";
import api from "../api"; // ✅ pour récupérer les notifications

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Vérifie l'utilisateur connecté au chargement
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      // ⚡ Si vendeur → charger ses notifications
      if (parsedUser.role === "seller") {
        loadNotifications();
      }
    }
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      const unread = data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications :", error);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setShowAuthModal(false);

    if (userData.role === "seller") {
      loadNotifications();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowUserMenu(false);
    navigate("/");
  };

  // ⚡ Ouvre le modal uniquement si l'utilisateur n'est pas connecté
  const handleRestrictedClick = (path, e) => {
    if (!user) {
      e.preventDefault();
      setShowAuthModal(true);
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo flex items-center gap-2">
            <img src={logo} alt="SmartEE" style={{ height: "70px" }} />
            <span>SmartEE</span>
          </Link>

          <ul className="nav-links">
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/marketplace">Produits</Link></li>
            <li>
              <a href="#" onClick={(e) => handleRestrictedClick("/energy", e)}>
                Comparaison Énergétique
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => handleRestrictedClick("/repairmen", e)}>
                Réparateurs
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => handleRestrictedClick("/basket", e)}>
                🛒 Mon Panier
              </a>
            </li>

            {/* ✅ Liens réservés aux vendeurs */}
            {user && user.role === "seller" && (
              <>
                <li>
                  <Link to="/seller/dashboard">📊 Dashboard Vendeur</Link>
                </li>
                <li style={{ position: "relative" }}>
                  <Link to="/notifications">
                    🔔 Notifications
                    {unreadCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-12px",
                          background: "red",
                          color: "white",
                          borderRadius: "50%",
                          padding: "2px 7px",
                          fontSize: "12px",
                        }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
              </>
            )}

            {user ? (
              <li className="user-menu">
                <button
                  className="user-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  👤 {user.name}
                </button>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <Link to="/profile">Mon Profil</Link>
                    {user.role === "seller" && (
                      <Link to="/seller/dashboard">Mon Dashboard</Link>
                    )}
                    <button onClick={handleLogout} className="logout-btn">
                      Se déconnecter
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <li>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAuthModal(true)}
                >
                  Se connecter
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Modal Auth */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Navbar;




