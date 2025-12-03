import { Link } from "react-router-dom";

export default function RecipeCard({ recipe, titleLevel = "h2", secondaryBadge }) {
  if (!recipe) {
    console.warn("RecipeCard: recipe is null or undefined");
    return null;
  }

  const TitleTag = titleLevel;

  return (
    <article className="recipe-card">
      <Link to={`/recipes/${recipe.id}`}>
        <img
          src={recipe.image || "https://via.placeholder.com/400x250?text=Recette"}
          alt={recipe.title || "Recette"}
          className="recipe-card-image"
        />
      </Link>
      <div className="recipe-card-body">
        <TitleTag className="recipe-card-title">
          <Link to={`/recipes/${recipe.id}`}>{recipe.title || "Sans titre"}</Link>
        </TitleTag>
        <div className="recipe-card-meta">
          <span className="badge">❤️ {recipe.likes_count ?? 0}</span>
          {secondaryBadge && <span className="badge">{secondaryBadge}</span>}
        </div>
      </div>
    </article>
  );
}


