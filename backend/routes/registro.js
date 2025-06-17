const express = require("express");
const router = express.Router();
const db = require("../models");

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

router.get("/registros/:id", async (req, res, next) => {
  const permisos = await obtenerPermisos(req.usuarioId);
  const permitido = permisos.verlogs;
  if (permitido) {
    return next(); // Continúa con el siguiente
  } else {
    return res
      .status(401)
      .json({ message: "No se tiene permisos suficientes" });
  }
});

router.get("/registros/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const registros = await db.Registro.findAll({
      where: {
        log_id: id,
      },
    });
    res.json(registros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
