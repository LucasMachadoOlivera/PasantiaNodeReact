import React, { useState, useEffect } from "react";
import axios from "../components/axiosConfig";
import { useNavigate, useSearchParams } from "react-router-dom";
import List from "./List";
import SearchForm from "../components/SearchForm";
import MediaOverlay from "../components/MediaOverlay";
import "../assets/Files.css";

function ListaFiles() {
  const params = new URLSearchParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mediaUrl, setMediaUrl] = useState(null);
  const [files, setFiles] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtros, setFiltros] = useState({
    tipo: "",
    name: "",
    user: "",
    categorias: [],
    fecha_inicio: "",
    fecha_fin: "",
  });

  const [anterior, setAnterior] = useState(true);
  const [siguiente, setSiguiente] = useState(true);

  const [cantidad] = useState(parseInt(searchParams.get("cantidad")) || 16);
  const [paginaActual, setPaginaActual] = useState(
    parseInt(searchParams.get("paginaActual")) || 1
  );

  params.append("paginaActual", paginaActual);
  params.append("cantidad", cantidad);

  const abrirMedia = (url) => {
    setMediaUrl(url);
  };

  const cerrarMedia = () => {
    setMediaUrl(null);
  };

  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/usuario").catch(() => {
      navigate("/login");
    });
    listarFiles(paginaActual);
    obtenerCategorias();
  }, [navigate]);

  const listarFiles = async (pagina) => {
    try {
      const res = await axios.get("/api/files/general", {
        params,
      });
      setSearchParams({ params });
      setSiguiente(true);
      setAnterior(true);
      if (res.data.count / cantidad - pagina > 0) setSiguiente(false);

      if (pagina > 1) setAnterior(false);

      setFiles(res.data.rows);
    } catch (err) {
      console.error("Error al cargar files:", err);
    }
  };

  const obtenerCategorias = async () => {
    try {
      const res = await axios.get("/api/categorias");
      setCategorias(res.data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };
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
      listarFiles(pagina);
    } else {
      handleBuscar(filtros);
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
      listarFiles(paginaActual);
      return;
    }
    try {
      setSearchParams({
        params,
      });
      const res = await axios.get("/api/files/filtrado/general", {
        params,
      });
      setFiles(res.data.rows);
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
      <SearchForm
        categorias={categorias}
        filtros={filtros}
        setFiltros={setFiltros}
        handleBuscar={handleBuscar}
      />
      {files?.length > 0 ? (
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
          <List data={files} abrirMedia={abrirMedia} />
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
      {/* Mostrar miniatura agrandada */}
      {mediaUrl && <MediaOverlay url={mediaUrl} onClose={cerrarMedia} />}
    </div>
  );
}

export default ListaFiles;
