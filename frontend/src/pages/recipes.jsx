import { useEffect, useState } from "react";
import api from "../services/api";
import RecipeCard from "../components/RecipeCard";

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
      <p className="page-subtitle">Découvrez toutes les douceurs de bakesomecaakes.</p>
      <div className="recipes-grid">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} secondaryBadge={`#${r.id}`} />
        ))}
      </div>
    </main>
  );
}
