import React, { useState } from "react";

import "../assets/Dashboard.css";
import axios from "./../components/axiosConfig";
import "../assets/Perfil.css";

export default function Perfil({
  actualizarUsuario,
  usuario,
  setTypeMessage,
  setMessage,
}) {
  const [nombre, setNombre] = useState({
    nombre: "",
  });

  const [contraseña, setContraseña] = useState({
    contraseña: "",
  });

  const [verificaContraseña, setVerificaContraseña] = useState({
    contraseña: "",
  });

  const [modificar, setModificar] = useState(false);
  const actualizarPerfil = async (dato) => {
    try {
      if (
        (nombre && nombre.nombre.length > 3) ||
        (contraseña &&
          contraseña.contraseña.length > 6 &&
          contraseña.contraseña == verificaContraseña.contraseña)
      ) {
        await axios.put(`/api/usuarios/${usuario.id}`, dato);

        actualizarUsuario();
        setMessage("Perfil actualizado.");
        setTypeMessage("exito");
      } else {
        setMessage("Valor ingresado no valido.");
        setTypeMessage("error");
      }
      setNombre({ nombre: "" });
      setContraseña({ contraseña: "" });
      setVerificaContraseña({ contraseña: "" });
    } catch (err) {
      console.error(err);
      setMessage("No se pudo actualizar.");
      setTypeMessage("error");
      setNombre({ nombre: "" });
      setContraseña({ contraseña: "" });
      setVerificaContraseña({ contraseña: "" });
    }
  };

  const editarPerfil = async () => {
    setNombre({ nombre: "" });
    setContraseña({ contraseña: "" });
    setVerificaContraseña({ contraseña: "" });
    setModificar(!modificar);
  };

  return (
    <div className="perfil-container">
      <h2>Perfil</h2>
      <br />
      <div className="perfil-info">
        <div>
          <strong>Nombre:</strong> {usuario.nombre}
        </div>
        <div>
          <strong>Email:</strong> {usuario.email}
        </div>
      </div>
      <br />
      <button onClick={() => editarPerfil()}>
        {!modificar ? "Modificar Perfil" : "Cancelar"}
      </button>
      <br />

      {modificar && (
        <>
          <br />
          <h2>Cambiar Nombre</h2>
          <div>
            <input
              type="text"
              value={nombre.nombre}
              placeholder="Nuevo nombre..."
              onChange={(e) => setNombre({ ...nombre, nombre: e.target.value })}
            />
            <button onClick={() => actualizarPerfil(nombre)}>
              Actualizar nombre
            </button>
          </div>
          <br />
          <h2>Cambiar Contraseña</h2>
          <div>
            <input
              type="text"
              value={contraseña.contraseña}
              placeholder="Nueva contraseña..."
              onChange={(e) =>
                setContraseña({ ...contraseña, contraseña: e.target.value })
              }
            />
            <input
              type="text"
              value={verificaContraseña.contraseña}
              placeholder="Repita contraseña..."
              onChange={(e) =>
                setVerificaContraseña({
                  ...contraseña,
                  contraseña: e.target.value,
                })
              }
            />
            <button onClick={() => actualizarPerfil(contraseña)}>
              Actualizar contraseña
            </button>
          </div>
        </>
      )}
    </div>
  );
}
