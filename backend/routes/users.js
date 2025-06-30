const express = require("express");
const router = express.Router();
const db = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

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

//Listar un usuario segun email
router.get("/buscar/:email", async (req, res) => {
  try {
    let indiceEliminar = -1;
    const email = req.params.email;

    const where = {};

    if (email) {
      where.email = { [Op.like]: `%${email}%` };
    }

    const usuarios = await db.Usuario.findAll({
      limit: 3,
      where: where,
    });
    indiceEliminar = usuarios.findIndex(
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

router.get("/", async (req, res, next) => {
  const permisos = await obtenerPermisos(req.usuarioId);
  const permitido = permisos.verusuario;
  if (permitido) {
    next(); // Continúa con el siguiente
  } else {
    return res
      .status(401)
      .json({ message: "No se tiene permisos suficientes" });
  }
});

//Listar los usuarios
router.get("/", async (req, res) => {
  try {
    const size = parseInt(req.query.cantidad);
    const offset = (parseInt(req.query.paginaActual) - 1) * size;
    const limit = size;

    const usuarios = await db.Usuario.findAndCountAll({
      attributes: ["id", "nombre", "email", "permiso_id"],
      include: [
        {
          model: db.Permiso,
          attributes: ["id", "nombre"],
        },
      ],
      limit,
      offset,
      distinct: true,
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "No se pudo obtener la lista de usuarios" });
  }
});

router.delete("/:id", async (req, res, next) => {
  const permisos = await obtenerPermisos(req.usuarioId);
  const permitido = permisos.elusuario;

  if (permitido && req.usuarioId != req.params.id) {
    next(); // Continúa con el siguiente
  } else {
    return res
      .status(401)
      .json({ message: "No se tiene permisos suficientes" });
  }
});

//Eliminar un usuario por ID
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const usuario = await db.Usuario.findByPk(id);

    if (!usuario) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    if (usuario.permiso_id === 1) {
      if (req.user.permiso_id !== 1) {
        return res
          .status(401)
          .json({ error: "No se tiene permisos suficientes, es Admin." });
      }
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
  } catch (error) {
    res
      .status(500)
      .json({ error: "No se pudo eliminar", detalles: error.message });
  }
});

router.put("/archivo/:user/:file/:permiso", async (req, res, next) => {
  const permisos = await obtenerPermisos(req.usuarioId);

  const permitido = permisos.edarchivo;

  if (permitido) {
    return next(); // Continúa con el siguiente
  } else {
    const file = await db.File.findByPk(req.params.file, {
      include: [
        {
          model: db.Usuario,
          as: "UsuariosConAcceso",
          through: { attributes: ["file_id", "permiso", "usuario_id"] },
          attributes: ["id"],
        },
      ],
    });

    for (const nombre of file.UsuariosConAcceso) {
      if (
        nombre.File_usuario.usuario_id == req.usuarioId &&
        nombre.File_usuario.permiso == "Editor" &&
        req.params.user !== req.usuarioId
      ) {
        return next();
      }
    }

    if (file.usuario_id == req.usuarioId) {
      return next();
    } else {
      return res
        .status(401)
        .json({ message: "No se tiene permisos suficientes" });
    }
  }
});

//Actualizar relacion usuario con archivo, compartir un archivo
router.put("/archivo/:user/:file/:permiso", async (req, res) => {
  try {
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

    res.json(usuario);
  } catch (error) {
    res
      .status(500)
      .json({ error: "No se pudo compartir", detalles: error.message });
  }
});

router.put("/:id", async (req, res, next) => {
  const permisos = await obtenerPermisos(req.usuarioId);
  const permitido = permisos.edusuario;

  if (permitido) {
    return next(); // Continúa con el siguiente
  }
  if (req.params.id == req.usuarioId) {
    return next();
  }

  return res.status(401).json({ message: "No se tiene permisos suficientes" });
});

//Actualizar un usuario por ID
router.put("/:id", async (req, res) => {
  try {
    const usuario_id = req.usuarioId;

    const { nombre, rol, contraseña } = req.body;
    const id = req.params.id;
    const usuario = await db.Usuario.findByPk(id);
    let guardar = false;

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (nombre && nombre != usuario.nombre) {
      if (nombre.length > 3) {
        usuario.nombre = nombre;
        guardar = true;
      } else {
        return res.status(401).json({ message: "Nombre invalida" });
      }
    }

    if (rol && rol != usuario.permiso_id) {
      if (usuario_id == id) {
        return res
          .status(404)
          .json({ error: "No se puede editar el propio Rol." });
      }
      if (usuario.permiso_id === 1) {
        if (req.user.permiso_id != 1) {
          return res
            .status(404)
            .json({ error: "No se tiene permisos suficientes, es Admin." });
        }
      }
      if (rol === 1 && req.user.permiso_id != 1) {
        return res
          .status(404)
          .json({ error: "No se tiene permisos suficientes, es Admin." });
      }
      usuario.permiso_id = rol;
      guardar = true;
    }

    if (contraseña && id == req.usuarioId) {
      if (contraseña.length > 6) {
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        usuario.contraseña = hashedPassword;
        guardar = true;
      } else {
        return res.status(401).json({ message: "Contraseña invalida" });
      }
    }

    if (guardar) {
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
      return res.json(usuario);
    }
    res.status(401).json({ error: "No hay datos" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "No se pudo actualizar", detalles: error.message });
  }
});

module.exports = router;
