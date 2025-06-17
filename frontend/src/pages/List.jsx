import React, { useState, useEffect } from "react";
import "../assets/List.css";

export default function List({ data, abrirMedia }) {
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

  useEffect(() => {
    setPaginaActual(1);
  }, [data]);

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

  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 25;

  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const indiceFin = indiceInicio + elementosPorPagina;
  const usuariosAMostrar = data.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(data.length / elementosPorPagina);

  return (
    <>
      <div className="div-paginar">
        {Array.from({ length: totalPaginas }, (_, i) => (
          <button
            key={i}
            onClick={() => setPaginaActual(i + 1)}
            disabled={paginaActual === i + 1}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <br />
      <div className="list-container">
        {usuariosAMostrar.map((doc) => (
          <div key={doc.id} className="list-item">
            <img
              src={urlImagen(doc.miniatura)}
              alt={doc.nombre}
              onError={(e) => {
                e.target.onerror = null; // previene bucle
                e.target.src = "/no-image.png";
              }}
              className="list-item-image"
            />

            <div className="list-item-details">
              <span>
                <strong>Título:</strong> {doc.nombre}
              </span>
              <span>
                <strong>Tipo:</strong> {doc.tipo}
              </span>
              <span>
                <strong>Fecha:</strong> {formatearFecha(doc.fecha)}
              </span>
              <span>
                <strong>Autor:</strong> {doc.Usuario.nombre}
              </span>

              <div>
                <span>
                  <strong>
                    Categorías: <strong />
                  </strong>
                </span>
                {doc.Categoria && doc.Categoria.length > 0 ? (
                  doc.Categoria.map((cat) => (
                    <span key={cat.id} className="category-badge">
                      {cat.nombre}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="no-categories">Sin categoría</span>
                  </>
                )}
              </div>

              <p
                style={{
                  marginTop: "0.5rem",
                  fontStyle: "italic",
                  color: "#555",
                }}
              >
                {doc.descripcion}
              </p>
            </div>

            <div className="list-item-buttons">
              {doc.tipo !== "zip" && (
                <button
                  type="button"
                  onClick={() => abrirMedia(urlVer(doc.archivo))}
                >
                  Visualizar
                </button>
              )}
              <a href={urlDescargar(doc.archivo)} download="ejemplo.pdf">
                <button>Descargar</button>
              </a>
            </div>
          </div>
        ))}
      </div>
      <div className="div-paginar">
        {Array.from({ length: totalPaginas }, (_, i) => (
          <button
            key={i}
            onClick={() => setPaginaActual(i + 1)}
            disabled={paginaActual === i + 1}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </>
  );
}
