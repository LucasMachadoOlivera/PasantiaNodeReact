import React, { useEffect, useState } from "react";
import "../assets/ArchivoList.css";
import axios from "./axiosConfig";

export default function ArchivoList({
  archivos,
  setArchivos,
  abrirMedia,
  categorias,
  permisos,
  proposito,
  compartir,
  usuarioDato,
  setMessage,
  setTypeMessage,
}) {
  const [editandoId, setEditandoId] = useState(null);
  delete categorias.archivoCount;

  const [editData, setEditData] = useState({});
  const [categoriasParaQuitar, setCategoriasParaQuitar] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [userSeleccionado, setUserSeleccionado] = useState(null);

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

  const opcionesPrivilegio = [
    { id: "0", nombre: "Visualizador" },
    { id: "1", nombre: "Editor" },
  ];

  const [usarOpcionesPrivilegio, setUsarOpcionesPrivilegio] =
    useState(opcionesPrivilegio); // 'error' o 'exito'

  useEffect(() => {
    if (compartirInput.length > 3) {
      buscarCompartir();
    } else {
      setComparte([]);
    }
  }, [compartirInput]);

  function estaCompartido(archivo) {
    for (let i = 0; i < archivo.UsuariosConAcceso.length; i++) {
      const compartidos = archivo.UsuariosConAcceso[i];
      if (
        usuarioDato.id == compartidos.File_usuario.usuario_id &&
        compartidos.File_usuario.permiso == "Editor"
      )
        return true;
    }

    return false;
  }

  const actualizarCompartiendo = async () => {
    const fileId = selectedCompartir[0]?.id;
    const compartido = await axios.get(`/api/files/compartiendo/${fileId}`);
    const compartidoSeleccionado = await selectedCompartir.map((compartir) => ({
      ...compartir,
      UsuariosConAcceso: compartido.data.UsuariosConAcceso,
    }));
    setSelectedCompartir(compartidoSeleccionado);
  };

  const agregarCompartir = (com) => {
    let continuar = true;

    (selectedCompartir[0]?.UsuariosConAcceso || []).map((comp) => {
      if (!continuar) return;
      if (com === comp.email) {
        setUsarOpcionesPrivilegio(
          opcionesPrivilegio.filter(
            (item) =>
              item.nombre !==
              selectedCompartir[0].UsuariosConAcceso[0].File_usuario.permiso
          )
        );
        setCompartirInput(com);
        setSeleccionadoPrivilegio(null);
        continuar = false;
      } else {
        setUsarOpcionesPrivilegio(opcionesPrivilegio);
      }
    });
    if (continuar) {
      setSelectedCompartir((prev) => {
        const yaExiste = prev.some((c) => c.id === com.id);
        if (yaExiste) {
          return prev;
        }

        setCompartirInput(com);
        return prev;
      });
    }

    setCompartirDropdownVisible(false);
  };

  const buscarCompartir = async () => {
    setUserSeleccionado(null);
    try {
      if (compartirInput) {
        const email = await axios.get(`/api/usuarios/buscar/${compartirInput}`);
        if (email.data.length > 0 && email.data.length <= 3) {
          setUserSeleccionado(
            email.data.filter((item) => item.email === compartirInput)
          );
          setComparte(
            email.data.filter((item) => item.email !== compartirInput)
          );
        } else {
          setComparte([]);
        }
      } else {
        setComparte([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const urlImagen = (img) => {
    return `http://${import.meta.env.VITE_HOST}:${
      import.meta.env.VITE_PORT
    }/${img}`;
  };
  const urlDescargar = (img) => {
    return `http://${import.meta.env.VITE_HOST}:${
      import.meta.env.VITE_PORT
    }/descargar/${img}`;
  };
  const urlVer = (img) => {
    return `http://${import.meta.env.VITE_HOST}:${
      import.meta.env.VITE_PORT
    }/${img}`;
  };

  const formatearFecha = (fecha) => {
    const opciones = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
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

    setCategoriasParaQuitar([]);
    setCompartirParaQuitar([]);
  };

  const cancelarEdicion = () => {
    const archivoActualizado = {
      ...editData,
      Categoria: selectedCategorias,
      UsuariosConAcceso: selectedCompartir[0]?.UsuariosConAcceso,
    };
    setArchivos((prev) =>
      prev.map((a) => (a.id === editandoId ? archivoActualizado : a))
    );
    setSelectedCategorias([]);
    setEditandoId(null);
    setEditData({});
    setCategoriasParaQuitar([]);
    setCompartirParaQuitar([]);
  };

  const guardarEdicion = async () => {
    const fechaConHora = new Date(editData.fecha + "T08:00:00");

    editData.fecha = fechaConHora;

    const archivoActualizado = {
      ...editData,
      Categoria: selectedCategorias,
      UsuariosConAcceso: selectedCompartir[0]?.UsuariosConAcceso,
    };

    try {
      await axios.post("/api/files/update", archivoActualizado);
      setMessage("Archivo Editado.");
      setTypeMessage("exito");
    } catch (err) {
      console.error("Error en la búsqueda:", err);
      setMessage("Error al editar archivo");
      setTypeMessage("error");
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

  const toggleCompartirParaQuitar = async (com) => {
    try {
      const confirmar = window.confirm(
        `¿Estás seguro de que quieres quitar "${com.email}" del archivo compartido?`
      );
      if (!confirmar) {
        // Usuario canceló, salgo de la función
        return;
      }
      const datos = com.File_usuario;
      const compartido = await axios.get(
        `/api/files/borrar/${datos.usuario_id}/${datos.file_id}`
      );
      const compartidoSeleccionado = await selectedCompartir.map(
        (compartir) => ({
          ...compartir,
          UsuariosConAcceso: compartido.data.UsuariosConAcceso,
        })
      );
      setSelectedCompartir(compartidoSeleccionado);
      setMessage("Usuario quitado del archivo." + com.email);
      setTypeMessage("exito");
    } catch (err) {
      console.error("Error:" + err);
      setMessage("Error al quitar el usuario");
      setTypeMessage("error");
    }
  };

  const eliminarArchivo = async (arch) => {
    try {
      const confirmar = window.confirm(
        `¿Estás seguro de que quieres eliminar el archivo "${arch.nombre}"?`
      );
      if (!confirmar) {
        // Usuario canceló, salgo de la función
        return;
      }

      const res = await axios.delete(`/api/files/${arch.id}`);
      if (res.status === 204) {
        setArchivos((prev) => prev.filter((a) => a.id !== arch.id));
      }
      setMessage("Archivo eliminado.");
      setTypeMessage("exito");
    } catch (error) {
      console.error("Error al eliminar file:", error);
      setMessage("Invalido" + error);
      setTypeMessage("error");
    }
  };

  return (
    <>
      {(permisos?.verarchivo === true ||
        proposito === "propios" ||
        proposito === "compartidos") && (
        <div className="archivo-list-container">
          {archivos?.map((archivo) => {
            const isEditing = editandoId === archivo.id;
            const hoy = new Date();
            const formato = hoy.toISOString().split("T")[0];

            return (
              <div key={archivo.id} className="archivo-item">
                <img
                  src={urlImagen(archivo.miniatura) || "/no-image.png"}
                  alt={archivo.nombre}
                  className="archivo-item-image"
                  onError={(e) => {
                    e.target.onerror = null; // previene bucle
                    e.target.src = "/no-image.png";
                  }}
                />
                <br />
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
                                      onClick={() =>
                                        agregarCompartir(com.email)
                                      }
                                      onKeyDown={(e) => {
                                        if (
                                          e.key === "Enter" ||
                                          e.key === " "
                                        ) {
                                          e.preventDefault();
                                          agregarCompartir(com.email);
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
                              {usarOpcionesPrivilegio.map((op) => (
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
                        </div>
                        <button
                          className="btn-compartir"
                          onClick={async () => {
                            try {
                              setCompartirInput("");
                              setSeleccionadoPrivilegio(null);
                              await compartir(
                                userSeleccionado,
                                compartirInput,
                                editData.id,
                                seleccionadoPrivilegio
                              );
                              await actualizarCompartiendo();
                            } catch (error) {
                              console.error(error);
                            }
                          }}
                        >
                          Compartir
                        </button>
                        <br />
                        <br />
                        <p>
                          Nota: Al cambiar los usuarios en "Compartir", los
                          cambios se guardan automáticamente, sin necesidad de
                          presionar el botón Guardar.
                        </p>
                        <br />
                        <div className="editable-file-categorias">
                          {(selectedCompartir[0]?.UsuariosConAcceso || []).map(
                            (com) => {
                              const marcadaParaQuitarCompartir =
                                compartirParaQuitar.includes(com);
                              const emailPermiso = `${com.email} ${com.File_usuario.permiso}`;

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
                                  {emailPermiso}
                                </span>
                              );
                            }
                          )}
                        </div>
                      </div>
                      <p>Descripción</p>
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
                            Categorías: <strong />
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
                              {`${com.email}:${com.File_usuario.permiso}`}
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
                <div className="archivo-editable-file-buttons">
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
                      <div className="archivo-item-buttons">
                        {(proposito === "propios" ||
                          (proposito === "compartidos" &&
                            estaCompartido(archivo)) ||
                          (proposito === "todos" &&
                            permisos.edarchivo === true)) && (
                          <button
                            className="btn-edita"
                            onClick={() => iniciarEdicion(archivo)}
                          >
                            Editar
                          </button>
                        )}
                        {(proposito === "propios" ||
                          (proposito === "todos" &&
                            permisos.elarchivo === true)) && (
                          <button
                            className="btn-elimina"
                            onClick={() => eliminarArchivo(archivo)}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
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
