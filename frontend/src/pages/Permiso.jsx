import React, { useState, useEffect } from "react";
import "../assets/Categorias.css";
import axios from "./../components/axiosConfig";

export default function Categorias() {
  const [campos, setCampos] = useState([]);
  const [permisopropio, setPermisopropio] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    // Obtener información de usuario
    listarPermisos();
    obtenerPermisos();
  }, []);

  const obtenerPermisos = async () => {
    try {
      const response = await axios.get("/api/permisos/usuario");
      setPermisopropio(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const listarPermisos = async () => {
    try {
      const response = await axios.get("/api/permisos/");
      setPermisos(response.data);
      setCampos(Object.keys(response.data[0]).slice(2, 19));
    } catch (error) {
      console.log(error);
    }
  };
  const actualizarPermiso = async (id) => {
    try {
      const resultado = permisos.find((permiso) => permiso.id === id);

      await axios.post("/api/permisos/update", resultado);

      listarPermisos();
    } catch (error) {
      console.log(error);
    }
  };

  const eliminarPermiso = async (id) => {
    try {
      await axios.delete(`/api/permisos/${id}`);

      listarPermisos();
    } catch (error) {
      console.log(error);
    }
  };

  const manejarCambio = (id, campo, nuevoValor) => {
    setPermisos((prev) =>
      prev.map((permiso) =>
        permiso.id === id ? { ...permiso, [campo]: nuevoValor } : permiso
      )
    );
  };

  const toggleEdicion = (id) => {
    if (editandoId === id) {
      setEditandoId(null); // Guardar (salir de modo edición)
      actualizarPermiso(id);
    } else {
      setEditandoId(id); // Entrar en modo edición
    }
  };

  return (
    <>
      <div className="categorias-container">
        {permisopropio?.verpermiso === true && (
          <div className="listado">
            <h3>Permisos</h3>
            <br />
            <table border="1" cellPadding="5">
              <thead>
                <tr>
                  <th></th>
                  {permisos.map((permiso, index) =>
                    index < 2 ? (
                      <th key={"btns-" + permiso.id}></th>
                    ) : (
                      <th key={"btns-" + permiso.id}>
                        {permisopropio?.edpermiso === true && (
                          <button onClick={() => toggleEdicion(permiso.id)}>
                            {editandoId === permiso.id ? "Guardar" : "Editar"}
                          </button>
                        )}
                        <br />
                        {permisopropio?.elpermiso === true && (
                          <button onClick={() => eliminarPermiso(permiso.id)}>
                            Eliminar
                          </button>
                        )}
                      </th>
                    )
                  )}
                </tr>
                <tr>
                  <th>Campo</th>
                  {permisos.map((u) => (
                    <th key={u.id}>{u.nombre}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campos.map((campo) => (
                  <tr key={campo}>
                    <td>{campo.charAt(0).toUpperCase() + campo.slice(1)}</td>
                    {permisos.map((permiso, indexPermiso) => {
                      const esEditable = editandoId === permiso.id;
                      const valor = permiso[campo];
                      const color = valor ? "#c8f7c5" : "#f8d7da"; // verde o rojo claro
                      return (
                        <td
                          key={permiso.id + "-" + campo}
                          style={{ backgroundColor: color }}
                        >
                          {typeof valor === "boolean" && indexPermiso > 1 ? (
                            <input
                              type="checkbox"
                              checked={valor}
                              disabled={!esEditable}
                              onChange={(e) =>
                                manejarCambio(
                                  permiso.id,
                                  campo,
                                  e.target.checked
                                )
                              }
                            />
                          ) : (
                            <></>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
