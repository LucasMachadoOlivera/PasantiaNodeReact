import React, { useState, useEffect } from "react";
import axios from "./axiosConfig";
import "../assets/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //const [email, setEmail] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState(""); // 'error' o 'exito'

  // Limpiar mensaje después de 3 segundos
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        setMensaje("");
        setTipoMensaje("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Hacer la solicitud de autenticación usando axios
      await axios.post("/login", { username: email, password });

      // Si la respuesta es exitosa, redirigir al usuario
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error al autenticar al usuario:", error);
      setMensaje("Credenciales inválidas"); // Mostrar un mensaje de error
      setTipoMensaje("error");
    }
  };

  return (
    <div className="div-login">
      <form className="form-login" onSubmit={handleSubmit}>
        <h1 className="h-login">Iniciar Sesión</h1>
        <input
          className="element-form"
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="element-form"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="element-form" type="submit">
          Iniciar Sesión
        </button>
      </form>
      {mensaje && (
        <div
          className={`mensaje-pop ${
            tipoMensaje === "error" ? "mensaje-error" : "mensaje-exito"
          }`}
        >
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default Login;
