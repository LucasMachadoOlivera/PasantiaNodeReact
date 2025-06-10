const express = require("express");
const router = express.Router();
const path = require("path");
const db = require("../models");
const fs = require("fs");

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const usuario_id = req.user.id;
    const ruta = path.join("uploads", id);
    const file = await db.File.findOne({
      where: {
        archivo: ruta,
      },
    });
    const variable = await db.FilePermission.findOne({
      attributes: ["permiso"],

      where: {
        file_id: file.id,
        usuario_id: usuario_id,
      },
    });

    if (
      file.usuario_id === usuario_id ||
      variable !== null ||
      file.estado == "Publico"
    ) {
      const filePath = path.join(__dirname, "..", "uploads", id);

      // Verifica que el archivo exista antes de enviarlo
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
      } else {
        res.status(404).send("Imagen no encontrada");
      }
    }
  } catch (error) {
    console.error("Error al procesar a URL:", error);
    res.status(500).json({ error: "Hubo un error al procesar a URL" });
  }
});

router.get("/mini/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const ruta = path.join("thumbnails", id);
    const usuario_id = req.user.id;

    const file = await db.File.findOne({
      where: {
        miniatura: ruta,
      },
    });

    const variable = await db.FilePermission.findOne({
      attributes: ["permiso"],

      where: {
        file_id: file.id,
        usuario_id: usuario_id,
      },
    });

    if (
      file.usuario_id === usuario_id ||
      variable !== null ||
      file.estado == "Publico"
    ) {
      const filePath = path.join(__dirname, "..", "thumbnails", id);

      if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
      } else {
        res.status(404).send("Miniatura no encontrado");
      }
    }
  } catch (error) {
    console.error("Error al procesar la URL:", error);
    res.status(500).json({ error: "Hubo un error al procesar la URL" });
  }
});

module.exports = router;
