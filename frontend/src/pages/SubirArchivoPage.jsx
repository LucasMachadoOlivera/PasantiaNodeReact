import React, { useState, useEffect } from "react";
import axios from "./../components/axiosConfig";
import { useNavigate } from "react-router-dom";
import SubirArchivo from "./SubirArchivo";
import EditableFileList from "./EditableFileList";
import "../assets/SubirArchivoPage.css";

export default function SubirArchivoPage() {
  const [archivos, setArchivos] = useState([]);
  const [archivosList, setArchivosList] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [limpiar, setLimpiar] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/usuario").catch(() => {
      navigate("/login");
    });

    obtenerCategorias();
    listadoArchivos();
  }, [navigate, archivos]);

  const obtenerCategorias = async () => {
    try {
      const res = await axios.get("/api/categorias");
      setCategorias(res.data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const listadoArchivos = async () => {
    try {
      const res = await axios.get("/api/files/revisando");

      setArchivosList(res.data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const handleAgregarFile = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    archivos.forEach((file) => formData.append("archivos", file)); // clave plural

    categoriasSeleccionadas.forEach((id) => formData.append("categorias", id));

    formData.append("descripcion", descripcion);

    try {
      await axios.post("/api/files", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setLimpiar(!limpiar);
      alert("Archivo(s) subido(s) exitosamente");
      setArchivos([]);
      setCategoriasSeleccionadas([]);
    } catch (err) {
      console.error("Error al subir file:", err);
    }
  };

  const handleArchivoChange = (e) => {
    setArchivos(Array.from(e.target.files)); // asegurar array
  };

  return (
    <div
      className={`page-container ${
        archivosList.length > 0 ? "con-listado" : ""
      }`}
    >
      <div className="subir-archivo-wrapper">
        <SubirArchivo
          agregarArchivos={handleArchivoChange}
          categorias={categorias}
          setCategoriasSeleccionadas={setCategoriasSeleccionadas}
          subirArchivos={handleAgregarFile}
          setDescripcion={setDescripcion}
          descripcion={descripcion}
          limpiar={limpiar}
        />
      </div>
      {archivosList.length > 0 && (
        <div className="editable-list-wrapper">
          <EditableFileList
            archivos={archivosList}
            setArchivos={setArchivosList}
            categorias={categorias}
          />
        </div>
      )}
    </div>
  );
}
