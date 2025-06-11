import React, { useEffect, useState } from "react";

import SearchForm from "./SearchForm";
import ArchivoList from "./ArchivoList";
import Categorias from "./Categorias";
import Usuario from "./Usuario";
import Permiso from "./Permiso";
import Perfil from "./Perfil";
import "../assets/Dashboard.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "./../components/axiosConfig";
import MediaOverlay from "./MediaOverlay";

export default function Dashboard() {
  const { dato } = useParams();
  const navigate = useNavigate(); // Usamos el hook useNavigate para redirigir al usuario
  const [opcion, setOpcion] = useState("mis-datos");
  const [archivos, setArchivos] = useState([]);
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

  const abrirMedia = (url) => {
    setMediaUrl(url);
  };

  const cerrarMedia = () => {
    setMediaUrl(null);
  };

  useEffect(() => {
    // Obtener información de usuario
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

    if (dato) setOpcion(dato);

    obtenerPermisos();
    obtenerCategorias();
    listarPerfil();
    listarPerfilPersonal();
    listarPerfilCompartido();
  }, [navigate]);

  const actualizar = async () => {
    try {
      setFiltros([]);
      obtenerCategorias();
      listarPerfil();
    } catch (error) {
      console.log(error);
    }
  };

  const obtenerPermisos = async () => {
    try {
      const response = await axios.get("/api/permisos/usuario");
      setPermisos(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const actualizarCompartir = async (user, userEmail, file, permiso) => {
    try {
      if (user[0].email === userEmail) {
        await axios.put(
          `/api/usuarios/archivo/${user[0].id}/${file}/${permiso.nombre}`
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const listarPerfil = async () => {
    try {
      const response = await axios.get("/api/files/todo");
      setArchivos(response.data); // Actualizar el estado con las categorías

      setArchivosFiltrados(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const listarPerfilPersonal = async () => {
    try {
      const response = await axios.get("/api/files/perfil");
      setArchivos(response.data); // Actualizar el estado con las categorías

      setArchivosFiltradosPersonal(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const listarPerfilCompartido = async () => {
    try {
      const response = await axios.get("/api/files/perfil-compartido");
      setArchivos(response.data); // Actualizar el estado con las categorías

      setArchivosFiltradosCompartido(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const obtenerCategorias = async () => {
    try {
      const res = await axios.get("/api/categorias/conCantidad");
      setCategorias(res.data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const handleBuscarPersonal = async (filtro) => {
    const tieneFiltros =
      (filtro.name && filtro.name.trim() !== "") ||
      (filtro.user && filtro.user.trim() !== "") ||
      (filtro.tipo && filtro.tipo.trim() !== "") ||
      (filtro.fecha_inicio && filtro.fecha_inicio.trim() !== "") ||
      (filtro.fecha_fin && filtro.fecha_fin.trim() !== "") ||
      (filtro.categorias && filtro.categorias.length > 0);

    if (!tieneFiltros) {
      // No hay filtros, hacés algo: mostrar mensaje o no hacer petición
      listarPerfilPersonal();
      return; // Salir sin hacer la petición
    }

    try {
      const res = await axios.post("/api/files/filtrado/personal", filtro);
      console.log("archivo personales", res.data);
      setArchivosFiltradosPersonal(res.data);
    } catch (err) {
      console.error("Error en la búsqueda:", err);
    }
  };

  const handleBuscar = async (filtro) => {
    const tieneFiltros =
      (filtro.name && filtro.name.trim() !== "") ||
      (filtro.user && filtro.user.trim() !== "") ||
      (filtro.tipo && filtro.tipo.trim() !== "") ||
      (filtro.fecha_inicio && filtro.fecha_inicio.trim() !== "") ||
      (filtro.fecha_fin && filtro.fecha_fin.trim() !== "") ||
      (filtro.categorias && filtro.categorias.length > 0);

    if (!tieneFiltros) {
      // No hay filtros, hacés algo: mostrar mensaje o no hacer petición
      listarPerfil();
      return; // Salir sin hacer la petición
    }

    try {
      const res = await axios.post("/api/files/filtrado/todo", filtro);

      setArchivosFiltrados(res.data);
    } catch (err) {
      console.error("Error en la búsqueda:", err);
    }
  };

  const handleBuscarCompartido = async (filtro) => {
    const tieneFiltros =
      (filtro.name && filtro.name.trim() !== "") ||
      (filtro.user && filtro.user.trim() !== "") ||
      (filtro.tipo && filtro.tipo.trim() !== "") ||
      (filtro.fecha_inicio && filtro.fecha_inicio.trim() !== "") ||
      (filtro.fecha_fin && filtro.fecha_fin.trim() !== "") ||
      (filtro.categorias && filtro.categorias.length > 0);

    if (!tieneFiltros) {
      // No hay filtros, hacés algo: mostrar mensaje o no hacer petición
      listarPerfilCompartido();
      return; // Salir sin hacer la petición
    }

    try {
      const res = await axios.post("/api/files/filtrado/compartido", filtro);
      console.log("archivo compartido", res.data);
      setArchivosFiltradosCompartido(res.data);
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
          {opcion === "mis-datos" && <Perfil />}
          {opcion === "archivos-personal" && (
            <>
              <SearchForm
                categorias={categorias}
                filtros={filtros}
                setFiltros={setFiltros}
                handleBuscar={handleBuscarPersonal}
              />
              <ArchivoList
                archivos={archivosFiltradosPersonal}
                setArchivos={setArchivosFiltradosPersonal}
                abrirMedia={abrirMedia}
                categorias={categorias}
                permisos={permisos}
                proposito="propios"
                compartir={actualizarCompartir}
              />
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
              <ArchivoList
                archivos={archivosFiltrados}
                setArchivos={setArchivosFiltrados}
                abrirMedia={abrirMedia}
                categorias={categorias}
                permisos={permisos}
                proposito="todos"
                compartir={actualizarCompartir}
              />
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
              <ArchivoList
                archivos={archivosFiltradosCompartido}
                setArchivos={setArchivosFiltradosCompartido}
                abrirMedia={abrirMedia}
                categorias={categorias}
                permisos={permisos}
                proposito="compartidos"
                compartir={actualizarCompartir}
              />
            </>
          )}

          {opcion === "categorias" && permisos.vercategoria === true && (
            <Categorias categorias1={categorias} />
          )}
          {opcion === "usuarios" && permisos.verusuario === true && (
            <Usuario usuario={usuario.id} />
          )}
          {opcion === "permisos" && permisos.verpermiso === true && <Permiso />}
        </main>
      </div>
      {/* Mostrar overlay si hay URL */}
      {mediaUrl && <MediaOverlay url={mediaUrl} onClose={cerrarMedia} />}
    </div>
  );
}
