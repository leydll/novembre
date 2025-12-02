import { useState } from "react";
import api from "../services/api";

export default function Profile({ user, setUser }) {
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return <p>Connectez-vous pour voir votre profil.</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const payload = { username, email };
      if (password.trim() !== "") {
        payload.password = password;
      }

      const res = await api.patch("/auth/me", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data);
      setPassword("");
      setMessage("Profil mis à jour avec succès.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Profil</h1>
      <p>Rôle : {user.role}</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: "400px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <label>
          Nom d&apos;utilisateur
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Nouveau mot de passe (optionnel)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Laisser vide pour ne pas changer"
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
