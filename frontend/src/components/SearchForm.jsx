import React, { useState } from "react";
import "../assets/SearchForm.css";

export default function SearchForm({
  categorias,
  filtros,
  setFiltros,
  handleBuscar,
}) {
  const [categoriaInput, setCategoriaInput] = useState("");
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [categoriaDropdownVisible, setCategoriaDropdownVisible] =
    useState(false);
  const [abierto, setAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);

  const hoy = new Date();
  const formato = hoy.toISOString().split("T")[0];

  // Filtrar categorías para dropdown
  const categoriasFiltradas = categorias.filter(
    (cat) =>
      cat.nombre.toLowerCase().includes(categoriaInput.toLowerCase()) &&
      !selectedCategorias.some((c) => c.nombre === cat.nombre)
  );

  const agregarCategoria = (cat) => {
    setSelectedCategorias([
      ...selectedCategorias,
      { id: cat.id, nombre: cat.nombre },
    ]);
    setFiltros({
      ...filtros,
      categorias: [...selectedCategorias.map((c) => c.id), cat.id],
    });
    setCategoriaInput("");
    setCategoriaDropdownVisible(false);
  };

  const removeCategoria = (nombre) => {
    setSelectedCategorias(
      selectedCategorias.filter((c) => c.nombre !== nombre)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const idsCategorias = selectedCategorias.map((c) => c.id);
    setFiltros({ ...filtros, categorias: idsCategorias });
    const nuevoFiltro = { ...filtros, categorias: idsCategorias };
    setFiltros(nuevoFiltro);
    await handleBuscar(nuevoFiltro);
  };

  const opciones = ["ninguna", "pdf", "mp4", "mkv", "png", "jpg", "svg"];

  const seleccionar = (opcion) => {
    const tipo = opcion;
    if (tipo == "ninguna") {
      delete filtros.tipo;
      setSeleccionado(null);
    } else {
      setFiltros({ ...filtros, tipo: tipo });
      setSeleccionado({ nombre: opcion });
    }

    setAbierto(false);
  };

  return (
    <div className="search-container">
      <div className="search-header-wrapper">
        <h1 className="search-header">Buscador de archivos</h1>
      </div>

      <form className="search-form" onSubmit={handleSubmit} autoComplete="off">
        {/* Fila superior: nombre y autor */}
        <div className="search-row top-row">
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={filtros.name}
            onChange={(e) => setFiltros({ ...filtros, name: e.target.value })}
            className="input-text"
            name="nombre"
            autoComplete="off"
          />
          <input
            type="text"
            placeholder="Buscar por autor"
            value={filtros.user}
            onChange={(e) => setFiltros({ ...filtros, user: e.target.value })}
            className="input-text"
            name="autor"
            autoComplete="off"
          />
        </div>

        {/* Fila inferior: categoría, tipo, fechas */}
        <div className="search-row bottom-row">
          {/* Categoría dropdown */}
          <div
            className="autocomplete-wrapper"
            onFocus={() => setCategoriaDropdownVisible(true)}
            onBlur={() =>
              setTimeout(() => setCategoriaDropdownVisible(false), 150)
            }
          >
            <input
              type="text"
              placeholder="Buscar categoría"
              value={categoriaInput}
              onChange={(e) => setCategoriaInput(e.target.value)}
              onFocus={() => setCategoriaDropdownVisible(true)}
              className="input-text"
              name="categoria"
              autoComplete="off"
            />
            {categoriaDropdownVisible && (
              <ul className="autocomplete-list" tabIndex={-1}>
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

          {/* Tipo archivo */}
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
                {opciones.map((op) => (
                  <li
                    key={op}
                    className="dropdown-item"
                    onMouseDown={() => seleccionar(op)}
                  >
                    {op}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Rango de fechas */}
          <div className="date-range">
            <label htmlFor="fechaDesde">Desde:</label>
            <input
              type="date"
              id="fechaDesde"
              value={filtros.fecha_inicio}
              max={filtros.fecha_fin || formato}
              onChange={(e) =>
                setFiltros({ ...filtros, fecha_inicio: e.target.value })
              }
              className="input-text"
              name="fechaDesde"
            />
            <label htmlFor="fechaHasta"> Hasta:</label>
            <input
              type="date"
              id="fechaHasta"
              value={filtros.fecha_fin}
              min={filtros.fecha_inicio}
              max={formato}
              onChange={(e) =>
                setFiltros({ ...filtros, fecha_fin: e.target.value })
              }
              className="input-text"
              name="fechaHasta"
            />
          </div>
        </div>

        {/* Categorías seleccionadas */}
        <div className="selected-categories-container">
          <strong>Categorías seleccionadas: </strong>
          {selectedCategorias.length > 0 ? (
            selectedCategorias.map((cat) => (
              <span
                key={cat.nombre}
                className="category-badge"
                style={{ cursor: "pointer" }}
                onClick={() => removeCategoria(cat.nombre)}
              >
                {cat.nombre}
                <button
                  type="button"
                  aria-label={`Eliminar categoría ${cat.nombre}`}
                  className="remove-btn"
                  onClick={() => removeCategoria(cat.nombre)}
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="no-categories">Ninguna</span>
          )}
        </div>

        <button type="submit" className="search-button">
          Buscar
        </button>
      </form>
    </div>
  );
}
