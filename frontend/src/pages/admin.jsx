import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/recipes",
        {
          title,
          description: description || null,
          image: image || null,
          ingredients,
          steps,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Recette ajoutée !");
      navigate("/recipes");
    } catch (err) {
      console.error(err);
      alert("Erreur ajout recette");
    }
  };

  return (
    <main>
      <div className="admin-page">
        <h1>Créer une recette</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description (optionnel)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />
          <div className="image-url-input-wrapper">
            <input
              type="url"
              className="image-url-input"
              placeholder="URL de l'image (optionnel)"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            {image && (
              <button
                type="button"
                className="clear-image-btn"
                onClick={() => setImage("")}
                title="Effacer l'URL"
              >
                ×
              </button>
            )}
          </div>
          {image && (
            <div style={{ marginBottom: "1rem" }}>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--color-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                Aperçu :
              </p>
              <img
                src={image}
                alt="Aperçu"
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  borderRadius: "10px",
                  objectFit: "cover",
                  border: "1px solid var(--color-border)",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}
          <textarea
            placeholder="Ingrédients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
          />
          <textarea
            placeholder="Étapes"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            required
          />
          <button type="submit">Ajouter la recette</button>
        </form>
      </div>
    </main>
  );
}
