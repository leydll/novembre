import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";

function App() {
  return (
    <div>
      <nav>
        <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<h1>Accueil</h1>} />
      </Routes>
    </div>
  );
}

export default App;
