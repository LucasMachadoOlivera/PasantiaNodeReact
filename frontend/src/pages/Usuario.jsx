import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import axios from "./../components/axiosConfig";
import "../assets/Usuario.css";

export default function Usuario({
  permisos,
  usuario,
  setMessage,
  setTypeMessage,
}) {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", rol: "" });
  const [registros, setRegistros] = useState([]);

  const [rol, setRol] = useState([]);
  const [registrar, setRegistrar] = useState("");

  const [abierto, setAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);

  const [anterior, setAnterior] = useState(true);
  const [siguiente, setSiguiente] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const [cantidad] = useState(parseInt(searchParams.get("cantidad")) || 6);
  const [paginaActual, setPaginaActual] = useState(
    parseInt(searchParams.get("paginaActual")) || 1
  );

  const params = new URLSearchParams();
  params.append("paginaActual", paginaActual);
  params.append("cantidad", cantidad);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    listaUsuarios(paginaActual);
    listarRoles();
  }, [navigate]);

  const formatearFecha = (fecha) => {
    const opciones = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour12: false,
    };

    return new Date(fecha)
      .toLocaleDateString("es-ES", opciones)
      .replace(",", "");
  };

  const listaUsuarios = async (pagina) => {
    try {
      const response = await axios.get("/api/usuarios", {
        params,
      });
      if (location.pathname !== "/perfil/permiso/usuarios") {
        navigate({
          pathname: "/perfil/permiso/usuarios",
          search: `?params=${params}`,
        });
      } else {
        setSearchParams({ params });
      }
      setSiguiente(true);
      setAnterior(true);
      if (response.data.count / cantidad - pagina > 0) setSiguiente(false);

      if (pagina > 1) setAnterior(false);

      setUsuarios(response.data.rows);
    } catch (error) {
      console.error(error);
    }
  };

  const listarRoles = async () => {
    try {
      const response = await axios.get(`/api/permisos/`);
      setRol(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const listarRegistros = async (id) => {
    try {
      const response = await axios.get(`/api/registros/registros/${id}`);
      setRegistros(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSeleccionar = (usuario) => {
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
    try {
      const confirmar = window.confirm(
        `¿Estás seguro de que quieres eliminar el usuario "${usuarioSeleccionado.nombre}"?`
      );
      if (!confirmar) {
        // Usuario canceló, salgo de la función
        return;
      }

      await axios.delete(`/api/usuarios/${usuarioSeleccionado.id}`);
      setMessage("Usuario eliminado");
      setTypeMessage("exito");
    } catch (err) {
      setMessage("Error: " + err);
      setTypeMessage("error");
    }

    setUsuarios(usuarios.filter((u) => u.id !== usuarioSeleccionado.id));
    setUsuarioSeleccionado(null);
    setModoEdicion(false);
  };

  const handleEditar = () => {
    setModoEdicion(true);
  };

  const handleGuardar = async () => {
    try {
      await axios.put(`/api/usuarios/${usuarioSeleccionado.id}`, formData);

      setMessage("Usuario actualizado");
      setTypeMessage("exito");
    } catch (err) {
      setMessage("Error: " + err);
      setTypeMessage("error");
    }

    listaUsuarios(paginaActual);
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
      try {
        const confirmar = window.confirm(
          `¿Estás seguro de que quieres resetear la contraseña al usuario "${usuarioSeleccionado.nombre}"?`
        );
        if (!confirmar) {
          // Usuario canceló, salgo de la función
          return;
        }
        setMessage("Cambiando contraseña...");
        setTypeMessage("exito");
        await axios.post(`/api/email/update`, usuarioSeleccionado);
        setMessage("Contraseña reseteada, email enviado");
        setTypeMessage("exito");
      } catch (err) {
        setMessage("Error: " + err);
        setTypeMessage("error");
      }
    }
  };

  const seleccionar = (opcion) => {
    setFormData({ ...formData, rol: opcion.id });
    setSeleccionado(opcion);
    setAbierto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage("Registrando usuario...");
      setTypeMessage("exito");
      await axios.post("/api/email/", { email: registrar });
      setMessage("Usuario agregado");
      setTypeMessage("exito");
      listaUsuarios(paginaActual);
    } catch (error) {
      console.error("Error al agregar usuario:", error);
      setMessage("Error: " + error);
      setTypeMessage("error");
    }
    setRegistrar("");
  };

  const cambiarpagina = async (pagina) => {
    params.delete("paginaActual");
    params.append("paginaActual", pagina);

    listaUsuarios(pagina);
  };

  return (
    <>
      <div className="contenedor">
        {/* IZQUIERDA: info usuario + categorías */}
        <div className="columna-izquierda">
          {permisos?.agusuario === true && (
            <div className="usuario-register">
              <h2>Nuevo usuario</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  value={registrar}
                  placeholder="Ingrese email del usuario"
                  onChange={(e) => setRegistrar(e.target.value)}
                />
                <button type="submit">Registar Usuario</button>
              </form>
            </div>
          )}
          <br />
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

                  <div className="usuario-actions">
                    {permisos?.edusuario === true && (
                      <button onClick={handleEditar}>Editar</button>
                    )}
                    {permisos?.elusuario === true && (
                      <>
                        {usuarioSeleccionado.id === usuario.usuario ? (
                          <button disabled>Eliminar</button>
                        ) : (
                          <button onClick={() => handleEliminar()}>
                            Eliminar
                          </button>
                        )}
                      </>
                    )}
                    {permisos?.edusuario === true && (
                      <button onClick={() => handleResetearPassword()}>
                        Resetear contraseña
                      </button>
                    )}
                  </div>
                  {permisos?.elusuario === true && (
                    <p>
                      Eliminar: TAMBIEN ELIMINA LOS ARCHIVOS SUBIDOS POR EL
                      USUARIO
                    </p>
                  )}
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
            {!(siguiente && anterior) && (
              <div className="div-paginar">
                <button
                  onClick={() => {
                    cambiarpagina(paginaActual - 1);
                    setPaginaActual(paginaActual - 1);
                  }}
                  disabled={anterior}
                >
                  Anterior
                </button>
                <p>{paginaActual}</p>
                <button
                  onClick={() => {
                    cambiarpagina(paginaActual + 1);
                    setPaginaActual(paginaActual + 1);
                  }}
                  disabled={siguiente}
                >
                  Siguiente
                </button>
              </div>
            )}
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
