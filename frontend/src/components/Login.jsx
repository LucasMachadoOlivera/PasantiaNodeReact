import React, { useState } from "react";
import axios from "./axiosConfig";
import "../assets/login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  //const [email, setEmail] = useState("");

  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Hacer la solicitud de autenticación usando axios
      await axios.post("/login", { username, password });

      // Si la respuesta es exitosa, redirigir al usuario
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error al autenticar al usuario:", error);
      setMensaje("Credenciales inválidas"); // Mostrar un mensaje de error
    }
  };

  return (
    <div className="div-login">
      <form className="form-login" onSubmit={handleSubmit}>
        <h1 className="h-login">Iniciar Sesion</h1>
        <input
          className="element-form"
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="element-form"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="element-form" type="submit">
          Iniciar Sesion
        </button>
        {mensaje && <div className="mensaje-error">{mensaje}</div>}
      </form>
    </div>
  );
};

export default Login;
