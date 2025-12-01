import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // correspond à export default

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        // Récupérer les infos utilisateur avec le token dans les headers
        const userRes = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${res.data.token}` }
        });
        setUser(userRes.data);
        alert("Connexion réussie !");
        // Redirection selon le rôle
        if (userRes.data.role === "admin") {
          navigate("/admin/create");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Erreur login");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
