import React, { useState, useEffect } from "react";
import axios from "../components/axiosConfig";
import { useNavigate } from "react-router-dom";
import List from "./List";
import SearchForm from "./SearchForm";
import MediaOverlay from "./MediaOverlay";
import "../assets/Files.css";

function ListaFiles() {
  const [files, setFiles] = useState([]);

  const [filtros, setFiltros] = useState({
    tipo: "",
    name: "",
    user: "",
    categorias: [],
    fecha_inicio: "",
    fecha_fin: "",
  });
  const [categorias, setCategorias] = useState([]);

  const [mediaUrl, setMediaUrl] = useState(null);

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

    listarFiles();
    obtenerCategorias();
  }, [navigate]);

  const listarFiles = async () => {
    try {
      const res = await axios.get("/api/files/general");
      setFiles(res.data);
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
      listarFiles();
      return; // Salir sin hacer la petición
    }

    try {
      const res = await axios.post("/api/files/filtrado/general", filtro);

      setFiles(res.data);
    } catch (err) {
      console.error("Error en la búsqueda:", err);
    }
  };

  // Función para eliminar una categoría

  // Verifica autenticación y lista usuarios
  useEffect(() => {
    axios.get("/usuario").catch(() => {
      navigate("/login");
    });
    listarCategorias();
  }, [navigate]);

  const listarCategorias = async () => {
    try {
      const response = await axios.get("/api/categorias");

      setCategorias(response.data); // Actualizar el estado con las categorías
    } catch (error) {
      console.error(error);
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
      <List data={files} abrirMedia={abrirMedia} />
      {/* Mostrar overlay si hay URL */}
      {mediaUrl && <MediaOverlay url={mediaUrl} onClose={cerrarMedia} />}
    </div>
  );
}

export default ListaFiles;
