import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Recipes from "./pages/recipes";
import RecipeDetail from "./pages/recipeDetail";
import Login from "./pages/login";
import Register from "./pages/register";
import Profile from "./pages/profile";
import AdminCreate from "./pages/admin";
import Search from "./pages/search";
import Legal from "./pages/legal";
import Recommendations from "./pages/recommendations";
import api from "./services/api";
import './App.css';


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Vérifier le token localStorage et récupérer infos utilisateur
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setUser(res.data))
        .catch(() => {
          setUser(null);
          localStorage.removeItem("token");
        });
    }
  }, []);

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/recipes" element={<Recipes user={user} />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
        <Route path="/search" element={<Search />} />
        <Route path="/admin/create" element={user?.role === "admin" ? <AdminCreate /> : <Home />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/recommendations" element={<Recommendations />} />
      </Routes>
      <footer>
        <div className="app-shell">
          <span>© {new Date().getFullYear()} bakesomecaakes</span>
          <a href="/legal">Mentions légales & confidentialité</a>
        </div>
      </footer>
    </>
  );
}

export default App;
