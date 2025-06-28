import React, { useState, useEffect } from "react";
import axios from "../components/axiosConfig";
import "../assets/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [typeMessage, setTypeMessage] = useState(""); // 'error' o 'exito'

  // Limpiar mensaje después de 3 segundos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setTypeMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Comprobar usuario con axios
      await axios.post("/login", { username: email, password });
      // Si la respuesta es exitosa, redirigir al usuario
      window.location.href = "/home";
    } catch (error) {
      console.error("Error al autenticar al usuario:", error);
      setMessage("Credenciales inválidas"); // Mostrar un mensaje de error
      setTypeMessage("error");
    }
  };

  return (
    <div className="div-login">
      <form className="form-login" onSubmit={handleSubmit}>
        <h1 className="h-login">Iniciar Sesión</h1>
        <input
          className="element-form"
          type="email"
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
      {message && (
        <div
          className={`message-pop ${
            typeMessage === "error" ? "message-error" : "message-success"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default Login;
