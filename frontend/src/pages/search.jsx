import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";

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
      setRecipes([]);
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
    <div>
      <h1>Résultats de recherche</h1>
      {q && <p>Recherche pour : <strong>{q}</strong></p>}

      {loading && <p>Chargement...</p>}

      {!loading && q && recipes.length === 0 && (
        <p>Aucune recette trouvée pour cette recherche.</p>
      )}

      <div>
        {recipes.map((r) => (
          <div key={r.id}>
            <Link to={`/recipes/${r.id}`}>{r.title}</Link>
            {typeof r.likes_count !== "undefined" && (
              <span style={{ marginLeft: "10px", fontSize: "0.9rem" }}>
                ❤️ {r.likes_count}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


