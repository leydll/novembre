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
    <div>
      <h1>
        {user ? `Bienvenue ${user.username} 👋` : "Bienvenue sur Mon blog de recettes"}
      </h1>
      <p>
        {user
          ? "Voici quelques recettes populaires, vous pouvez en découvrir encore plus dans la page Recettes."
          : "Inscrivez-vous ou connectez-vous pour accéder à toutes les recettes et fonctionnalités."}
      </p>
      <h2>Recettes populaires</h2>
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
