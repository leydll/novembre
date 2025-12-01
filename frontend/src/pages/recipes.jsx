import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    api.get("/recipes")
      .then(res => setRecipes(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <main>
      <h1 className="page-title">Toutes les recettes</h1>
      <p className="page-subtitle">Découvrez toutes les douceurs épinglées sur PinRecettes.</p>
      <div className="recipes-grid">
        {recipes.map((r) => (
          <article key={r.id} className="recipe-card">
            <h2 className="recipe-card-title">
              <Link to={`/recipes/${r.id}`}>{r.title}</Link>
            </h2>
            <div className="recipe-card-meta">
              <span className="chip-small">
                ❤️ {r.likes_count ?? 0}
              </span>
              <span className="chip-small">
                #{r.id}
              </span>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
