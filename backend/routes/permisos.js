const express = require("express");
const router = express.Router();
const db = require("../models");
const User = require("../models/User");

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
  const permitido = permisos.agpermiso;
  if (permitido) {
    return next(); // Continúa con el siguiente
  } else {
    return res
      .status(401)
      .json({ message: "No se tiene permisos suficientes" });
  }
});

// Crear una nuevo permiso
router.post("/", async (req, res) => {
  try {
    const { nombre } = req.body;
    if (nombre.length < 3)
      return res.status(401).json({ message: "Nombre no valido." });
    await db.Permiso.create({ nombre });
    res.status(201).send({ message: "Nuevo permiso creado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res, next) => {
  const permisos = await obtenerPermisos(req.usuarioId);
  const permitido = permisos.verpermiso;
  if (permitido) {
    return next(); // Continúa con el siguiente
  } else {
    return res
      .status(401)
      .json({ message: "No se tiene permisos suficientes" });
  }
});

// Lista Permisos
router.get("/", async (req, res) => {
  try {
    const permisos = await db.Permiso.findAll({});

    res.status(201).json(permisos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lista Permiso del usuario
router.get("/usuario", async (req, res) => {
  try {
    const id = req.usuarioId;
    const permisos = await db.Permiso.findOne({
      include: [
        {
          model: db.Usuario,
          where: { id: id },
        },
      ],
    });
    res.status(201).json(permisos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/update", async (req, res, next) => {
  const permisos = await obtenerPermisos(req.usuarioId);
  const permitido = permisos.edpermiso;
  if (permitido) {
    if (req.body.id == 1) {
      return res.status(401).json({ message: "No se puede editar el permiso" });
    } else {
      return next(); // Continúa con el siguiente
    }
  } else {
    return res
      .status(401)
      .json({ message: "No se tiene permisos suficientes" });
  }
});

// Edita Permisos
router.post("/update", async (req, res) => {
  try {
    const {
      id,
      vercategoria,
      agcategoria,
      edcategoria,
      elcategoria,
      verarchivo,
      edarchivo,
      elarchivo,
      verusuario,
      agusuario,
      edusuario,
      elusuario,
      verpermiso,
      agpermiso,
      edpermiso,
      elpermiso,
      verlogs,
    } = req.body; // Datos del formulario (sin categorías)

    const filas = await db.Permiso.findByPk(id);
    await filas.update(
      {
        vercategoria,
        agcategoria,
        edcategoria,
        elcategoria,
        verarchivo,
        edarchivo,
        elarchivo,
        verusuario,
        agusuario,
        edusuario,
        elusuario,
        verpermiso,
        agpermiso,
        edpermiso,
        elpermiso,
        verlogs,
      },
      {
        where: { id },
      }
    );
    res.status(200).send();
  } catch (error) {
    console.error("Error al actualizar:", error);
  }
  res.status(204);
});

router.delete("/:id", async (req, res, next) => {
  const permisos = await obtenerPermisos(req.usuarioId);
  const permitido = permisos.elpermiso;
  if (permitido) {
    if (req.params.id == 1 || req.params.id == 2) {
      return res
        .status(401)
        .json({ message: "No se puede eliminar el permiso" });
    } else {
      return next();
    }
  } else {
    return res
      .status(401)
      .json({ message: "No se tiene permisos suficientes" });
  }
});

// Eliminar Permisos
router.delete("/:id", async (req, res) => {
  try {
    const where = {};
    where.permiso_id = req.params.id;
    await db.Usuario.update(
      { permiso_id: 2 }, //El permiso_id 2 es el Default
      { where: where }
    );

    const permiso = await db.Permiso.findByPk(req.params.id);
    if (!permiso)
      return res.status(404).json({ error: "Permiso no encontrado" });

    await permiso.destroy();
    res.status(200).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
