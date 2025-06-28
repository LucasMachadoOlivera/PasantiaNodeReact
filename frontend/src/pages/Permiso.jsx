import React, { useState, useEffect } from "react";
import "../assets/Permiso.css";
import axios from "./../components/axiosConfig";

export default function Permiso({ permisopropio, setMessage, setTypeMessage }) {
  const [campos, setCampos] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [nombre, setNombre] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    listarPermisos();
  }, []);

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
      setMessage("Permiso actualizado");
      setTypeMessage("exito");
      listarPermisos();
    } catch (error) {
      setMessage("Error al actualizar permiso");
      setTypeMessage("error");
      console.error(error);
    }
  };

  const eliminarPermiso = async (id) => {
    try {
      if (editandoId === null) {
        const confirmar = window.confirm(
          `¿Estás seguro de que quieres eliminar el permiso "${id.nombre}"?`
        );
        if (!confirmar) {
          // Usuario canceló, salgo de la función
          return;
        }

        await axios.delete(`/api/permisos/${id.id}`);
        setMessage("Permiso eliminado.");
        setTypeMessage("exito");
        listarPermisos();
      } else if (editandoId === id.id) {
        setEditandoId(null);
        listarPermisos();
      } else {
        setMessage("Dejar de editar para eliminar");
        setTypeMessage("error");
      }
    } catch (error) {
      setMessage("Error al eliminar permiso");
      setTypeMessage("error");
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
      setEditandoId(null);
      actualizarPermiso(id);
    } else {
      setEditandoId(id);
    }
  };

  const nuevoPermiso = async (dato) => {
    try {
      await axios.post("/api/permisos/", dato);
      setNombre({ nombre: "" });
      setMessage("Permiso eliminado.");
      setTypeMessage("exito");
      listarPermisos();
    } catch (error) {
      setMessage("Error al eliminar permiso");
      setTypeMessage("error");
      console.error(error);
    }
  };

  return (
    <>
      <div className="permiso-container">
        {permisopropio?.verpermiso === true && (
          <div className="permiso-listado">
            <h2>Agregar Permiso</h2>

            <input
              type="text"
              value={nombre.nombre}
              placeholder="Ingrese nombre para permiso"
              onChange={(e) => setNombre({ ...nombre, nombre: e.target.value })}
            />

            <button onClick={() => nuevoPermiso(nombre)}>Agregar</button>
            <br />
            <br />
            <h3>Permisos</h3>
            <br />
            {permisopropio?.elpermiso === true && (
              <p>
                Eliminar: Los usuarios pertenecientes al permiso borrado se les
                pondran el permiso Default.
              </p>
            )}
            <div className="tabla-scroll">
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
                            <button onClick={() => eliminarPermiso(permiso)}>
                              {editandoId === permiso.id
                                ? "Cancelar"
                                : "Eliminar"}
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
                        const color = valor ? "#c8f7c5" : "#f8d7da";
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
            </div>

            <br />
            <div>
              <p>
                En la pestaña <b>Perfil</b>, en la sección de permisos (a la
                izquierda), estos son afectados por:
              </p>
              <br />
              <p>
                <b>Vercategoria</b> permite ver el listado de categorías. <br />
                <b>Agcategoria</b> permite agregar categorías. <br />
                Para usar <b>Edcategoria</b> y <b>Elcategoria</b> es necesario
                tener <b>Vercategoria</b>. <br />
                <b>Edcategoria</b> permite intercambiar una categoría usada en
                los archivos por otra categoría diferente. <br />
                <b>Elcategoria</b> permite quitar las categorías a borrar.
              </p>
              <br />
              <p>
                <b>Verarchivo</b> permite ver el listado completo de todos los
                archivos. <br />
                Para usar <b>Edarchivo</b> y <b>Elarchivo</b> es necesario tener{" "}
                <b>Verarchivo</b>. <br />
                <b>Edarchivo</b> permite editar los archivos almacenados. <br />
                <b>Elarchivo</b> permite quitar los archivos a borrar.
              </p>
              <br />
              <p>
                <b>Verusuario</b> permite ver el listado completo de los
                usuarios. <br />
                <b>Agusuario</b> permite agregar usuarios. <br />
                Para usar <b>Edusuario</b> y <b>Elusuario</b> es necesario tener{" "}
                <b>Verusuario</b>. <br />
                <b>Edusuario</b> permite editar el usuario seleccionado. <br />
                <b>Elusuario</b> permite quitar el usuario seleccionado.
              </p>
              <br />
              <p>
                <b>Verpermiso</b> permite ver la tabla con todos los permisos
                para los usuarios. <br />
                <b>Agpermiso</b> permite agregar nuevos permisos. <br />
                Para usar <b>Edpermiso</b> y <b>Elpermiso</b> es necesario tener{" "}
                <b>Verpermiso</b>. <br />
                <b>Edpermiso</b> permite editar el permiso seleccionado. <br />
                <b>Elpermiso</b> permite quitar el permiso seleccionado.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
