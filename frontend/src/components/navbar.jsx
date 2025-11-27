import { Link } from "react-router-dom";

export default function Navbar({ user }) {
  return (
    <nav>
      <Link to="/">Accueil</Link>
      {user ? (
        <>
          <Link to="/recipes">Recettes</Link>
          {user.role === "admin" && <Link to="/admin/create">Créer recette</Link>}
          <span>{user.username}</span>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
