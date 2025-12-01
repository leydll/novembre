import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register({ setUser }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consent) {
      alert("Vous devez accepter l'utilisation de vos données pour continuer.");
      return;
    }
    try {
      const res = await api.post("/auth/register", { username, email, password, consent: true });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        // Récupérer les infos utilisateur avec le token dans les headers
        const userRes = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${res.data.token}` }
        });
        setUser(userRes.data);
        alert("Inscription réussie !");
        // Redirection selon le rôle
        if (userRes.data.role === "admin") {
          navigate("/admin/create");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Erreur inscription");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nom d'utilisateur"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
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
        minLength={12}
        title="Au moins 12 caractères, avec majuscule, minuscule, chiffre et caractère spécial"
        required
      />
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
        />
        <span>
          J'accepte que mes données soient utilisées pour la gestion de mon compte, conformément aux
          mentions légales.
        </span>
      </label>
      <button type="submit">Register</button>
    </form>
  );
}
