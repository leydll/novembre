import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Profile({ user, setUser }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // États pour la gestion admin
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [errorUsers, setErrorUsers] = useState("");
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    image: "",
    ingredients: "",
    steps: "",
  });
  const [siteDescription, setSiteDescription] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);
  const [loadingDescription, setLoadingDescription] = useState(false);

  const isAdmin = user?.role === "admin";

  // Mettre à jour les valeurs du formulaire quand user change
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Définir les fonctions avant le useEffect
  const loadUsers = async () => {
    setLoadingUsers(true);
    setErrorUsers("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorUsers("Token manquant. Veuillez vous reconnecter.");
        setLoadingUsers(false);
        return;
      }

      console.log(
        "Tentative de chargement des utilisateurs avec token:",
        token.substring(0, 20) + "..."
      );
      const res = await api.get("/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Utilisateurs reçus:", res.data);
      setUsers(res.data || []);
      setErrorUsers("");
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
      console.error("Status:", err.response?.status);
      console.error("Détails de l'erreur:", err.response?.data);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Erreur lors du chargement des utilisateurs";
      setErrorUsers(errorMessage);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadRecipes = async () => {
    setLoadingRecipes(true);
    try {
      const res = await api.get("/recipes");
      setRecipes(res.data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des recettes:", err);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const loadSiteDescription = async () => {
    try {
      const res = await api.get("/auth/site/description");
      console.log("Description reçue:", res.data);
      setSiteDescription(res.data.description || "");
    } catch (err) {
      console.error("Erreur lors du chargement de la description:", err);
      console.error("Détails de l'erreur:", err.response?.data);
      // Ne pas afficher d'erreur si la table n'existe pas encore
      setSiteDescription("");
    }
  };

  // Charger les utilisateurs (admin seulement)
  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadRecipes();
      loadSiteDescription();
    }
  }, [isAdmin]);

  const handleUpdateDescription = async () => {
    setLoadingDescription(true);
    setError("");
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await api.patch(
        "/auth/site/description",
        { description: siteDescription },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Description mise à jour:", res.data);
      setMessage("Description mise à jour avec succès.");
      setEditingDescription(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la description:", err);
      console.error("Détails de l'erreur:", err.response?.data);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Erreur lors de la mise à jour de la description"
      );
    } finally {
      setLoadingDescription(false);
    }
  };

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
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);
      setPassword("");
      setMessage("Profil mis à jour avec succès.");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Erreur lors de la mise à jour du profil"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Utilisateur supprimé avec succès.");
      loadUsers();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la suppression de l'utilisateur"
      );
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Recette supprimée avec succès.");
      loadRecipes();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la suppression de la recette"
      );
    }
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe.id);
    setEditForm({
      title: recipe.title || "",
      description: recipe.description || "",
      image: recipe.image || "",
      ingredients: recipe.ingredients || "",
      steps: recipe.steps || "",
    });
  };

  const handleUpdateRecipe = async (recipeId) => {
    try {
      const token = localStorage.getItem("token");
      await api.patch(`/recipes/${recipeId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Recette mise à jour avec succès.");
      setEditingRecipe(null);
      loadRecipes();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour de la recette"
      );
    }
  };

  const cancelEdit = () => {
    setEditingRecipe(null);
    setEditForm({
      title: "",
      description: "",
      image: "",
      ingredients: "",
      steps: "",
    });
  };

  // Tous les Hooks doivent être avant le return conditionnel
  if (!user) return <p>Connectez-vous pour voir votre profil.</p>;

  return (
    <main>
      <div className="admin-page" style={{ width: "100%", maxWidth: "100%" }}>
        <h1>Mon Profil</h1>

        <form onSubmit={handleSubmit}>
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

        {message && (
          <p style={{ color: "green", marginTop: "1rem", textAlign: "center" }}>
            {message}
          </p>
        )}
        {error && (
          <p style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>
            {error}
          </p>
        )}

        {/* Section Admin */}
        {isAdmin && (
          <>
            {/* Ligne avec 3 colonnes : Utilisateurs | Résumé | Recettes */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "2rem",
                marginTop: "2rem",
                width: "100%",
              }}
            >
              {/* Colonne 1 - Utilisateurs */}
              <section
                style={{
                  padding: "1.5rem",
                  background: "var(--color-white)",
                  borderRadius: "20px",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)",
                  minHeight: "400px",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-title)",
                    fontSize: "1.5rem",
                    marginBottom: "1rem",
                    color: "var(--color-text)",
                  }}
                >
                  Gestion des utilisateurs
                </h2>
                {loadingUsers ? (
                  <p
                    style={{ textAlign: "center", color: "var(--color-muted)" }}
                  >
                    Chargement...
                  </p>
                ) : errorUsers ? (
                  <div style={{ textAlign: "center", padding: "1rem" }}>
                    <p style={{ color: "#ff4444", marginBottom: "0.5rem" }}>
                      {errorUsers}
                    </p>
                    <button
                      onClick={loadUsers}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "var(--color-accent)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "20px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      Réessayer
                    </button>
                  </div>
                ) : (
                  <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {users.length === 0 ? (
                      <p
                        style={{
                          textAlign: "center",
                          color: "var(--color-muted)",
                        }}
                      >
                        Aucun utilisateur
                      </p>
                    ) : (
                      <table
                        style={{ width: "100%", borderCollapse: "collapse" }}
                      >
                        <thead>
                          <tr
                            style={{
                              borderBottom: "1px solid var(--color-border)",
                            }}
                          >
                            <th
                              style={{
                                padding: "0.75rem",
                                textAlign: "left",
                                fontFamily: "var(--font-title)",
                                fontSize: "0.9rem",
                              }}
                            >
                              ID
                            </th>
                            <th
                              style={{
                                padding: "0.75rem",
                                textAlign: "left",
                                fontFamily: "var(--font-title)",
                                fontSize: "0.9rem",
                              }}
                            >
                              Nom
                            </th>
                            <th
                              style={{
                                padding: "0.75rem",
                                textAlign: "left",
                                fontFamily: "var(--font-title)",
                                fontSize: "0.9rem",
                              }}
                            >
                              Email
                            </th>
                            <th
                              style={{
                                padding: "0.75rem",
                                textAlign: "left",
                                fontFamily: "var(--font-title)",
                                fontSize: "0.9rem",
                              }}
                            >
                              Rôle
                            </th>
                            <th
                              style={{
                                padding: "0.75rem",
                                textAlign: "center",
                                fontFamily: "var(--font-title)",
                                fontSize: "0.9rem",
                              }}
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => (
                            <tr
                              key={u.id}
                              style={{
                                borderBottom: "1px solid var(--color-border)",
                              }}
                            >
                              <td
                                style={{
                                  padding: "0.75rem",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {u.id}
                              </td>
                              <td
                                style={{
                                  padding: "0.75rem",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {u.username}
                              </td>
                              <td
                                style={{
                                  padding: "0.75rem",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {u.email}
                              </td>
                              <td
                                style={{
                                  padding: "0.75rem",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {u.role}
                              </td>
                              <td
                                style={{
                                  padding: "0.75rem",
                                  textAlign: "center",
                                }}
                              >
                                {u.id !== user.id && (
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    style={{
                                      padding: "0.4rem 0.8rem",
                                      background: "#ff4444",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "20px",
                                      cursor: "pointer",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    Supprimer
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </section>

              {/* Colonne 2 - Résumé modifiable */}
              <section
                style={{
                  padding: "1.5rem",
                  background: "var(--color-white)",
                  borderRadius: "20px",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)",
                  minHeight: "400px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--font-title)",
                      fontSize: "1.5rem",
                      color: "var(--color-text)",
                      margin: 0,
                    }}
                  >
                    Résumé du site
                  </h2>
                  {!editingDescription && (
                    <button
                      onClick={() => setEditingDescription(true)}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "var(--color-accent)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "20px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      Modifier
                    </button>
                  )}
                </div>
                {editingDescription ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <textarea
                      value={siteDescription}
                      onChange={(e) => setSiteDescription(e.target.value)}
                      rows="4"
                      style={{
                        padding: "1rem",
                        borderRadius: "10px",
                        border: "1px solid var(--color-border)",
                        fontFamily: "var(--font-body)",
                        fontSize: "1rem",
                        resize: "vertical",
                      }}
                      placeholder="Entrez la description du site..."
                    />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={handleUpdateDescription}
                        disabled={loadingDescription}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "var(--color-accent)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "20px",
                          cursor: "pointer",
                        }}
                      >
                        {loadingDescription
                          ? "Enregistrement..."
                          : "Enregistrer"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingDescription(false);
                          loadSiteDescription();
                        }}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "var(--color-muted)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "20px",
                          cursor: "pointer",
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      lineHeight: "1.6",
                      color: "var(--color-text)",
                      fontSize: "1rem",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {siteDescription || "Aucune description définie."}
                  </p>
                )}
              </section>

              {/* Colonne 3 - Recettes */}
              <section
                style={{
                  padding: "1.5rem",
                  background: "var(--color-white)",
                  borderRadius: "20px",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)",
                  minHeight: "400px",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-title)",
                    fontSize: "1.5rem",
                    marginBottom: "1rem",
                    color: "var(--color-text)",
                  }}
                >
                  Gestion des recettes
                </h2>
                {loadingRecipes ? (
                  <p
                    style={{ textAlign: "center", color: "var(--color-muted)" }}
                  >
                    Chargement...
                  </p>
                ) : (
                  <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                    {recipes.length === 0 ? (
                      <p
                        style={{
                          textAlign: "center",
                          color: "var(--color-muted)",
                        }}
                      >
                        Aucune recette
                      </p>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "1rem",
                        }}
                      >
                        {recipes.map((recipe) => (
                          <div
                            key={recipe.id}
                            style={{
                              padding: "1rem",
                              border: "1px solid var(--color-border)",
                              borderRadius: "10px",
                            }}
                          >
                            {editingRecipe === recipe.id ? (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.75rem",
                                }}
                              >
                                <input
                                  type="text"
                                  placeholder="Titre"
                                  value={editForm.title}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      title: e.target.value,
                                    })
                                  }
                                  style={{
                                    padding: "0.5rem",
                                    borderRadius: "10px",
                                    border: "1px solid var(--color-border)",
                                  }}
                                />
                                <textarea
                                  placeholder="Description"
                                  value={editForm.description}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      description: e.target.value,
                                    })
                                  }
                                  rows="2"
                                  style={{
                                    padding: "0.5rem",
                                    borderRadius: "10px",
                                    border: "1px solid var(--color-border)",
                                  }}
                                />
                                <input
                                  type="url"
                                  placeholder="URL de l'image"
                                  value={editForm.image}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      image: e.target.value,
                                    })
                                  }
                                  style={{
                                    padding: "0.5rem",
                                    borderRadius: "10px",
                                    border: "1px solid var(--color-border)",
                                  }}
                                />
                                <textarea
                                  placeholder="Ingrédients"
                                  value={editForm.ingredients}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      ingredients: e.target.value,
                                    })
                                  }
                                  rows="3"
                                  style={{
                                    padding: "0.5rem",
                                    borderRadius: "10px",
                                    border: "1px solid var(--color-border)",
                                  }}
                                />
                                <textarea
                                  placeholder="Étapes"
                                  value={editForm.steps}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      steps: e.target.value,
                                    })
                                  }
                                  rows="3"
                                  style={{
                                    padding: "0.5rem",
                                    borderRadius: "10px",
                                    border: "1px solid var(--color-border)",
                                  }}
                                />
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                  <button
                                    onClick={() =>
                                      handleUpdateRecipe(recipe.id)
                                    }
                                    style={{
                                      padding: "0.5rem 1rem",
                                      background: "var(--color-accent)",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "20px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Enregistrer
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    style={{
                                      padding: "0.5rem 1rem",
                                      background: "var(--color-muted)",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "20px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Annuler
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <h3
                                  style={{
                                    fontFamily: "var(--font-title)",
                                    marginBottom: "0.5rem",
                                  }}
                                >
                                  {recipe.title}
                                </h3>
                                <p
                                  style={{
                                    fontSize: "0.9rem",
                                    color: "var(--color-muted)",
                                    marginBottom: "0.5rem",
                                  }}
                                >
                                  ID: {recipe.id} | ❤️ {recipe.likes_count ?? 0}
                                </p>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "0.5rem",
                                    marginTop: "0.75rem",
                                  }}
                                >
                                  <button
                                    onClick={() => handleEditRecipe(recipe)}
                                    style={{
                                      padding: "0.4rem 0.8rem",
                                      background: "var(--color-accent)",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "20px",
                                      cursor: "pointer",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    Modifier
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteRecipe(recipe.id)
                                    }
                                    style={{
                                      padding: "0.4rem 0.8rem",
                                      background: "#ff4444",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "20px",
                                      cursor: "pointer",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    Supprimer
                                  </button>
                                  <button
                                    onClick={() =>
                                      navigate(`/recipes/${recipe.id}`)
                                    }
                                    style={{
                                      padding: "0.4rem 0.8rem",
                                      background: "var(--color-muted)",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "20px",
                                      cursor: "pointer",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    Voir
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
