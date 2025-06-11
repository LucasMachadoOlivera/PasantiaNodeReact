import React, { useEffect, useState } from "react";

import "../assets/Dashboard.css";
import { useNavigate } from "react-router-dom";
import axios from "./../components/axiosConfig";
import "../assets/Perfil.css";

export default function Dashboard() {
  const navigate = useNavigate(); // Usamos el hook useNavigate para redirigir al usuario
  const [usuario, setUsuario] = useState({
    id: "",
    nombre: "",
    email: "",
    fecha: "",
  });

  const [nombre, setNombre] = useState({
    nombre: "",
  });

  const [contraseña, setContraseña] = useState({
    contraseña: "",
  });

  useEffect(() => {
    // Obtener información de usuario
    axios
      .get("/usuario")
      .then((res) => {
        setUsuario({
          id: res.data.id,
          nombre: res.data.nombre,
          email: res.data.email,
          fecha: new Date(res.data.fecha).toISOString().split("T")[0],
        });
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  const actualizarPerfil = async (dato) => {
    console.log("dato", usuario);
    await axios.put(`/api/usuarios/${usuario.id}`, dato);
    setNombre({ nombre: "" });
    setContraseña({ contraseña: "" });
  };

  return (
    <div className="perfil-container">
      <h2>Perfil</h2>
      <div className="perfil-info">
        <div>
          <strong>Nombre:</strong> {usuario.nombre}
        </div>
        <div>
          <strong>Email:</strong> {usuario.email}
        </div>
      </div>
      <br />
      <h2>Cambiar Nombre</h2>
      <form>
        <input
          type="text"
          value={nombre.nombre}
          onChange={(e) => setNombre({ ...nombre, nombre: e.target.value })}
        />
        <button onClick={() => actualizarPerfil(nombre)}>
          Actualizar nombre
        </button>
      </form>

      <h2>Cambiar Contraseña</h2>
      <form>
        <input
          type="text"
          value={contraseña.contraseña}
          onChange={(e) =>
            setContraseña({ ...contraseña, contraseña: e.target.value })
          }
        />
        <button onClick={() => actualizarPerfil(contraseña)}>
          Actualizar contraseña
        </button>
      </form>
    </div>
  );
}
