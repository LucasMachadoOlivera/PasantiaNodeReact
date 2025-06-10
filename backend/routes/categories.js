const express = require("express");
const db = require("../models");
const router = express.Router();

async function obtenerRegistros(id) {
  try {
    const registros = await db.Permiso.findOne({
      include: [
        {
          model: db.Usuario,
          where: id,
        },
      ],
    });

    return registros;
  } catch (error) {
    console.error("Error al obtener usuarios con posts:", error);
  }
}

// Crear una nueva categoría
router.post("/", async (req, res) => {
  try {
    const permisos = await obtenerRegistros(req.usuarioId);
    const permitido = permisos.agcategoria;
    if (permitido) {
      const { nombre } = req.body;
      const nuevaCategoria = await db.Categoria.create({ nombre });
      res.status(201).json(nuevaCategoria);
      db.Registro.create({
        usuario: req.usuarioId,
        accion:
          "El usuario: " +
          req.usuarioNombre +
          ", creo la nueva categoria con el id: " +
          nuevaCategoria.id +
          ", llamada " +
          nuevaCategoria.nombre,
      });
    } else {
      throw new Error("No se tiene permisos suficientes");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las categorías
router.get("/", async (req, res) => {
  try {
    const categorias = await db.Categoria.findAll();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las categorías con la cantidad de archivos en total
router.get("/conCantidad", async (req, res) => {
  try {
    const permisos = await obtenerRegistros(req.usuarioId);
    const permitido = permisos.vercategoria;
    if (permitido) {
      const categorias = await db.Categoria.findAll({
        attributes: [
          "id",
          "nombre",
          [
            db.Sequelize.fn("COUNT", db.Sequelize.col("Files.id")),
            "archivoCount",
          ],
        ],
        include: [
          {
            model: db.File,
            attributes: [],
            through: { attributes: [] },
          },
        ],
        group: ["Categoria.id"],
        raw: true,
      });
      res.json(categorias);
    } else {
      throw new Error("No se tiene permisos suficientes");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar una categoría
router.put("/:id", async (req, res) => {
  try {
    const permisos = await obtenerRegistros(req.usuarioId);
    const permitido = permisos.edcategoria;
    if (permitido) {
      const { nombre } = req.body;
      const categoria = await db.Categoria.findByPk(req.params.id);
      if (!categoria)
        return res.status(404).json({ error: "Categoría no encontrada" });

      categoria.nombre = nombre || categoria.nombre;
      await categoria.save();
      res.json(categoria);
    } else {
      throw new Error("No se tiene permisos suficientes");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una categoría
router.delete("/:id", async (req, res) => {
  try {
    const permisos = await obtenerRegistros(req.usuarioId);
    const permitido = permisos.elcategoria;
    if (permitido) {
      const categoria = await db.Categoria.findByPk(req.params.id);
      if (!categoria)
        return res.status(404).json({ error: "Categoría no encontrada" });
      db.Registro.create({
        usuario: req.usuarioId,
        accion:
          "El usuario: " +
          req.usuarioNombre +
          ", elimino la categoria con el id: " +
          categoria.id +
          ", llamada " +
          categoria.nombre,
      });
      await categoria.destroy();
      res.status(200).send();
    } else {
      throw new Error("No se tiene permisos suficientes");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Los datos del primero se cambian al segundo, en cuestion de relaciones
router.post("/reemplazar", async (req, res) => {
  try {
    const permisos = await obtenerRegistros(req.usuarioId);
    const permitido = permisos.edcategoria;
    if (permitido) {
      const fromCatId = req.body.primer;
      const toCatId = req.body.segundo;

      const categoria = await db.Categoria.findByPk(fromCatId);
      const cat = await categoria.getFiles();

      if (!cat)
        return res.status(404).json({ error: "Categoría no encontrada" });

      const categorias = await db.Categoria.findByPk(fromCatId);
      const files = await categorias.getFiles();

      await categorias.removeFiles(files);

      const toCat = await db.Categoria.findByPk(toCatId);
      await toCat.addFiles(files);

      res
        .status(204)
        .json({ message: "Categorias intercambiadas correctamentes." });
    } else {
      throw new Error("No se tiene permisos suficientes");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
