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
    console.log("Recherche avec terme:", q);
    api
      .get("/recipes", { params: { q } })
      .then((res) => {
        console.log("Résultats de recherche reçus:", res.data);
        setRecipes(res.data || []);
      })
      .catch((err) => {
        console.error("Erreur lors de la recherche:", err);
        setRecipes([]);
      })
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <main>
      <h1 className="page-title">Résultats de recherche</h1>
      {q ? (
        <>
          <p className="page-subtitle">
            Recherche pour : <strong>{q}</strong>
          </p>

          {loading && (
            <p
              style={{
                textAlign: "center",
                color: "var(--color-muted)",
                marginTop: "2rem",
              }}
            >
              Chargement...
            </p>
          )}

          {!loading && recipes.length === 0 && (
            <p
              style={{
                textAlign: "center",
                color: "var(--color-muted)",
                marginTop: "2rem",
              }}
            >
              Aucune recette trouvée pour &quot;{q}&quot;.
            </p>
          )}

          {!loading && recipes.length > 0 && (
            <div className="recipes-grid">
              {recipes.map((r) => {
                if (!r || !r.id) {
                  console.warn("Recette invalide dans les résultats:", r);
                  return null;
                }
                return <RecipeCard key={r.id} recipe={r} />;
              })}
            </div>
          )}
        </>
      ) : (
        <p
          style={{
            textAlign: "center",
            color: "var(--color-muted)",
            marginTop: "2rem",
          }}
        >
          Entrez un terme de recherche dans la barre de recherche ci-dessus.
        </p>
      )}
    </main>
  );
}
