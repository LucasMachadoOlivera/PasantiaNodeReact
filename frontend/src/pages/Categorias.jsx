import React, { useEffect, useState } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import "../assets/Categorias.css";
import axios from "./../components/axiosConfig";

export default function Categorias({ permisos, setMessage, setTypeMessage }) {
  const [categorias, setCategorias] = useState();
  const [selectedForSwap, setSelectedForSwap] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");

  const [anterior, setAnterior] = useState(true);
  const [siguiente, setSiguiente] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const [cantidad] = useState(parseInt(searchParams.get("cantidad")) || 6);
  const [paginaActual, setPaginaActual] = useState(
    parseInt(searchParams.get("paginaActual")) || 1
  );

  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams();
  params.append("paginaActual", paginaActual);
  params.append("cantidad", cantidad);

  useEffect(() => {
    actualizarCategorias(paginaActual);
  }, []);

  const toggleSelect = (cat) => {
    if (selectedForSwap.some((item) => item.id === cat.id)) {
      setSelectedForSwap(selectedForSwap.filter((c) => c.id !== cat.id));
    } else {
      if (selectedForSwap.length < 2) {
        setSelectedForSwap([...selectedForSwap, cat]);
      }
    }
  };

  const actualizarCategorias = async (pagina) => {
    try {
      navigate("/perfil/permiso/categorias");
      const res = await axios.get("/api/categorias/conCantidad", {
        params,
      });

      if (location.pathname !== "/perfil/permiso/categorias") {
        navigate({
          pathname: "/perfil/permiso/categorias",
          search: `?params=${params}`,
        });
      } else {
        setSearchParams({ params });
      }
      setSiguiente(true);
      setAnterior(true);
      if (res.data.count / cantidad - pagina > 0) setSiguiente(false);
      if (pagina > 1) setAnterior(false);
      setCategorias(res.data.data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const eliminarCategoria = async (e, cat) => {
    e.stopPropagation();
    try {
      const confirmar = window.confirm(
        `¿Estás seguro de que quieres eliminar la categoría "${cat.nombre}"?`
      );
      if (!confirmar) {
        // Usuario canceló, salgo de la función
        return;
      }

      await axios.delete(`/api/categorias/${cat.id}`);
      actualizarCategorias(paginaActual);

      setSelectedForSwap([]);
      setMessage("Categoria eliminada");
      setTypeMessage("exito");
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      setMessage("Error el eliminar");
      setTypeMessage("error");
    }
  };

  const intercambiarCategorias = async () => {
    if (selectedForSwap.length !== 2) {
      alert("Selecciona exactamente dos categorías para intercambiar.");
      return;
    }
    const [cat1, cat2] = selectedForSwap;
    try {
      await axios.post("/api/categorias/reemplazar", {
        primer: cat1.id,
        segundo: cat2.id,
      });
      setMessage("Se intercambiaron");
      setTypeMessage("exito");
    } catch (err) {
      console.error(err);
      setMessage("Error el intercambiar");
      setTypeMessage("error");
    }

    actualizarCategorias(paginaActual);

    setSelectedForSwap([]);
  };

  const agregarCategoria = async () => {
    const catTrimmed = nuevaCategoria.trim();

    if (!catTrimmed) return alert("Ingresa un nombre válido");
    if (categorias && categorias.includes(catTrimmed))
      return alert("Categoría ya existe");

    try {
      await axios.post("/api/categorias", { nombre: catTrimmed });
      actualizarCategorias(paginaActual);
      toggleSelect();
      setSelectedForSwap([]);
      setNuevaCategoria("");
      setMessage("Categoria agregada");
      setTypeMessage("exito");
    } catch (error) {
      setMessage("Error:" + error);
      setTypeMessage("error");
    }
  };

  const cambiarpagina = async (pagina) => {
    params.delete("paginaActual");
    params.append("paginaActual", pagina);

    actualizarCategorias(pagina);
  };

  return (
    <>
      <div className="categorias-container">
        {/* Izquierda: controles intercambio y agregar */}
        <div className="controles">
          {permisos?.edcategoria === true && (
            <>
              <h3>Intercambiar Categorías</h3>
              <br />
              <button
                className="btn-intercambiar"
                onClick={intercambiarCategorias}
                disabled={selectedForSwap.length !== 2}
                title={
                  selectedForSwap.length !== 2
                    ? "Selecciona exactamente dos categorías"
                    : "Intercambiar categorías seleccionadas"
                }
              >
                Intercambiar categorías
              </button>
            </>
          )}
          <br />
          <br />
          {permisos?.agcategoria === true && (
            <>
              <h3>Agregar nueva categoría</h3>
              <br />
              <input
                type="text"
                placeholder="Nombre de categoría"
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                required
              />
              <button className="btn-agregar-cat" onClick={agregarCategoria}>
                Agregar Categoría
              </button>
            </>
          )}
        </div>

        {/* Derecha: listado de categorías */}
        <div className="listado">
          <div className="div-intercambio">
            <h3>Categorías</h3>
            {selectedForSwap.length !== 0 && (
              <button
                onClick={() => {
                  setSelectedForSwap([]);
                }}
              >
                Limpiar
              </button>
            )}
          </div>
          <br />
          <p>
            Se intercambiaran las realciones:{" "}
            {selectedForSwap.length === 0
              ? "Sin seleccionar"
              : selectedForSwap.map((p) => `"${p.nombre}"`).join(" hacia ")}
          </p>
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

          <ul>
            {categorias?.map((cat) => (
              <li
                key={cat.nombre}
                className={
                  selectedForSwap.some((selected) => selected.id === cat.id)
                    ? "selected"
                    : "no-selected"
                }
                onClick={() => toggleSelect(cat)}
                title="Click para seleccionar para intercambio"
              >
                {cat.nombre}
                <div className="accion-categoria">
                  <p className="p-categoria">{cat.archivoCount}</p>
                  {permisos?.elcategoria === true && (
                    <button
                      onClick={(e) => eliminarCategoria(e, cat)}
                      className="btn-eliminar"
                      title=""
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
