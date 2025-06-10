const express = require("express");
const router = express.Router();
const db = require("../models");
const { Op } = require("sequelize");

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

//Listar un usuario segun email
router.get("/buscar/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const where = {};

    if (email) {
      where.email = { [Op.like]: `%${email}%` };
    }

    const usuarios = await db.Usuario.findAll({
      where: where,
    });

    const indiceEliminar = usuarios.findIndex(
      (user) => user.email === req.usuarioEmail
    );

    if (indiceEliminar !== -1) {
      usuarios.splice(indiceEliminar, 1);
    }

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "No se pudo obtener el usuario" });
  }
});

//Listar los usuarios
router.get("/", async (req, res) => {
  try {
    console.log("listado 1");
    const permisos = await obtenerPermisos(req.usuarioId);
    console.log("listado 1.2");
    const permitido = permisos.verusuario;
    console.log("listado 2");
    if (permitido) {
      console.log("listado 3");
      const usuarios = await db.Usuario.findAll({
        include: [
          {
            model: db.Permiso,
          },
        ],
      });
      console.log("listado 4", usuarios);
      res.json(usuarios);
    } else {
      throw new Error("No se tiene permisos suficientes");
    }
  } catch (error) {
    res.status(500).json({ error: "No se pudo obtener la lista de usuarios" });
  }
});

//Eliminar un usuario por ID
router.delete("/:id", async (req, res) => {
  try {
    const permisos = await obtenerPermisos(req.usuarioId);
    const permitido = permisos.elusuario;
    if (permitido) {
      const id = req.params.id;
      const usuario = await db.Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      db.Registro.create({
        usuario: req.usuarioId,
        accion:
          "El usuario: " +
          req.usuarioNombre +
          ", elimino el usuario con el id: " +
          usuario.id +
          ", llamado " +
          usuario.nombre,
      });
      await usuario.destroy();
      res.json({ mensaje: "Usuario eliminado" });
    } else {
      throw new Error("No se tiene permisos suficientes");
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "No se pudo eliminar", detalles: error.message });
  }
});

//Actualizar un usuario por ID
router.put("/:id", async (req, res) => {
  try {
    const permisos = await obtenerPermisos(req.usuarioId);
    const permitido = permisos.edusuario;
    if (permitido) {
      const { nombre, email, contraseña, rol } = req.body;
      const id = req.params.id;
      const usuario = await db.Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      if (nombre) {
        usuario.nombre = nombre;
      }
      if (email) {
        usuario.email = email;
      }
      if (rol) {
        usuario.permiso_id = rol;
      }
      if (contraseña) {
        usuario.contraseña = contraseña;
      }

      await usuario.save();
      db.Registro.create({
        usuario: req.usuarioId,
        accion:
          "El usuario: " +
          req.usuarioNombre +
          ", actualizo el usuario con el id: " +
          usuario.id +
          ", llamado " +
          usuario.nombre,
      });
      res.json(usuario);
    } else {
      throw new Error("No se tiene permisos suficientes");
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "No se pudo actualizar", detalles: error.message });
  }
});

//Actualizar relacion usuario con archivo
router.put("archivo/:user/:file/:permiso", async (req, res) => {
  try {
    const permisos = await obtenerPermisos(req.usuarioId);
    const permitido = permisos.edusuario;
    if (permitido) {
      const { nombre, email, contraseña, rol } = req.body;
      const user = req.params.user;
      const file = req.params.file;
      const permiso = req.params.permiso;
      const usuario = await db.Usuario.findByPk(user);

      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const archivo = await db.File.findByPk(file);

      if (!archivo) {
        return res.status(404).json({ error: "Archivo no encontrado" });
      }

      await usuario.addFilesCompartidos(archivo, {
        through: { permiso: permiso },
      });

      db.Registro.create({
        usuario: req.usuarioId,
        accion:
          "El usuario: " +
          req.usuarioNombre +
          ", compartio el archivo " +
          archivo.id +
          ", llamado " +
          archivo.nombre +
          " a " +
          usuario.id,
      });
      res.json(usuario);
    } else {
      throw new Error("No se tiene permisos suficientes");
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "No se pudo compartir", detalles: error.message });
  }
});

module.exports = router;
