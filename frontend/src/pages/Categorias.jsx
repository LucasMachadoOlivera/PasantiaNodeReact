import React, { useEffect, useState } from "react";
import "../assets/Categorias.css";
import axios from "./../components/axiosConfig";

export default function Categorias(categorias1) {
  const [categorias, setCategorias] = useState(
    categorias1.categorias1.map(({ id, nombre, archivoCount }) => ({
      id,
      nombre,
      archivoCount,
    }))
  );
  const [permisos, setPermisos] = useState({
    vercategoria: "",
    agcategoria: "",
    edcategoria: "",
    elcategoria: "",
    verarchivo: "",
    agarchivo: "",
    edarchivo: "",
    elarchivo: "",
    registrar: "",
    verusuario: "",
    agusuario: "",
    edusuario: "",
    elusuario: "",
    verpermiso: "",
    edpermiso: "",
    elpermiso: "",
    verlog: "",
  });

  const [selectedForSwap, setSelectedForSwap] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");

  useEffect(() => {
    // Obtener información de usuario
    obtenerPermisos();
  }, []);

  const toggleSelect = (cat) => {
    if (selectedForSwap.includes(cat)) {
      setSelectedForSwap(selectedForSwap.filter((c) => c !== cat));
    } else {
      if (selectedForSwap.length < 2) {
        setSelectedForSwap([...selectedForSwap, cat]);
      }
    }
  };

  const obtenerPermisos = async () => {
    try {
      const response = await axios.get("/api/permisos/usuario");
      setPermisos(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const actualizarCategorias = async () => {
    try {
      const res = await axios.get("/api/categorias/conCantidad");

      setCategorias(res.data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const eliminarCategoria = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/categorias/${id}`);

      actualizarCategorias();

      setSelectedForSwap([]);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const intercambiarCategorias = async () => {
    if (selectedForSwap.length !== 2) {
      alert("Selecciona exactamente dos categorías para intercambiar.");
      return;
    }
    const [cat1, cat2] = selectedForSwap;

    await axios.post("/api/categorias/reemplazar", {
      primer: cat1.id,
      segundo: cat2.id,
    });

    actualizarCategorias();

    /*

    if (idx1 === -1 || idx2 === -1) return;

    const nuevasCategorias = [...categorias];
    nuevasCategorias[idx1] = cat2;
    nuevasCategorias[idx2] = cat1;

    setCategorias(nuevasCategorias);*/
    setSelectedForSwap([]);
  };

  const agregarCategoria = async () => {
    const catTrimmed = nuevaCategoria.trim();
    if (!catTrimmed) return alert("Ingresa un nombre válido");
    if (categorias.includes(catTrimmed)) return alert("Categoría ya existe");

    try {
      await axios.post("/api/categorias", { nombre: catTrimmed });
      actualizarCategorias();
      toggleSelect();
      setCategorias([...categorias, catTrimmed]);
      setSelectedForSwap([]);
      setNuevaCategoria("");
    } catch (error) {
      alert(error);
    }
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
              <button className="btn-agregar" onClick={agregarCategoria}>
                Agregar Categoría
              </button>
            </>
          )}
        </div>

        {/* Derecha: listado de categorías */}
        <div className="listado">
          <h3>Categorías</h3>
          <br />
          <p>
            Se intercambiaran las realciones de:{" "}
            {selectedForSwap.length === 0
              ? "Ninguna"
              : selectedForSwap.map((p) => p.nombre).join(" hacia ")}
          </p>
          <br />
          <ul>
            {categorias.map((cat) => (
              <li
                key={cat.nombre}
                className={
                  selectedForSwap.includes(cat) ? "selected" : "no-selected"
                }
                onClick={() => toggleSelect(cat)}
                title="Click para seleccionar para intercambio"
              >
                {cat.nombre}
                <div className="accion-categoria">
                  <p className="p-categoria">{cat.archivoCount}</p>
                  {permisos?.elcategoria === true && (
                    <button
                      onClick={(e) => eliminarCategoria(e, cat.id)}
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
