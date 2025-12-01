import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Home({ user }) {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    api.get("/recipes") // côté backend pour les non connectés
      .then(res => setRecipes(res.data.slice(0, 5))) // 5 recettes populaires
      .catch(err => console.error(err));
  }, []);

  return (
    <main>
      <h1 className="page-title">
        {user ? `Bienvenue ${user.username} 👋` : "Bienvenue sur PinRecettes"}
      </h1>
      <p className="page-subtitle">
        {user
          ? "Voici quelques recettes populaires, épinglées juste pour vous."
          : "Inscrivez-vous ou connectez-vous pour accéder à toutes les recettes et fonctionnalités."}
      </p>
      <h2>Recettes populaires</h2>
      <div className="recipes-grid">
        {recipes.map((r) => (
          <article key={r.id} className="recipe-card">
            <h3 className="recipe-card-title">
              <Link to={`/recipes/${r.id}`}>{r.title}</Link>
            </h3>
            <div className="recipe-card-meta">
              <span className="chip-small">
                ❤️ {r.likes_count ?? 0}
              </span>
              <span className="chip-small">Populaire</span>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
