import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import RecipeCard from "../components/RecipeCard";

export default function Recipes({ user }) {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    if (user) {
      api
        .get("/recipes")
        .then((res) => {
          console.log("Recettes reçues:", res.data);
          setRecipes(res.data || []);
        })
        .catch((err) => {
          console.error("Erreur lors du chargement des recettes:", err);
          setRecipes([]);
        });
    }
  }, [user]);

  // Si l'utilisateur n'est pas connecté, afficher un message
  if (!user) {
    return (
      <main>
        <div className="admin-page">
          <h1 className="page-title">Toutes les recettes</h1>
          <p
            className="page-subtitle"
            style={{ textAlign: "center", marginBottom: "2rem" }}
          >
            Inscrivez-vous ou connectez-vous pour accéder à toutes les recettes
            et fonctionnalités.
          </p>
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link
              to="/register"
              style={{
                display: "inline-block",
                padding: "0.9rem 2rem",
                marginRight: "1rem",
                background: "var(--color-accent)",
                color: "#ffffff",
                border: "none",
                borderRadius: "50px",
                textDecoration: "none",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                boxShadow: "0px 2px 8px rgba(247, 184, 198, 0.3)",
                transition: "all 0.2s",
              }}
            >
              S&apos;inscrire
            </Link>
            <Link
              to="/login"
              style={{
                display: "inline-block",
                padding: "0.9rem 2rem",
                background: "transparent",
                color: "var(--color-accent)",
                border: "2px solid var(--color-accent)",
                borderRadius: "50px",
                textDecoration: "none",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                transition: "all 0.2s",
              }}
            >
              Se connecter
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1 className="page-title">Toutes les recettes</h1>
      <p className="page-subtitle">
        Découvrez toutes les douceurs de bakesomecaakes.
      </p>
      {recipes.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            color: "var(--color-muted)",
            marginTop: "2rem",
          }}
        >
          Chargement des recettes...
        </p>
      ) : (
        <div className="recipes-grid">
          {recipes.map((r) => {
            if (!r || !r.id) {
              console.warn("Recette invalide:", r);
              return null;
            }
            return <RecipeCard key={r.id} recipe={r} />;
          })}
        </div>
      )}
    </main>
  );
}
