const express = require("express");
const db = require("../models");
const router = express.Router();

async function obtenerPermisos(id) {
  try {
    const permisos = await db.Permiso.findOne({
      include: [
        {
          model: db.Usuario,
          where: { id },
        },
      ],
    });

    return permisos;
  } catch (error) {
    console.error("Error al obtener los permisos:", error);
  }
}

router.post("/", async (req, res, next) => {
  const permisos = await obtenerPermisos(req.usuarioId);
  const permitido = permisos.agcategoria;
  if (permitido) {
    if (req.body.nombre.length > 3) {
      return next(); // Continúa con el siguiente
    }
  }
  return res.status(401).json({ message: "No se tiene permisos suficientes" });
});

// Crear una nueva categoría
router.post("/", async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las categorías
router.get("/", async (req, res) => {
  try {
    const categorias = await db.Categoria.findAll({
      attributes: ["id", "nombre"],
    });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/conCantidad", async (req, res, next) => {
  const permisos = await obtenerPermisos(req.usuarioId);
  const permitido = permisos.vercategoria;
  if (permitido) {
    next(); // Continúa con el siguiente
  } else {
    return res
      .status(401)
      .json({ message: "No se tiene permisos suficientes" });
  }
});

// Obtener todas las categorías con la cantidad de archivos en total
router.get("/conCantidad", async (req, res) => {
  try {
    const size = parseInt(req.query.cantidad);
    const offset = (parseInt(req.query.paginaActual) - 1) * size;
    const limit = size;

    const countCategorias = await db.Categoria.findAll({
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

    const count = countCategorias.length;

    const categoriasPaginadas = await db.Categoria.findAll({
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
      limit,
      offset,
      subQuery: false,
      raw: true,
    });

    const data = categoriasPaginadas.map((categoria) => ({
      ...categoria,
      archivoCount: Number(categoria.archivoCount),
    }));

    res.json({
      count,
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res, next) => {
  const permisos = await obtenerPermisos(req.usuarioId);
  const permitido = permisos.elcategoria;
  if (permitido) {
    next(); // Continúa con el siguiente
  } else {
    return res
      .status(401)
      .json({ message: "No se tiene permisos suficientes" });
  }
});

// Eliminar una categoría
router.delete("/:id", async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/reemplazar", async (req, res, next) => {
  const permisos = await obtenerPermisos(req.usuarioId);
  const permitido = permisos.edcategoria;
  if (permitido) {
    next(); // Continúa con el siguiente
  } else {
    return res
      .status(401)
      .json({ message: "No se tiene permisos suficientes" });
  }
});

//Los datos del primero se cambian al segundo, en cuestion de relaciones
router.post("/reemplazar", async (req, res) => {
  try {
    const fromCatId = req.body.primer;
    const toCatId = req.body.segundo;

    const categoria = await db.Categoria.findByPk(fromCatId);
    const cat = await categoria.getFiles();

    if (!cat) return res.status(404).json({ error: "Categoría no encontrada" });

    const categorias = await db.Categoria.findByPk(fromCatId);
    const files = await categorias.getFiles();

    await categorias.removeFiles(files);

    const toCat = await db.Categoria.findByPk(toCatId);
    await toCat.addFiles(files);

    res
      .status(204)
      .json({ message: "Categorias intercambiadas correctamentes." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
