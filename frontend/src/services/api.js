import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001", // backend
  // Nécessaire pour que le cookie HttpOnly soit envoyé avec les requêtes
  withCredentials: true,
});

export default api;
