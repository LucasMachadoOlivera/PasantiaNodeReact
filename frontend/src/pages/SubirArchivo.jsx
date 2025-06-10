import React, { useState, useEffect, useRef } from "react";
import "../assets/SubirArchivo.css";

export default function SubirArchivo({
  agregarArchivos,
  categorias,
  setCategoriasSeleccionadas,
  subirArchivos,
  descripcion,
  setDescripcion,
  limpiar,
}) {
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [categoriaInput, setCategoriaInput] = useState("");
  const [categoriaDropdownVisible, setCategoriaDropdownVisible] =
    useState(false);
  const inputFileRef = useRef(null);

  useEffect(() => {
    setSelectedCategorias([]);
    setDescripcion("");
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  }, [limpiar]);

  const categoriasFiltradas = categorias.filter(
    (cat) =>
      cat.nombre.toLowerCase().includes(categoriaInput.toLowerCase()) &&
      !selectedCategorias.some((c) => c.id === cat.id)
  );

  const agregarCategoria = (cat) => {
    const nuevas = [...selectedCategorias, { id: cat.id, nombre: cat.nombre }];
    setSelectedCategorias(nuevas);
    setCategoriasSeleccionadas(nuevas.map((c) => c.id)); // IDs solamente
    setCategoriaInput("");
    setCategoriaDropdownVisible(false);
  };

  const removeCategoria = (nombre) => {
    const filtradas = selectedCategorias.filter((c) => c.nombre !== nombre);
    setSelectedCategorias(filtradas);
    setCategoriasSeleccionadas(filtradas.map((c) => c.id));
  };

  return (
    <form className="form-subir-archivo" onSubmit={subirArchivos}>
      <h2 className="form-title">Subir Archivo</h2>
      <br />
      <input
        type="file"
        multiple
        onChange={agregarArchivos}
        className="file-input"
        ref={inputFileRef}
        required
      />
      <input
        type="text"
        placeholder="Descripcion"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className="input-text"
      />
      <div
        className="autocomplete-wrapper"
        onFocus={() => setCategoriaDropdownVisible(true)}
        onBlur={() => setTimeout(() => setCategoriaDropdownVisible(false), 150)}
      >
        <label htmlFor="categoriaInput">Agregar Categoría:</label>
        <input
          id="categoriaInput"
          type="text"
          value={categoriaInput}
          onFocus={() => setCategoriaDropdownVisible(true)}
          onChange={(e) => {
            setCategoriaInput(e.target.value);
            setCategoriaDropdownVisible(true);
          }}
          placeholder="Buscar o agregar categoría"
          autoComplete="off"
          className="input-text"
        />
        {categoriaDropdownVisible && (
          <ul className="autocomplete-list" tabIndex={-1}>
            {categoriasFiltradas.length > 0 ? (
              categoriasFiltradas.map((cat) => (
                <li
                  key={cat.id}
                  onClick={() => agregarCategoria(cat)}
                  className="autocomplete-item"
                >
                  {cat.nombre}
                </li>
              ))
            ) : (
              <li className="autocomplete-no-results">Sin categorías libres</li>
            )}
          </ul>
        )}
      </div>

      <div className="selected-categories-container">
        <strong>Categorías seleccionadas: </strong>
        {selectedCategorias.length > 0 ? (
          selectedCategorias.map((cat) => (
            <span
              key={cat.id}
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
      <br />
      <button type="submit" className="btn-subir-archivos">
        Subir Archivos
      </button>
      <p className="nota-subida">
        Nota: Despues de subir los archivos se podran realizar mas cambios.
      </p>
    </form>
  );
}
