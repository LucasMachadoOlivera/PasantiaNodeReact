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

  return (
    <>
      <div className="list-container">
        {data.map((doc) => (
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
              <p className="archivo-descripcion">{doc.descripcion}</p>
            </div>

            <div className="list-item-buttons">
              {doc.tipo !== "zip" && (
                <button
                  type="button"
                  onClick={() => {
                    abrirMedia(urlVer(doc.archivo));
                  }}
                >
                  Visualizar
                </button>
              )}
              <a href={urlDescargar(doc.archivo)}>
                <button>Descargar</button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
