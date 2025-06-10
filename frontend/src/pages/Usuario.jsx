import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "./../components/axiosConfig";
import "../assets/Usuario.css";
// Datos simulados

export default function Usuario(usuario) {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", rol: "" });
  const [registros, setRegistros] = useState([]);
  const [permisos, setPermisos] = useState([]);

  const [abierto, setAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);

  const navigate = useNavigate();
  // Cargar imágenes desde el servidor
  useEffect(() => {
    listaUsuarios();
    //setUsuarios(listaCategory.data);
    obtenerPermisos();
  }, [navigate]);

  const obtenerPermisos = async () => {
    try {
      const response = await axios.get("/api/permisos/usuario");
      setPermisos(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const formatearFecha = (fecha) => {
    const opciones = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      // hour: "2-digit",
      // minute: "2-digit",
      // second: "2-digit",
      hour12: false,
    };

    return new Date(fecha)
      .toLocaleDateString("es-ES", opciones)
      .replace(",", "");
  };

  const listaUsuarios = async () => {
    try {
      const response = await axios.get("/api/usuarios");

      setUsuarios(response.data); // Actualizar el estado con las categorías
    } catch (error) {
      console.log(error);
    }
  };

  const rol = [
    { id: "1", nombre: "Admin" },
    { id: "2", nombre: "Default" },
    { id: "3", nombre: "Categoria" },
    { id: "5", nombre: "User" },
  ];

  const listarRegistros = async (id) => {
    try {
      const response = await axios.get(`/api/registros/registros/${id}`);

      setRegistros(response.data); // Actualizar el estado con las categorías
    } catch (error) {
      console.log(error);
    }
  };

  const handleSeleccionar = (usuario) => {
    listarRegistros;

    setUsuarioSeleccionado(usuario);
    setModoEdicion(false);
    const valor = rol.find((ro) => ro.id == usuario.Permiso.id);
    seleccionar(valor);
    setFormData({
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.Permiso.id,
    });
    listarRegistros(usuario.id);
  };

  const handleEliminar = async () => {
    if (!usuarioSeleccionado) return;
    await axios.delete(`/api/usuarios/${usuarioSeleccionado.id}`);
    setUsuarios(usuarios.filter((u) => u.id !== usuarioSeleccionado.id));
    setUsuarioSeleccionado(null);
    setModoEdicion(false);
  };

  const handleEditar = () => {
    setModoEdicion(true);
  };

  const handleGuardar = async () => {
    await axios.put(`/api/usuarios/${usuarioSeleccionado.id}`, formData);
    listaUsuarios();
    setRegistros([]);
    setFormData({ nombre: "", rol: "" });
    setUsuarioSeleccionado(null);
    setModoEdicion(false);
  };

  const handleCancelar = () => {
    setModoEdicion(false);

    setFormData({
      nombre: usuarioSeleccionado.nombre,
      rol: usuarioSeleccionado.permiso_id,
    });
  };

  const handleResetearPassword = async () => {
    if (usuarioSeleccionado) {
      await axios.post(`/api/registros/`, usuarioSeleccionado);
      alert(
        `Se ha enviado un enlace para resetear la contraseña a: ${usuarioSeleccionado.email}`
      );
      // Aquí podrías implementar lógica real con backend o un modal
    }
  };

  const seleccionar = (opcion) => {
    setFormData({ ...formData, rol: opcion.id });
    setSeleccionado(opcion);
    setAbierto(false);
  };

  return (
    <>
      <div className="contenedor">
        {/* IZQUIERDA: info usuario + categorías */}
        <div className="columna-izquierda">
          <div className="usuario-info">
            <h2>Información del Usuario</h2>
            {usuarioSeleccionado ? (
              modoEdicion ? (
                <>
                  <label>Nombre:</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                  />

                  <label>Rol:</label>
                  <div
                    className="dropdown-wrapper"
                    tabIndex={0}
                    onBlur={() => setTimeout(() => setAbierto(false), 150)}
                  >
                    <div
                      className="dropdown-display"
                      onClick={() => setAbierto(!abierto)}
                    >
                      {seleccionado ? seleccionado.nombre : "Seleccionar..."}
                    </div>

                    {abierto && (
                      <ul className="dropdown-list">
                        {rol.map((op) => (
                          <li
                            key={op.id}
                            className="dropdown-item"
                            onMouseDown={() => seleccionar(op)}
                          >
                            {op.nombre}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Hidden input para enviar valor si es parte de un form */}
                    <input
                      type="hidden"
                      name="categoria"
                      value={seleccionado?.id || ""}
                    />
                  </div>

                  <div className="usuario-actions">
                    <button onClick={handleGuardar}>Guardar</button>
                    <button onClick={handleCancelar}>Cancelar</button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    <strong>Nombre:</strong> {usuarioSeleccionado.nombre}
                  </p>
                  <p>
                    <strong>Email:</strong> {usuarioSeleccionado.email}
                  </p>
                  <p>
                    <strong>Rol:</strong> {usuarioSeleccionado.Permiso.nombre}
                  </p>
                  <p>
                    <strong>Estado:</strong> Activo
                  </p>
                  <div className="usuario-actions">
                    {permisos?.edusuario === true && (
                      <button onClick={handleEditar}>Editar</button>
                    )}
                    {permisos?.elusuario === true && (
                      <>
                        {usuarioSeleccionado.id === usuario.usuario ? (
                          <button disabled>Eliminar</button>
                        ) : (
                          <button onClick={handleEliminar}>Eliminar</button>
                        )}
                      </>
                    )}
                    {permisos?.edusuario === true && (
                      <button onClick={handleResetearPassword}>
                        Resetear contraseña
                      </button>
                    )}
                  </div>
                </>
              )
            ) : (
              <p>Selecciona un usuario de la lista.</p>
            )}
          </div>
          {permisos?.verlogs === true && (
            <div className="categorias">
              <h3>Registros</h3>
              <br />
              {registros.length === 0 ? (
                <p className="no-registros">No hay registro de acciones.</p>
              ) : (
                <table className="tabla-categorias">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Nombre</th>
                    </tr>
                  </thead>

                  <tbody>
                    {registros.map((cat) => (
                      <tr key={cat.id}>
                        <td>{formatearFecha(cat.createdAt)}</td>
                        <td>{cat.accion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* DERECHA: lista de usuarios */}
        {permisos?.verusuario === true && (
          <div className="columna-derecha">
            <h3>Lista de Usuarios</h3>
            <br />
            {usuarios.map((u) => (
              <div key={u.id} className="usuario-item">
                <strong>{u.nombre}</strong>
                <br />
                <span>{u.email}</span>
                <br />
                <button onClick={() => handleSeleccionar(u)}>
                  Seleccionar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
