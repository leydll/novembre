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
    <div>
      <h1>Liste des recettes</h1>
      {recipes.map(r => (
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
  );
}
