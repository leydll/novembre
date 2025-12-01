import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    api.get(`/recipes/${id}`)
      .then(res => setRecipe(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!recipe) return <p>Chargement...</p>;

  return (
    <div>
      <h1>{recipe.title}</h1>
      <h2>Ingrédients</h2>
      <pre>{recipe.ingredients}</pre>
      <h2>Étapes</h2>
      <pre>{recipe.steps}</pre>
    </div>
  );
}
