import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav style={{ display: "flex", gap: "15px", padding: "10px", borderBottom: "1px solid #ccc" }}>
      <Link to="/">Accueil</Link>
      <Link to="/recipes">Recettes</Link>
      {user && <Link to="/profile">Profil</Link>}

      <input 
        type="text" 
        placeholder="Rechercher..." 
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            navigate(`/search?q=${e.target.value}`);
          }
        }} 
        style={{ marginLeft: "auto" }}
      />

      {user ? (
        <>
          {user.role === "admin" && <Link to="/admin/create">Ajouter recette</Link>}
          <span>{user.username}</span>
          <button onClick={handleLogout}>Déconnexion</button>
        </>
      ) : (
        <>
          <Link to="/login">Connexion</Link>
          <Link to="/register">Inscription</Link>
        </>
      )}
    </nav>
  );
}
