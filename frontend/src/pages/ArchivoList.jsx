import React, { useEffect, useState } from "react";
import "../assets/ArchivoList.css";
import axios from "./../components/axiosConfig";

export default function ArchivoList({
  archivos,
  setArchivos,
  abrirMedia,
  categorias,
  permisos,
  proposito,
  compartir,
}) {
  const [editandoId, setEditandoId] = useState(null);
  delete categorias.archivoCount;
  // const [archivodEditado, setArchivodEditado] = useState([]);
  const [editData, setEditData] = useState({});
  const [categoriasParaQuitar, setCategoriasParaQuitar] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);

  const [categoriaInput, setCategoriaInput] = useState("");
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [categoriaDropdownVisible, setCategoriaDropdownVisible] =
    useState(false);

  // Filtrar categorías para dropdown
  const categoriasFiltradas = categorias.filter(
    (cat) =>
      cat.nombre.toLowerCase().includes(categoriaInput.toLowerCase()) &&
      !selectedCategorias.some((c) => c.nombre === cat.nombre)
  );

  const [selectedCompartir, setSelectedCompartir] = useState([]);
  const [compartirParaQuitar, setCompartirParaQuitar] = useState([]);

  const [abiertoPrivilegio, setAbiertoPrivilegio] = useState(false);
  const [seleccionadoPrivilegio, setSeleccionadoPrivilegio] = useState(null);
  const agregarCategoria = (cat) => {
    setSelectedCategorias((prev) => {
      const yaExiste = prev.some((c) => c.id === cat.id);
      if (yaExiste) return prev;
      return [...prev, { id: cat.id, nombre: cat.nombre }];
    });

    setCategoriaInput("");
    setCategoriaDropdownVisible(false);
  };

  const [comparte, setComparte] = useState([]);
  const [compartirInput, setCompartirInput] = useState("");
  const [compartirDropdownVisible, setCompartirDropdownVisible] =
    useState(false);

  // Filtrar categorías para dropdown

  const agregarCompartir = (com) => {
    let continuar = true;
    (selectedCompartir[0]?.UsuariosConAcceso || []).map((comp) => {
      if (com.email === comp.email) {
        setCompartirInput("");
        setSeleccionadoPrivilegio(null);
        continuar = false;
      }
    });
    if (continuar) {
      setSelectedCompartir((prev) => {
        const yaExiste = prev.some((c) => c.id === com.id);
        if (yaExiste) {
          return prev;
        }
        setCompartirInput(com.email);
        return [...prev, { id: com.id, nombre: com.nombre }];
      });
    }

    setCompartirDropdownVisible(false);
  };

  const buscarCompartir = async () => {
    try {
      const email = await axios.get(`/api/usuarios/buscar/${compartirInput}`);

      if (email.data.length > 0 && email.data.length <= 3) {
        setComparte(email.data);
      } else {
        setComparte([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    buscarCompartir();
  }, [compartirInput]);

  const urlImagen = (img) => {
    return `http://localhost:3000/${img}`;
  };
  const urlDescargar = (img) => {
    return `http://localhost:3000/descargar/${img}`;
  };
  const urlVer = (img) => {
    return `http://localhost:3000/${img}`;
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

  const opciones = [
    { id: "0", nombre: "Publico" },
    { id: "1", nombre: "Privado" },
  ];

  const opcionesPrivilegio = [
    { id: "0", nombre: "Visualizador" },
    { id: "1", nombre: "Editor" },
  ];
  const seleccionar = (opcion) => {
    const estado = opcion.nombre;

    editData.estado = estado;
    setSeleccionado(opcion);

    setAbierto(false);
  };

  const seleccionarPrivilegio = (opcion) => {
    const estado = opcion.nombre;

    editData.estado = estado;
    setSeleccionadoPrivilegio(opcion);

    setAbiertoPrivilegio(false);
  };

  const iniciarEdicion = async (archivo) => {
    setEditandoId(archivo.id);
    const nuevaFecha = new Date(archivo.fecha).toISOString().slice(0, 10);
    setEditData({ ...archivo, fecha: nuevaFecha });

    const acceso = await axios.get(`/api/files/conAcceso/${archivo.id}`);
    console.log("ACCESO", acceso.data);
    setSelectedCompartir(acceso.data);
    archivo.Categoria.map((cat) => {
      const clave = {
        id: cat.id,
        nombre: cat.nombre,
      };
      agregarCategoria(clave);
    });

    setSeleccionado(
      opciones.find((opcion) => opcion.nombre === archivo.estado)
    );

    //editData.fecha = formato;
    setCategoriasParaQuitar([]);
    setCompartirParaQuitar([]);
  };

  const cancelarEdicion = () => {
    setSelectedCategorias([]);
    setEditandoId(null);
    setEditData({});
    setCategoriasParaQuitar([]);
    setCompartirParaQuitar([]);
  };

  const guardarEdicion = async () => {
    const fechaConHora = new Date(editData.fecha + "T08:00:00");
    //const formato = fechaConHora.toISOString().split("T")[0];

    editData.fecha = fechaConHora;

    const archivoActualizado = {
      ...editData,
      Categoria: selectedCategorias,
      UsuariosConAcceso: selectedCompartir[0].UsuariosConAcceso,
    };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCategoriaParaQuitar = (cat) => {
    setSelectedCategorias(
      selectedCategorias.filter((c) => c.nombre !== cat.nombre)
    );
  };

  const toggleCompartirParaQuitar = (com) => {
    setSelectedCompartir((prev) =>
      prev.map((item) => ({
        ...item,
        UsuariosConAcceso: item.UsuariosConAcceso?.filter(
          (r) => r.nombre !== com.nombre
        ),
      }))
    );
    /*
    setSelectedCompartir(
      selectedCompartir.filter((c) => c.nombre !== com.nombre)
    );*/
  };

  const eliminarArchivo = async (id) => {
    try {
      const res = await axios.delete(`/api/files/${id}`);
      if (res.status === 204) {
        setArchivos((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error("Error al eliminar file:", error);
    }
  };

  return (
    <>
      {permisos?.verarchivo === true && (
        <div className="archivo-list-container">
          {archivos.map((archivo) => {
            const isEditing = editandoId === archivo.id;
            const hoy = new Date();
            const formato = hoy.toISOString().split("T")[0];
            return (
              <div key={archivo.id} className="archivo-item">
                <div className="archivo-imagen">
                  <img
                    src={urlImagen(archivo.miniatura) || "/no-image.png"}
                    alt={archivo.nombre}
                    onError={(e) => {
                      e.target.onerror = null; // previene bucle
                      e.target.src = "/no-image.png";
                    }}
                  />
                </div>
                <div className="archivo-detalles">
                  {isEditing ? (
                    <>
                      <p>Nombre</p>
                      <input
                        name="nombre"
                        value={editData.nombre}
                        onChange={handleChange}
                        className="input-editar"
                      />
                      <p>Fecha</p>
                      <input
                        type="date"
                        name="fecha"
                        value={editData.fecha}
                        max={formato}
                        onChange={handleChange}
                        className="input-editar"
                      />
                      <div>
                        <p>Estado</p>
                        {/* Tipo archivo */}
                        <div
                          className="dropdown-wrapper"
                          tabIndex={0}
                          onBlur={() =>
                            setTimeout(() => setAbierto(false), 150)
                          }
                        >
                          <div
                            className="dropdown-display"
                            onClick={() => setAbierto(!abierto)}
                          >
                            {seleccionado
                              ? seleccionado.nombre
                              : "Seleccionar..."}
                          </div>

                          {abierto && (
                            <ul className="dropdown-list">
                              {opciones.map((op) => (
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

                          {/* Hidden input para enviar valor si es parte de un form */}
                          <input
                            type="hidden"
                            name="categoria"
                            value={seleccionado?.id || ""}
                          />
                        </div>
                      </div>
                      <div className="compartir-item">
                        <div>
                          <p>Compartir</p>
                          {/* Compartir archivo */}
                          <div
                            className="autocomplete-wrapper"
                            onFocus={() => setCompartirDropdownVisible(true)}
                            onBlur={() =>
                              setTimeout(
                                () => setCompartirDropdownVisible(false),
                                150
                              )
                            }
                          >
                            <input
                              type="text"
                              placeholder="Escribir email"
                              value={compartirInput}
                              onChange={(e) =>
                                setCompartirInput(e.target.value)
                              }
                              onFocus={() => setCompartirDropdownVisible(true)}
                              className="input-text"
                              name="compartir"
                              autoComplete="off"
                            />
                            {compartirDropdownVisible && (
                              <ul className="autocomplete-list" tabIndex={-1}>
                                {comparte.length > 0 ? (
                                  comparte.map((com) => (
                                    <li
                                      key={com.id}
                                      className="autocomplete-item"
                                      tabIndex={0}
                                      onClick={() => agregarCompartir(com)}
                                      onKeyDown={(e) => {
                                        if (
                                          e.key === "Enter" ||
                                          e.key === " "
                                        ) {
                                          e.preventDefault();
                                          agregarCompartir(com);
                                        }
                                      }}
                                    >
                                      {com.email}
                                    </li>
                                  ))
                                ) : (
                                  <></>
                                )}
                              </ul>
                            )}
                          </div>
                        </div>

                        <p>Privilegio</p>
                        {/* Privilegio archivo */}
                        <div
                          className="dropdown-wrapper"
                          tabIndex={0}
                          onBlur={() =>
                            setTimeout(() => setAbiertoPrivilegio(false), 150)
                          }
                        >
                          <div
                            className="dropdown-display"
                            onClick={() => setAbiertoPrivilegio(!abierto)}
                          >
                            {seleccionadoPrivilegio
                              ? seleccionadoPrivilegio.nombre
                              : "Seleccionar..."}
                          </div>

                          {abiertoPrivilegio && (
                            <ul className="dropdown-list">
                              {opcionesPrivilegio.map((op) => (
                                <li
                                  key={op.id}
                                  className="dropdown-item"
                                  onMouseDown={() => seleccionarPrivilegio(op)}
                                >
                                  {op.nombre}
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* Hidden input para enviar valor si es parte de un form */}
                          <input
                            type="hidden"
                            name="categoria"
                            value={seleccionado?.id || ""}
                          />
                        </div>
                        <button
                          className="btn-compartir"
                          onClick={() => {
                            setCompartirInput("");
                            setSeleccionadoPrivilegio(null);
                            compartir(
                              comparte,
                              compartirInput,
                              editData.id,
                              seleccionadoPrivilegio
                            );
                          }}
                        >
                          Compartir
                        </button>
                        <br />
                        <br />
                        <div className="editable-file-categorias">
                          {(selectedCompartir[0]?.UsuariosConAcceso || []).map(
                            (com) => {
                              const marcadaParaQuitarCompartir =
                                compartirParaQuitar.includes(com);
                              console.log("datoqqq", com);
                              return (
                                <span
                                  key={com.nombre}
                                  className={`categoria-label ${
                                    marcadaParaQuitarCompartir
                                      ? "categoria-quitar"
                                      : "categoria-seleccionada"
                                  }`}
                                  onClick={() => toggleCompartirParaQuitar(com)}
                                  style={{ cursor: "pointer" }}
                                >
                                  {com.email} : {com.File_usuario.permiso}
                                </span>
                              );
                            }
                          )}
                        </div>
                      </div>
                      <p>Descripcion</p>
                      <textarea
                        name="descripcion"
                        value={editData.descripcion}
                        onChange={handleChange}
                        className="textarea-editar"
                        rows={3}
                      />
                      <p>Categorias</p>
                      {/* Categoría con input + dropdown */}
                      <div
                        className="autocomplete-wrapper"
                        onFocus={() => setCategoriaDropdownVisible(true)}
                        onBlur={() =>
                          setTimeout(
                            () => setCategoriaDropdownVisible(false),
                            150
                          )
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

                      <div className="editable-file-categorias">
                        {(selectedCategorias || []).map((cat) => {
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
                      <h3 className="archivo-nombre">{archivo.nombre} </h3>
                      <p>
                        <strong>Tipo:</strong> {archivo.tipo}
                      </p>
                      <p>
                        <strong>Fecha:</strong> {formatearFecha(archivo.fecha)}
                      </p>
                      <p>
                        <strong>Autor:</strong> {archivo.Usuario.nombre}
                      </p>
                      <p>
                        <strong>Estado:</strong> {archivo.estado}
                      </p>
                      <p>
                        <span>
                          <strong>
                            Categorias: <strong />
                          </strong>
                        </span>
                        {archivo.Categoria && archivo.Categoria.length > 0 ? (
                          archivo.Categoria.map((cat) => (
                            <span key={cat.id} className="category-badge">
                              {cat.nombre}
                            </span>
                          ))
                        ) : (
                          <>
                            <span className="no-categories">Sin categoría</span>
                          </>
                        )}
                      </p>
                      <p>
                        <span>
                          <strong>
                            Compartido: <strong />
                          </strong>
                        </span>
                        {archivo.UsuariosConAcceso &&
                        archivo.UsuariosConAcceso.length > 0 ? (
                          archivo.UsuariosConAcceso.map((com) => (
                            <span key={com.id} className="compartir-badge">
                              {com.email} : {com.File_usuario.permiso}
                            </span>
                          ))
                        ) : (
                          <>
                            <span className="no-categories">No disponible</span>
                          </>
                        )}
                      </p>
                      <p className="archivo-descripcion">
                        {archivo.descripcion}
                      </p>
                    </>
                  )}
                </div>
                <div className="editable-file-buttons">
                  {isEditing ? (
                    <>
                      <button className="btn-guardar" onClick={guardarEdicion}>
                        Guardar
                      </button>
                      <button
                        className="btn-cancelar"
                        onClick={cancelarEdicion}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="list-item-buttons">
                        {archivo.tipo !== "zip" && (
                          <button
                            type="button"
                            onClick={() => abrirMedia(urlVer(archivo.archivo))}
                          >
                            Visualizar
                          </button>
                        )}
                        <a
                          href={urlDescargar(archivo.archivo)}
                          download="ejemplo.pdf"
                        >
                          <button>Descargar</button>
                        </a>
                      </div>

                      {(proposito === "propios" ||
                        (proposito === "compartido" &&
                          archivo?.UsuariosConAcceso[0].permiso === "Editor") ||
                        (proposito === "todos" &&
                          permisos.edarchivo === true)) && (
                        <button
                          className="btn-editar"
                          onClick={() => iniciarEdicion(archivo)}
                        >
                          Editar
                        </button>
                      )}
                      {(proposito === "propios" ||
                        (proposito === "compartido" &&
                          archivo?.UsuariosConAcceso[0].permiso === "Editor") ||
                        (proposito === "todos" &&
                          permisos.elarchivo === true)) && (
                        <button
                          className="btn-eliminar"
                          onClick={() => eliminarArchivo(archivo.id)}
                        >
                          Eliminar
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
