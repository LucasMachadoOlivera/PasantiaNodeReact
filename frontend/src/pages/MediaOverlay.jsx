import React from "react";
import "../assets/MediaOverlay.css";

const getFileType = (url) => {
  const extension = url.split(".").pop().toLowerCase();

  if (["mp4", "webm", "ogg"].includes(extension)) return "video";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) return "image";
  if (["pdf", "docx", "doc"].includes(extension)) return "file";

  return "unknown";
};

const MediaOverlay = ({ url, onClose }) => {
  if (!url) return null;
  const type = getFileType(url);

  // Esta función evita que el clic en el contenido cierre el overlay
  const onContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="media-overlay" onClick={onClose}>
      <button className="close-button" onClick={onClose}>
        Cerrar
      </button>

      <div className="media-container" onClick={onContentClick}>
        {type === "video" && (
          <video
            src={url}
            controls
            autoPlay
            style={{
              maxWidth: "100vw",
              maxHeight: "100vh",
              objectFit: "contain",
            }}
          />
        )}

        {type === "image" && (
          <img
            src={url}
            alt="media"
            style={{
              maxWidth: "100vw",
              maxHeight: "100vh",
              objectFit: "contain",
            }}
          />
        )}

        {type === "file" && (
          <iframe
            src={url}
            title="file"
            style={{ width: "100vw", height: "100vh", border: "none" }}
          />
        )}

        {type === "unknown" && <p>Tipo de archivo no compatible.</p>}
      </div>
    </div>
  );
};

export default MediaOverlay;
