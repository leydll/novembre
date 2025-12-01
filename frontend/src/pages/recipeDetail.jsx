import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    // Récupérer les infos de la recette (avec likes_count)
    api.get(`/recipes/${id}`)
      .then(res => {
        setRecipe(res.data);
        setLikesCount(res.data.likes_count || 0);
      })
      .catch(err => console.error(err));

    // Vérifier si l'utilisateur a liké (si connecté)
    const token = localStorage.getItem("token");
    if (token) {
      api.get(`/recipes/${id}/like`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setIsLiked(res.data.liked))
        .catch(() => {
          // en cas d'erreur (non connecté, etc.), on ignore
        });
    } else {
      setIsLiked(false);
    }
  }, [id]);

  const handleToggleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vous devez être connecté pour liker une recette");
      return;
    }

    try {
      if (isLiked) {
        await api.delete(`/recipes/${id}/like`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        await api.post(`/recipes/${id}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
      alert("Impossible de mettre à jour le like");
    }
  };

  if (!recipe) return <p>Chargement...</p>;

  return (
    <div>
      <h1>{recipe.title}</h1>
      <button onClick={handleToggleLike}>
        {isLiked ? "💔 Retirer le like" : "❤️ Liker"}
      </button>
      <span style={{ marginLeft: "10px" }}>
        {likesCount} like{likesCount > 1 ? "s" : ""}
      </span>
      <h2>Ingrédients</h2>
      <pre>{recipe.ingredients}</pre>
      <h2>Étapes</h2>
      <pre>{recipe.steps}</pre>
    </div>
  );
}
