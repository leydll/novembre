import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminCreate() {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.post("/recipes", { title, ingredients, steps }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Recette ajoutée !");
      navigate("/recipes");
    } catch (err) {
      console.error(err);
      alert("Erreur ajout recette");
    }
  };

  return (
    <div>
      <h1>Créer une recette</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="Ingrédients" value={ingredients} onChange={e => setIngredients(e.target.value)} />
        <textarea placeholder="Étapes" value={steps} onChange={e => setSteps(e.target.value)} />
        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
}
