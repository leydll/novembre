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
          <article key={r.id} className="recipe-card">
            <Link to={`/recipes/${r.id}`}>
              <img
                src={r.image || "https://via.placeholder.com/400x250?text=Recette"}
                alt={r.title}
                className="recipe-card-image"
              />
            </Link>
            <div className="recipe-card-body">
              <h2 className="recipe-card-title">
                <Link to={`/recipes/${r.id}`}>{r.title}</Link>
              </h2>
              <div className="recipe-card-meta">
                <span className="badge">❤️ {r.likes_count ?? 0}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}


