import React, { useEffect, useState } from "react";

import SearchForm from "./../components/SearchForm";
import ArchivoList from "../components/ArchivoList";
import Categorias from "./Categorias";
import Usuario from "./Usuario";
import Permiso from "./Permiso";
import Perfil from "./Perfil";
import "../assets/Dashboard.css";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "./../components/axiosConfig";
import MediaOverlay from "../components/MediaOverlay";

export default function Dashboard() {
  const { dato } = useParams();
  const navigate = useNavigate(); // Usamos el hook useNavigate para redirigir al usuario
  const [opcion, setOpcion] = useState(dato || "mis-datos");
  const [categorias, setCategorias] = useState([]);
  const [filtros, setFiltros] = useState([]);
  const [archivosFiltrados, setArchivosFiltrados] = useState([]);
  const [archivosFiltradosPersonal, setArchivosFiltradosPersonal] = useState(
    []
  );
  const [archivosFiltradosCompartido, setArchivosFiltradosCompartido] =
    useState([]);
  const [permisos, setPermisos] = useState({
    vercategoria: "",
    agcategoria: "",
    edcategoria: "",
    elcategoria: "",
    verarchivo: "",
    agarchivo: "",
    edarchivo: "",
    elarchivo: "",
    registrar: "",
    verusuario: "",
    agusuario: "",
    edusuario: "",
    elusuario: "",
    verpermiso: "",
    edpermiso: "",
    elpermiso: "",
    verlog: "",
  });
  const [usuario, setUsuario] = useState({
    id: "",
    nombre: "",
    email: "",
    fecha: "",
  });

  // Estado para mostrar/ocultar menú lateral en móvil
  const [menuVisible, setMenuVisible] = useState(false);

  const [mediaUrl, setMediaUrl] = useState(null);

  const [anterior, setAnterior] = useState(true);
  const [siguiente, setSiguiente] = useState(true);

  const params = new URLSearchParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [cantidad] = useState(parseInt(searchParams.get("cantidad")) || 16);
  const [paginaActual, setPaginaActual] = useState(
    parseInt(searchParams.get("paginaActual")) || 1
  );

  params.append("paginaActual", paginaActual);
  params.append("cantidad", cantidad);

  const cambiarpagina = async (pagina) => {
    const tieneFiltros =
      (filtros.name && filtros.name.trim() !== "") ||
      (filtros.user && filtros.user.trim() !== "") ||
      (filtros.tipo && filtros.tipo.trim() !== "") ||
      (filtros.fecha_inicio && filtros.fecha_inicio.trim() !== "") ||
      (filtros.fecha_fin && filtros.fecha_fin.trim() !== "") ||
      (filtros.categorias && filtros.categorias.length > 0);

    params.delete("paginaActual");
    params.append("paginaActual", pagina);

    if (!tieneFiltros) {
      if (opcion == "compartidos-conmigo") {
        listarPerfilCompartido(pagina);
      } else if (opcion == "archivos-personal") {
        listarPerfilPersonal(pagina);
      } else if (opcion == "archivos") {
        listarPerfil(pagina);
      }
    } else {
      if (opcion == "compartidos-conmigo") {
        handleBuscarCompartido(filtros);
      } else if (opcion == "archivos-personal") {
        handleBuscarPersonal(filtros);
      } else if (opcion == "archivos") {
        handleBuscar(filtros);
      }
    }
  };

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

  const abrirMedia = (url) => {
    setMediaUrl(url);
  };

  const cerrarMedia = () => {
    setMediaUrl(null);
  };

  const actualizarUsuario = async () => {
    try {
      axios
        .get("/usuario")
        .then((res) => {
          setUsuario({
            id: res.data.id,
            nombre: res.data.nombre,
            email: res.data.email,
            fecha: new Date(res.data.fecha).toISOString().split("T")[0],
          });
        })
        .catch(() => {
          navigate("/login");
        });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Obtener información de usuario
    actualizarUsuario();
    obtenerPermisos();
    obtenerCategorias();
    listarPerfil(paginaActual);
    listarPerfilPersonal(paginaActual);
    listarPerfilCompartido(paginaActual);
  }, [navigate]);

  const actualizar = async () => {
    try {
      params.delete("paginaActual");
      params.append("paginaActual", 1);
      setPaginaActual(1);
      setFiltros([]);
    } catch (error) {
      console.error(error);
    }
  };

  const obtenerPermisos = async () => {
    try {
      const response = await axios.get("/api/permisos/usuario");
      setPermisos(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const actualizarCompartir = async (user, userEmail, file, permiso) => {
    try {
      if (user[0] && user[0].email === userEmail && permiso) {
        await axios.put(
          `/api/usuarios/archivo/${user[0].id}/${file}/${permiso.nombre}`
        );
        setMessage("Se compartio correctamente");
        setTypeMessage("exito");
      } else {
        throw new Error("Email o Privilegio incorrecto");
      }
    } catch (error) {
      setMessage("Invalido. Comprobar Email y Privilegio");
      setTypeMessage("error");
      console.error(error);
    }
  };

  const listarPerfil = async (pagina) => {
    try {
      if (opcion == "archivos") {
        const response = await axios.get("/api/files/todo", {
          params,
        });

        setSearchParams({ params });
        setSiguiente(true);
        setAnterior(true);
        if (response.data.count / cantidad - pagina > 0) setSiguiente(false);

        if (pagina > 1) setAnterior(false);

        setArchivosFiltrados(response.data.rows);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const listarPerfilPersonal = async (pagina) => {
    try {
      if (opcion == "archivos-personal") {
        const response = await axios.get("/api/files/perfil", {
          params,
        });
        setSearchParams({ params });
        setSiguiente(true);
        setAnterior(true);
        if (response.data.count / cantidad - pagina > 0) setSiguiente(false);

        if (pagina > 1) setAnterior(false);

        setArchivosFiltradosPersonal(response.data.rows);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const listarPerfilCompartido = async (pagina) => {
    try {
      if (opcion == "compartidos-conmigo") {
        const response = await axios.get("/api/files/perfil-compartido", {
          params,
        });
        setSearchParams({ params });
        setSiguiente(true);
        setAnterior(true);
        if (response.data.count / cantidad - pagina > 0) setSiguiente(false);

        if (pagina > 1) setAnterior(false);
        setArchivosFiltradosCompartido(response.data.rows);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const obtenerCategorias = async () => {
    try {
      if (
        opcion == "compartidos-conmigo" ||
        opcion == "archivos-personal" ||
        opcion == "archivos"
      ) {
        const res = await axios.get("/api/categorias/");
        setCategorias(res.data);
      }
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const handleBuscarPersonal = async (filtro) => {
    params.delete("name");
    params.delete("user");
    params.delete("tipo");
    params.delete("fecha_inicio");
    params.delete("fecha_fin");
    params.delete("categorias");

    if (filtro.name) params.append("name", filtro.name);
    if (filtro.user) params.append("user", filtro.user);
    if (filtro.tipo) params.append("tipo", filtro.tipo);
    if (filtro.fecha_inicio) params.append("fecha_inicio", filtro.fecha_inicio);
    if (filtro.fecha_fin) params.append("fecha_fin", filtro.fecha_fin);
    if (filtro.categorias) params.append("categorias", filtro.categorias);

    if (params.size == 2) {
      // No hay filtros
      listarPerfilPersonal(paginaActual);
      return;
    }
    try {
      setSearchParams({
        params,
      });
      const res = await axios.get("/api/files/filtrado/personal", {
        params,
      });
      setArchivosFiltradosPersonal(res.data.rows);
      setSiguiente(true);
      setAnterior(true);
      if (res.data.count / cantidad - paginaActual > 0) setSiguiente(false);

      if (paginaActual > 1) setAnterior(false);
    } catch (err) {
      console.error("Error en la búsqueda:", err);
    }
  };

  const handleBuscar = async (filtro) => {
    params.delete("name");
    params.delete("user");
    params.delete("tipo");
    params.delete("fecha_inicio");
    params.delete("fecha_fin");
    params.delete("categorias");

    if (filtro.name) params.append("name", filtro.name);
    if (filtro.user) params.append("user", filtro.user);
    if (filtro.tipo) params.append("tipo", filtro.tipo);
    if (filtro.fecha_inicio) params.append("fecha_inicio", filtro.fecha_inicio);
    if (filtro.fecha_fin) params.append("fecha_fin", filtro.fecha_fin);
    if (filtro.categorias) params.append("categorias", filtro.categorias);

    if (params.size == 2) {
      // No hay filtros
      listarPerfil(paginaActual);
      return;
    }
    try {
      setSearchParams({
        params,
      });

      const res = await axios.get("/api/files/filtrado/todo", {
        params,
      });

      setArchivosFiltrados(res.data.rows);
      setSiguiente(true);
      setAnterior(true);
      if (res.data.count / cantidad - paginaActual > 0) setSiguiente(false);

      if (paginaActual > 1) setAnterior(false);
    } catch (err) {
      console.error("Error en la búsqueda:", err);
    }
  };

  const handleBuscarCompartido = async (filtro) => {
    params.delete("name");
    params.delete("user");
    params.delete("tipo");
    params.delete("fecha_inicio");
    params.delete("fecha_fin");
    params.delete("categorias");

    if (filtro.name) params.append("name", filtro.name);
    if (filtro.user) params.append("user", filtro.user);
    if (filtro.tipo) params.append("tipo", filtro.tipo);
    if (filtro.fecha_inicio) params.append("fecha_inicio", filtro.fecha_inicio);
    if (filtro.fecha_fin) params.append("fecha_fin", filtro.fecha_fin);
    if (filtro.categorias) params.append("categorias", filtro.categorias);

    if (params.size == 2) {
      // No hay filtros
      listarPerfilCompartido(paginaActual);
      return;
    }

    try {
      setSearchParams({
        params,
      });

      const res = await axios.get("/api/files/filtrado/compartido", {
        params,
      });
      setArchivosFiltradosCompartido(res.data.rows);
      setSiguiente(true);
      setAnterior(true);
      if (res.data.count / cantidad - paginaActual > 0) setSiguiente(false);

      if (paginaActual > 1) setAnterior(false);
    } catch (err) {
      console.error("Error en la búsqueda:", err);
    }
  };

  return (
    <div className="files-container">
      <button
        className="btn-menu"
        aria-label={menuVisible ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setMenuVisible((v) => !v)}
      >
        {menuVisible ? "Cerrar" : "Menú"}
      </button>

      <div className="dashboard-container">
        <aside className={`sidebar ${menuVisible ? "visible" : ""}`}>
          <h2>Opciones</h2>
          <br />
          <nav>
            <ul>
              <li
                className={opcion === "mis-datos" ? "activo" : ""}
                onClick={() => {
                  navigate("/perfil/mis-datos");
                  setOpcion("mis-datos");
                  setMenuVisible(false);
                }}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setOpcion("mis-datos")}
              >
                Perfil
              </li>
              <li
                className={opcion === "archivos-personal" ? "activo" : ""}
                onClick={() => {
                  navigate("/perfil/archivos-personal");
                  setOpcion("archivos-personal");
                  setMenuVisible(false);
                  actualizar();
                }}
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && setOpcion("archivos-personal")
                }
              >
                Mis Archivos
              </li>
              <li
                className={opcion === "compartidos-conmigo" ? "activo" : ""}
                onClick={() => {
                  navigate("/perfil/compartidos-conmigo");
                  setOpcion("compartidos-conmigo");
                  setMenuVisible(false);
                  actualizar();
                }}
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && setOpcion("compartidos-conmigo")
                }
              >
                Compartidos
              </li>
              {(permisos.vercategoria === true ||
                permisos.verusuario === true ||
                permisos.verarchivo === true ||
                permisos.verpermiso === true) && (
                <>
                  <br />
                  <p>Permisos:</p>
                  <br />
                </>
              )}
              {permisos.verarchivo === true && (
                <li
                  className={opcion === "archivos" ? "activo" : ""}
                  onClick={() => {
                    navigate("/perfil/permiso/archivos");
                    setOpcion("archivos");
                    setMenuVisible(false);
                    actualizar();
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setOpcion("archivos")}
                >
                  Archivos
                </li>
              )}
              {permisos.vercategoria === true && (
                <li
                  className={opcion === "categorias" ? "activo" : ""}
                  onClick={() => {
                    navigate("/perfil/permiso/categorias");
                    setOpcion("categorias");
                    setMenuVisible(false);
                  }}
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setOpcion("categorias")
                  }
                >
                  Categorías
                </li>
              )}
              {permisos.verusuario === true && (
                <li
                  className={opcion === "usuarios" ? "activo" : ""}
                  onClick={() => {
                    navigate("/perfil/permiso/usuarios");
                    setOpcion("usuarios");
                    setMenuVisible(false);
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setOpcion("usuarios")}
                >
                  Usuarios
                </li>
              )}
              {permisos.verpermiso === true && (
                <li
                  className={opcion === "permisos" ? "activo" : ""}
                  onClick={() => {
                    navigate("/perfil/permiso/permisos");
                    setOpcion("permisos");
                    setMenuVisible(false);
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setOpcion("permisos")}
                >
                  Permisos
                </li>
              )}
            </ul>
          </nav>
        </aside>

        <main className="main-content">
          {opcion === "mis-datos" && (
            <Perfil
              actualizarUsuario={actualizarUsuario}
              usuario={usuario}
              setMessage={setMessage}
              setTypeMessage={setTypeMessage}
            />
          )}
          {opcion === "archivos-personal" && (
            <>
              <SearchForm
                categorias={categorias}
                filtros={filtros}
                setFiltros={setFiltros}
                handleBuscar={handleBuscarPersonal}
              />
              {archivosFiltradosPersonal?.length > 0 ? (
                <>
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
                  <ArchivoList
                    archivos={archivosFiltradosPersonal}
                    setArchivos={setArchivosFiltradosPersonal}
                    abrirMedia={abrirMedia}
                    categorias={categorias}
                    permisos={permisos}
                    proposito="propios"
                    compartir={actualizarCompartir}
                    usuarioDato={usuario}
                    setMessage={setMessage}
                    setTypeMessage={setTypeMessage}
                  />
                  <br />
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
                </>
              ) : (
                <div className="div-centrada">
                  <p>No se encuentran archivos para visualizar</p>
                </div>
              )}
            </>
          )}

          {opcion === "archivos" && permisos.verarchivo === true && (
            <>
              <SearchForm
                categorias={categorias}
                filtros={filtros}
                setFiltros={setFiltros}
                handleBuscar={handleBuscar}
              />
              {archivosFiltrados?.length > 0 ? (
                <>
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
                  <ArchivoList
                    archivos={archivosFiltrados}
                    setArchivos={setArchivosFiltrados}
                    abrirMedia={abrirMedia}
                    categorias={categorias}
                    permisos={permisos}
                    proposito="todos"
                    compartir={actualizarCompartir}
                    usuarioDato={usuario}
                    setMessage={setMessage}
                    setTypeMessage={setTypeMessage}
                  />
                  <br />
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
                </>
              ) : (
                <div className="div-centrada">
                  <p>No se encuentran archivos para visualizar</p>
                </div>
              )}
            </>
          )}

          {opcion === "compartidos-conmigo" && (
            <>
              <SearchForm
                categorias={categorias}
                filtros={filtros}
                setFiltros={setFiltros}
                handleBuscar={handleBuscarCompartido}
              />
              {archivosFiltradosCompartido?.length > 0 ? (
                <>
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
                  <ArchivoList
                    archivos={archivosFiltradosCompartido}
                    setArchivos={setArchivosFiltradosCompartido}
                    abrirMedia={abrirMedia}
                    categorias={categorias}
                    permisos={permisos}
                    proposito="compartidos"
                    compartir={actualizarCompartir}
                    usuarioDato={usuario}
                    setMessage={setMessage}
                    setTypeMessage={setTypeMessage}
                  />
                  <br />
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
                </>
              ) : (
                <div className="div-centrada">
                  <p>No se encuentran archivos para visualizar</p>
                </div>
              )}
            </>
          )}

          {opcion === "categorias" && permisos.vercategoria === true && (
            <Categorias
              permisos={permisos}
              setMessage={setMessage}
              setTypeMessage={setTypeMessage}
            />
          )}
          {opcion === "usuarios" && permisos.verusuario === true && (
            <Usuario
              permisos={permisos}
              usuario={usuario.id}
              setMessage={setMessage}
              setTypeMessage={setTypeMessage}
            />
          )}
          {opcion === "permisos" && permisos.verpermiso === true && (
            <Permiso
              permisopropio={permisos}
              setMessage={setMessage}
              setTypeMessage={setTypeMessage}
            />
          )}
        </main>
      </div>
      {/* Mostrar overlay si hay URL */}
      {mediaUrl && <MediaOverlay url={mediaUrl} onClose={cerrarMedia} />}
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
}
