import React, { useState } from "react";
import "../assets/EditableFileList.css";
import axios from "./../components/axiosConfig";

export default function EditableFileList({
  archivos,
  setArchivos,
  categorias,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  // const [archivodEditado, setArchivodEditado] = useState([]);
  const [editData, setEditData] = useState({});
  const [categoriaInput, setCategoriaInput] = useState("");
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [categoriasParaQuitar, setCategoriasParaQuitar] = useState([]);

  const toggleSeleccion = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSeleccionTodos = () => {
    if (selectedIds.length === archivos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(archivos.map((a) => a.id));
    }
  };

  const urlImagen = (img) => {
    return `http://localhost:3000/${img}`;
  };

  const listadoArchivos = async () => {
    try {
      const res = await axios.get("/api/files/revisando");
      setArchivos(res.data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const iniciarEdicion = (archivo) => {
    setEditandoId(archivo.id);
    const nuevaFecha = new Date(archivo.fecha).toISOString().slice(0, 10);
    setEditData({ ...archivo, fecha: nuevaFecha });

    setCategoriasParaQuitar([]); // reset categorias para quitar
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditData({});
    setCategoriasParaQuitar([]);
  };

  const guardarEdicion = async () => {
    const fechaConHora = new Date(editData.fecha + "T08:00:00");
    //const formato = fechaConHora.toISOString().split("T")[0];

    editData.fecha = fechaConHora;
    const nuevasCats = (editData.Categoria || []).filter(
      (cat) => !categoriasParaQuitar.includes(cat)
    );

    const archivoActualizado = { ...editData, Categoria: nuevasCats };

    try {
      await axios.post("/api/files/update", archivoActualizado);
    } catch (err) {
      console.error("Error en la búsqueda:", err);
    }
    setArchivos((prev) =>
      prev.map((a) => (a.id === editandoId ? archivoActualizado : a))
    );

    cancelarEdicion();
  };

  const subirTodoArchivo = async () => {
    try {
      for (let i = 0; i < archivos.length; i++) {
        await axios.post(`/api/files/estado/true/${archivos[i].id}`);
      }

      setSelectedIds([]);
      listadoArchivos();
    } catch (error) {
      console.error("Error al elimalmacenar file:", error);
    }
  };

  const subirSeleccionadoArchivo = async () => {
    const actualizarCategoria = archivos.filter((archivo) =>
      selectedIds.includes(archivo.id)
    );
    try {
      for (let i = 0; i < actualizarCategoria.length; i++) {
        await axios.post(`/api/files/estado/true/${actualizarCategoria[i].id}`);
      }

      setSelectedIds([]);
      listadoArchivos();
    } catch (error) {
      console.error("Error al elimalmacenar file:", error);
    }
  };

  const subirArchivo = async (archivo) => {
    alert(`Subiendo archivo: ${archivo.nombre}`);
    try {
      await axios.post(`/api/files/estado/true/${archivo.id}`);

      setArchivos((prev) => prev.filter((a) => a.id !== archivo.id));
      setSelectedIds((prev) => prev.filter((i) => i !== archivo.id));
      listadoArchivos();
    } catch (error) {
      console.error("Error al elimalmacenar file:", error);
    }
  };

  const eliminarArchivo = async (id) => {
    try {
      const res = await axios.delete(`/api/files/${id}`);
      if (res.status === 204) {
        setArchivos((prev) => prev.filter((a) => a.id !== id));
        setSelectedIds((prev) => prev.filter((i) => i !== id));
        listadoArchivos();
      }
    } catch (error) {
      console.error("Error al eliminar file:", error);
    }
  };

  const categoriasFiltradas = categorias.filter(
    (cat) =>
      cat.nombre.toLowerCase().includes(categoriaInput.toLowerCase()) &&
      !selectedCategorias.some((c) => c.id === cat.id)
  );

  const agregarCategoria = (cat) => {
    const nuevas = [
      ...selectedCategorias,
      {
        id: cat.id,
        nombre: cat.nombre,
      },
    ];
    setSelectedCategorias(nuevas);
    setCategoriaInput("");
    setDropdownVisible(false);
  };

  const removeCategoria = (cat) => {
    const filtradas = selectedCategorias.filter((c) => c.nombre !== cat);
    setSelectedCategorias(filtradas);
  };

  const aplicarCategorias = async () => {
    const nuevosArchivos = archivos.map((archivo) => {
      if (!selectedIds.includes(archivo.id)) return archivo;

      const nuevArch = [
        ...new Map(
          [...archivo.Categoria, ...selectedCategorias].map((a) => [a.id, a])
        ).values(),
      ];

      return { ...archivo, Categoria: nuevArch };
    });

    const actualizarCategoria = nuevosArchivos.filter((archivo) =>
      selectedIds.includes(archivo.id)
    );

    for (let i = 0; i < actualizarCategoria.length; i++) {
      try {
        await axios.post("/api/files/update", actualizarCategoria[i]);
      } catch (err) {
        console.error("Error en la búsqueda:", err);
      }
    }

    setArchivos(nuevosArchivos);
    setSelectedCategorias([]);
  };

  const quitarCategorias = async () => {
    if (!selectedIds) return;

    const nuevosArchivos = archivos.map((archivo) => {
      if (!selectedIds.includes(archivo.id)) return archivo;

      // Sacar los IDs de las categorías a eliminar
      const idsACancelar = selectedCategorias.map((cat) => cat.id);

      // Filtrar las categorías actuales para eliminar las que estén en selectedCategorias
      const categoriasFiltradas = archivo.Categoria.filter(
        (cat) => !idsACancelar.includes(cat.id)
      );

      return {
        ...archivo,
        Categoria: categoriasFiltradas,
      };
    });

    const actualizarCategoria = nuevosArchivos.filter((archivo) =>
      selectedIds.includes(archivo.id)
    );

    for (let i = 0; i < actualizarCategoria.length; i++) {
      try {
        await axios.post("/api/files/update", actualizarCategoria[i]);
      } catch (err) {
        console.error("Error en la búsqueda:", err);
      }
    }

    setArchivos(nuevosArchivos);
    setSelectedCategorias([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCategoriaParaQuitar = (cat) => {
    setCategoriasParaQuitar((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
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

  return (
    <div className="editable-file-list-container">
      {/* Barra fija arriba */}
      <div className="top-bar">
        <h3 className="listado-titulo">Archivos Subidos</h3>
        <div className="top-bar-actions">
          <button className="btn-subir-todo" onClick={() => subirTodoArchivo()}>
            Subir Todo
          </button>
          <button className="btn-toggle-select" onClick={toggleSeleccionTodos}>
            {selectedIds.length === archivos.length
              ? "Deseleccionar todo"
              : "Seleccionar todo"}
          </button>
          <button
            className="btn-subir-todo"
            onClick={() => subirSeleccionadoArchivo()}
          >
            Subir Seleccionados
          </button>
        </div>
      </div>

      <div className="categoria-bulk-wrapper">
        <div className="selected-categories-container">
          <strong>Categorías seleccionadas: </strong>
          {selectedCategorias.length > 0 ? (
            selectedCategorias.map((cat) => (
              <span
                key={cat.nombre}
                className="category-badge"
                onClick={() => removeCategoria(cat.nombre)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    removeCategoria(cat.nombre);
                }}
              >
                {cat.nombre} ×
              </span>
            ))
          ) : (
            <span className="no-categories">Ninguna</span>
          )}
        </div>

        <div className="container-categoria">
          <br />
          <div
            className="autocomplete-wrapper"
            onFocus={() => setDropdownVisible(true)}
            onBlur={() => setTimeout(() => setDropdownVisible(false), 150)}
          >
            <input
              type="text"
              placeholder="Buscar categoría"
              value={categoriaInput}
              onChange={(e) => setCategoriaInput(e.target.value)}
              onFocus={() => setDropdownVisible(true)}
              className="input-text"
              name="categoria"
              autoComplete="off"
            />
            {dropdownVisible && (
              <ul className="autocomplete-lists" tabIndex={-1}>
                {categoriasFiltradas.length > 0 ? (
                  categoriasFiltradas.map((cat) => (
                    <li
                      key={cat.id}
                      className="autocomplete-item"
                      tabIndex={0}
                      onClick={() => agregarCategoria(cat)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          agregarCategoria(cat);
                        }
                      }}
                    >
                      {cat.nombre}
                    </li>
                  ))
                ) : (
                  <li className="autocomplete-no-results">
                    Sin categorías libres
                  </li>
                )}
              </ul>
            )}
          </div>
          <br />
          <button
            className="btn-agregar"
            onClick={aplicarCategorias}
            disabled={
              selectedIds.length === 0 || selectedCategorias.length === 0
            }
          >
            Agregar a seleccionados
          </button>

          <button
            className="btn-eliminar"
            onClick={quitarCategorias}
            disabled={
              selectedIds.length === 0 || selectedCategorias.length === 0
            }
          >
            Eliminar a seleccionados
          </button>
        </div>
        <br />
      </div>

      {/* Contenedor scrollable para el listado */}
      <div className="editable-file-list-scroll">
        {archivos.map((archivo) => {
          const isEditing = editandoId === archivo.id;
          const hoy = new Date();
          const formato = hoy.toISOString().split("T")[0];
          return (
            <div
              key={archivo.id}
              className={`editable-file-item ${
                selectedIds.includes(archivo.id) ? "seleccionado" : ""
              }`}
              onClick={(e) => {
                if (
                  e.target.tagName !== "BUTTON" &&
                  e.target.tagName !== "INPUT" &&
                  e.target.tagName !== "TEXTAREA" &&
                  isEditing == false
                ) {
                  toggleSeleccion(archivo.id);
                }
              }}
            >
              {/* Columna 1: Miniatura */}
              <div className="file-thumbnail">
                <img
                  src={urlImagen(archivo.miniatura)}
                  alt={`Miniatura de ${archivo.nombre}`}
                  className="miniatura-img"
                  onError={(e) => {
                    e.target.onerror = null; // previene bucle
                    e.target.src = "/no-image.png";
                  }}
                />
              </div>
              <div className="editable-file-details">
                {isEditing ? (
                  <>
                    <input
                      name="nombre"
                      value={editData.nombre}
                      onChange={handleChange}
                      className="input-editar"
                    />
                    <input
                      type="date"
                      name="fecha"
                      value={editData.fecha}
                      max={formato}
                      onChange={handleChange}
                      className="input-editar"
                    />
                    <textarea
                      name="descripcion"
                      value={editData.descripcion}
                      onChange={handleChange}
                      className="textarea-editar"
                      rows={3}
                    />
                    <div className="editable-file-categorias">
                      {(editData.Categoria || []).map((cat) => {
                        const marcadaParaQuitar =
                          categoriasParaQuitar.includes(cat);
                        return (
                          <span
                            key={cat.nombre}
                            className={`categoria-label ${
                              marcadaParaQuitar
                                ? "categoria-quitar"
                                : "categoria-seleccionada"
                            }`}
                            onClick={() => toggleCategoriaParaQuitar(cat)}
                            style={{ cursor: "pointer" }}
                          >
                            {cat.nombre}
                          </span>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <strong>{archivo.nombre}</strong>
                    <span>Tipo: {archivo.tipo}</span>
                    <span>Fecha: {formatearFecha(archivo.fecha)}</span>
                    <span>Autor: {archivo.Usuario?.nombre || "-"}</span>
                    <p className="descripcion-texto">
                      {archivo.descripcion || "Sin descripción"}
                    </p>
                    <div>
                      {(archivo.Categoria || []).map((cat) => (
                        <span
                          key={cat.nombre}
                          className="categoria-label categoria-seleccionada"
                        >
                          {cat.nombre}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="editable-file-buttons">
                {isEditing ? (
                  <>
                    <button className="btn-guardar" onClick={guardarEdicion}>
                      Guardar
                    </button>
                    <button className="btn-cancelar" onClick={cancelarEdicion}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn-editar"
                      onClick={() => iniciarEdicion(archivo)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-subir"
                      onClick={() => subirArchivo(archivo)}
                    >
                      Subir
                    </button>
                    <button
                      className="btn-eliminar"
                      onClick={() => eliminarArchivo(archivo.id)}
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
