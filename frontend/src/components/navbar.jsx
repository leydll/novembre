import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const hideSearch = location.pathname === "/login" || location.pathname === "/register";

  const handleLogout = async () => {
    try {
      // Demande au backend d'effacer le cookie HttpOnly
      await api.post("/auth/logout");
    } catch {
      // On ignore les erreurs ici, on nettoie côté client quoi qu'il arrive
    }
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      const value = e.target.value.trim();
      console.log("Recherche déclenchée avec:", value);
      if (value) {
        navigate(`/search?q=${encodeURIComponent(value)}`);
      } else {
        // Si la recherche est vide, rediriger vers toutes les recettes
        navigate("/recipes");
      }
    }
  };

  return (
    <>
      <header className="app-shell navbar-container">
        <nav className="navbar">
          <div className="navbar-left">
            <Link to="/" className="navbar-logo">bakesomecaakes</Link>
            <Link to="/recipes" className="navbar-link">Recettes</Link>
            <Link to="/recommendations" className="navbar-link">Recommandations</Link>
            {user && <Link to="/profile" className="navbar-link">Profil</Link>}
            {user?.role === "admin" && (
              <Link to="/admin/create" className="navbar-link">Ajouter recette</Link>
            )}
          </div>

          <div className="navbar-right">
            {user ? (
              <>
                <span className="navbar-username">{user.username}</span>
                <button className="btn-ghost" onClick={handleLogout}>Déconnexion</button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-link navbar-link-bordered">Connexion</Link>
                <Link to="/register" className="btn-primary navbar-link-bordered">Inscription</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      {!hideSearch && (
        <div className="search-bar-container">
          <div className="app-shell">
            <input
              type="text"
              className="search-bar"
              placeholder="Rechercher une recette..."
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>
      )}
    </>
  );
}
