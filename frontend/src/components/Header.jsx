import { Link, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "./axiosConfig";
import "../assets/Header.css";

function Header() {
  const [nombre, setNombre] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setNombre(false);
    axios
      .get("/usuario")
      .then((res) => {
        if (res.data && res.data.nombre) {
          // Usuario autenticado
          setNombre(true);
          if (location.pathname == "/login") navigate("/");
        } else {
          setNombre(false);
          navigate("/login");
        }
      })
      .catch(() => {
        setNombre(false);
        navigate("/login");
      });
  }, [navigate]);

  const handleLogout = async () => {
    await axios.post("/logout");
    navigate("/login"); // Redirige a la página de login
  };

  return (
    <header className="header">
      <div className="div-header">
        <img className="logo-izquierda" src="/LOGO_HEADER.svg"></img>
        {nombre && <h1 className="h-header">Repositorio Digital</h1>}
      </div>

      {nombre && (
        <nav className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/subir-archivo">Subir archivo</Link>
          <Link to="/perfil">Perfil</Link>
          <button className="link" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </nav>
      )}
    </header>
  );
}

export default Header;
