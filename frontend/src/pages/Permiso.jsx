import React, { useState, useEffect } from "react";
import "../assets/Categorias.css";
import axios from "./../components/axiosConfig";

export default function Categorias() {
  const [campos, setCampos] = useState([]);
  const [permisopropio, setPermisopropio] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [nombre, setNombre] = useState([]);
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
      console.error(error);
    }
  };

  const listarPermisos = async () => {
    try {
      const response = await axios.get("/api/permisos/");
      setPermisos(response.data);
      setCampos(Object.keys(response.data[0]).slice(2, 18));
    } catch (error) {
      console.error(error);
    }
  };
  const actualizarPermiso = async (id) => {
    try {
      const resultado = permisos.find((permiso) => permiso.id === id);

      await axios.post("/api/permisos/update", resultado);

      listarPermisos();
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarPermiso = async (id) => {
    try {
      await axios.delete(`/api/permisos/${id}`);

      listarPermisos();
    } catch (error) {
      console.error(error);
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

  const nuevoPermiso = async (dato) => {
    await axios.post("/api/permisos/", dato);
    setNombre({ nombre: "" });
  };

  return (
    <>
      <div className="categorias-container">
        {permisopropio?.verpermiso === true && (
          <div className="listado">
            <div>
              <h2>Agregar Permiso</h2>
              <form>
                <input
                  type="text"
                  value={nombre.nombre}
                  onChange={(e) =>
                    setNombre({ ...nombre, nombre: e.target.value })
                  }
                />
                <button onClick={() => nuevoPermiso(nombre)}>Agregar</button>
              </form>
            </div>
            <br />
            <h3>Permisos</h3>
            <br />
            {permisopropio?.elpermiso === true && (
              <p>
                Eliminar: ELIMINA TAMBIEN LOS USUARIOS CON EL PERMISO Y LOS
                ARCHIVOS SUBIDOS POR EL USUARIO
              </p>
            )}
            <table border="1" cellPadding="5">
              <thead>
                <tr>
                  <th></th>
                  {permisos.map((permiso, index) =>
                    index < 1 ? (
                      <th key={"btns-" + permiso.id}></th>
                    ) : (
                      <th key={"btns-" + permiso.id}>
                        {permisopropio?.edpermiso === true && (
                          <button onClick={() => toggleEdicion(permiso.id)}>
                            {editandoId === permiso.id ? "Guardar" : "Editar"}
                          </button>
                        )}
                        <br />
                        {permisopropio?.elpermiso === true && index > 1 && (
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
                          {typeof valor === "boolean" && indexPermiso > 0 ? (
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
            <br />
            <div>
              <p>
                En la pestaña Perfil , en la sección de permisos, a la
                izquierda, son afectados por:
              </p>
              <br />
              <p>
                Vercategoria, Agcategoria, Edcategoria, Elcategoria: Para que
                aparezca la sección de permisos se necesita al menos
                Vercategoria, y al tenerla, si se tiene Agcategoria se pueden
                agregar categorías; con Edcategoría se pueden intercambiar las
                categorías y Elcategoria para eliminar las categorías.
              </p>
              <br />
              <p>
                Verarchivo, Edarchivo, Elarchivo: Para que aparezca la sección
                de permisos se necesita al menos Verarchivo para ver todos los
                archivos en el sistema, y al tenerlo, si se tiene Edarchivo se
                pueden editar todos los archivos, y Elarchivo para poder
                eliminar todos los archivos.
              </p>
              <br />
              <p>
                Verusuario, Agusuario, Edusuario, Elusuario: Para que aparezca
                la sección de permisos se necesita al menos Verusuario para ver
                todos los usuarios, y al tenerlo, si se tiene Agusuario se
                pueden agregar usuarios, con Edusuario se pueden editar todos
                los usuarios y Elusuario para poder eliminar cualquier usuario.
              </p>
              <br />
              <p>Registrar: para poder generar un nuevo usuario.</p>
              <br />
              <p>
                Resusuario: para poder resetear la contraseña de cualquier
                usuario.
              </p>
              <br />
              <p>
                Verpermiso, Agpermiso, Edpermiso: Verpermiso para poder
                visualizar la tabla de arriba, y al ya tenerlo, si se tiene
                Agpermiso para agregar nuevos permisos, Edpermiso para editar
                permisos.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
