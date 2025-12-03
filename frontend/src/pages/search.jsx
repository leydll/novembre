import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import RecipeCard from "../components/RecipeCard";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function Search() {
  const query = useQuery();
  const q = query.get("q") || "";

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecipes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get("/recipes", { params: { q } })
      .then((res) => setRecipes(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <main>
      <h1 className="page-title">Résultats de recherche</h1>
      {q && (
        <p className="page-subtitle">
          Recherche pour : <strong>{q}</strong>
        </p>
      )}

      {loading && <p>Chargement...</p>}

      {!loading && q && recipes.length === 0 && (
        <p>Aucune recette trouvée pour cette recherche.</p>
      )}

      <div className="recipes-grid">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
    </main>
  );
}


