const express = require("express");
const router = express.Router();
const db = require("../models");

async function obtenerPermisos(id) {
  try {
    const permisos = await db.Permiso.findOne({
      include: [
        {
          model: db.Usuario,
          where: id,
        },
      ],
    });

    return permisos;
  } catch (error) {
    console.error("Error al obtener los permisos:", error);
  }
}

// Crear una nuevo permiso
router.post("/", async (req, res) => {
  try {
    const permisos = await obtenerPermisos(req.usuarioId);
    const permitido = permisos.agpermiso;
    if (permitido) {
      const { nombre } = req.body;
      await db.Permiso.create({ nombre });
      res.status(201).send({ message: "Nuevo permiso creado" });
    } else {
      throw new Error("No se tiene permisos suficientes");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lista Permisos
router.get("/", async (req, res) => {
  try {
    const permisos = await obtenerPermisos(req.usuarioId);
    const permitido = permisos.verpermiso;
    if (permitido) {
      const permisos = await db.Permiso.findAll({});

      res.status(201).json(permisos);
    } else {
      throw new Error("No se tiene permisos suficientes");
    }
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

// Edita Permisos
router.post("/update", async (req, res) => {
  try {
    const permisos = await obtenerPermisos(req.usuarioId);
    const permitido = permisos.edpermiso;
    if (permitido) {
      const {
        id,
        vercategoria,
        agcategoria,
        edcategoria,
        elcategoria,
        verarchivo,
        agarchivo,
        edarchivo,
        elarchivo,
        registrar,
        verusuario,
        agusuario,
        edusuario,
        elusuario,
        resusuario,
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
          agarchivo,
          edarchivo,
          elarchivo,
          registrar,
          verusuario,
          agusuario,
          edusuario,
          elusuario,
          resusuario,
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
    } else {
      throw new Error("No se tiene permisos suficientes");
    }
  } catch (error) {
    console.error("Error al actualizar:", error);
  }
  res.status(204);
});

// Eliminar Permisos
router.delete("/:id", async (req, res) => {
  try {
    const permisos = await obtenerPermisos(req.usuarioId);
    const permitido = permisos.elpermiso;
    if (permitido) {
      const permiso = await db.Permiso.findByPk(req.params.id);
      if (!permiso)
        return res.status(404).json({ error: "Permiso no encontrado" });

      await permiso.destroy();
      res.status(200).send();
    } else {
      throw new Error("No se tiene permisos suficientes");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
