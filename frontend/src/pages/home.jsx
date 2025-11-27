import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Home() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    api.get("/recipes") // côté backend pour les non connectés
      .then(res => setRecipes(res.data.slice(0, 5))) // 5 recettes populaires
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Bienvenue sur Mon blod de recettes</h1>
      <h2>Recettes populaires</h2>
      {recipes.map(r => (
        <div key={r.id}>
          <Link to={`/recipes/${r.id}`}>{r.title}</Link>
        </div>
      ))}
      <p>Connectez-vous pour voir toutes les recettes et les recommandations.</p>
    </div>
  );
}
