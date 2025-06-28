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
  const [message, setMessage] = useState("");
  const [typeMessage, setTypeMessage] = useState(""); // 'error' o 'exito'

  const navigate = useNavigate();

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
    setLimpiar(!limpiar);
    setMessage("Subiendo cargado/s...");
    setTypeMessage("exito");
    const formData = new FormData();
    archivos.forEach((file) => formData.append("archivos", file));

    categoriasSeleccionadas.forEach((id) => formData.append("categorias", id));

    formData.append("descripcion", descripcion);

    try {
      await axios.post("/api/files", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setArchivos([]);
      setCategoriasSeleccionadas([]);
      setMessage("Archivo/s cargado/s");
      setTypeMessage("exito");
    } catch (err) {
      console.error("Error al subir file:", err);
      setMessage("Error al cargar archivo/s");
      setTypeMessage("error");
    }
  };

  const handleArchivoChange = (e) => {
    setArchivos(Array.from(e.target.files));
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
            setTypeMessage={setTypeMessage}
            setMessage={setMessage}
          />
        </div>
      )}
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
