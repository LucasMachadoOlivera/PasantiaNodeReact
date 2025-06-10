import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Asegúrate de importar BrowserRouter
import App from "./App";
import "./assets/nuevo.css";
import "./assets/styles.css"; // Importa el archivo de estilos

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    {" "}
    {/* Asegúrate de envolver el componente App con BrowserRouter */}
    <App />
  </BrowserRouter>
);
