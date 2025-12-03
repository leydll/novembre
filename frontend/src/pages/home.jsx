import { useEffect, useState } from "react";
import api from "../services/api";
import RecipeCard from "../components/RecipeCard";

export default function Home({ user }) {
  const [recipes, setRecipes] = useState([]);
  const [siteDescription, setSiteDescription] = useState("");

  useEffect(() => {
    api
      .get("/recipes") // côté backend pour les non connectés
      .then((res) => {
        console.log("Recettes reçues (home):", res.data);
        setRecipes((res.data || []).slice(0, 8)); // 8 recettes populaires
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des recettes (home):", err);
        setRecipes([]);
      });

    // Charger la description du site
    api
      .get("/auth/site/description")
      .then((res) => {
        setSiteDescription(res.data.description || "");
      })
      .catch((err) => {
        console.error("Erreur lors du chargement de la description:", err);
      });
  }, []);

  return (
    <main>
      <h1 className="page-title">bienvenue :)))</h1>
      {siteDescription && (
        <section
          style={{
            marginBottom: "2rem",
            padding: "1.5rem",
            background: "var(--color-white)",
            borderRadius: "20px",
            border: "1px solid var(--color-border)",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)",
          }}
        >
          <p
            style={{
              lineHeight: "1.6",
              color: "var(--color-text)",
              fontSize: "1rem",
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {siteDescription}
          </p>
        </section>
      )}
      <p className="page-subtitle">
        {user
          ? "Voici quelques recettes populaires, épinglées juste pour vous."
          : "Découvrez quelques recettes populaires. Inscrivez-vous ou connectez-vous pour voir toutes les recettes !"}
      </p>
      <h2>Recettes populaires</h2>
      <div className="recipes-grid">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} titleLevel="h3" />
        ))}
      </div>
    </main>
  );
}
