const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../models");
const fs = require("fs");

const { exec } = require("child_process");
const ffmpeg = require("fluent-ffmpeg");
const router = express.Router();
const { Op } = require("sequelize");

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

// Función para generar miniatura desde PDF
async function getMiniaturePDF(pdfPath) {
  const outputDir = path.resolve("thumbnails");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const baseName = path.basename(pdfPath, path.extname(pdfPath));
  const outputPrefix = path.join(outputDir, baseName + "-thumb");

  return new Promise((resolve, reject) => {
    const cmd = `pdftoppm -jpeg -f 1 -singlefile "${pdfPath}" "${outputPrefix}"`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(
          "Error al generar miniatura PDF:",
          stderr || error.message
        );
        reject(error);
        return;
      }

      const outputFilePath = outputPrefix + ".jpg";

      resolve(path.join("thumbnails", path.basename(outputFilePath)));
    });
  });
}

async function getMiniatureVideo(videoPath) {
  const baseName = path.basename(videoPath, path.extname(videoPath));

  const resolvedVideoPath = path.resolve(videoPath);
  const projectRoot = path.resolve(__dirname, "..");
  const thumbnailFolder = path.join(projectRoot, "thumbnails");
  const outputFilename = `${baseName}.png`;
  const outputPath = path.join(thumbnailFolder, outputFilename);
  const outputPath1 = path.join("thumbnails", outputFilename);

  // Asegurarse de que la carpeta de miniaturas exista
  if (!fs.existsSync(thumbnailFolder)) {
    fs.mkdirSync(thumbnailFolder, { recursive: true });
  }

  // Ejecutar FFmpeg para crear miniatura
  return new Promise((resolve, reject) => {
    ffmpeg(resolvedVideoPath)
      .on("end", () => {
        if (fs.existsSync(outputPath)) {
          const stats = fs.statSync(outputPath);
          if (stats.size > 0) {
            resolve(outputPath1); // Resuelve con la ruta local al archivo
          }
        }
      })
      .on("error", (err) => {
        console.error("Error generando miniatura:", err);
        reject(err);
      })
      .screenshots({
        count: 1,
        folder: thumbnailFolder,
        filename: outputFilename,
        size: "320x240",
        timemarks: ["1"], //Segundo en el video al que pertenece la miniatura
      });
  });
}

// Función para asegurar que el nombre del archivo sea único
function getUniqueFilename(originalName) {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext);

  // Generar un nombre único usando el timestamp
  const timestamp = Date.now();
  const uniqueName = `${base}-${timestamp}${ext}`;
  return uniqueName;
}

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Guardamos los archivos en el directorio "uploads"
  },
  filename: function (req, file, cb) {
    const uniqueName = getUniqueFilename(file.originalname);
    cb(null, uniqueName); // Usamos el nombre único para el archivo
  },
});

const upload = multer({ storage: storage });

// Ruta para subir los archivos individuales o grupales
router.post("/", upload.array("archivos"), async (req, res) => {
  try {
    const usuario_id = req.usuarioId;

    const { categorias } = req.body;
    const fecha = new Date();
    const archivos = req.files;

    for (let i = 0; i < archivos.length; i++) {
      const archivo = archivos[i];
      const nombre = path
        .basename(archivo.originalname)
        .slice(
          0,
          path.basename(archivo.originalname).length -
            path.extname(archivo.originalname).length
        );
      const tipo = path.extname(archivo.path).slice(1);
      let miniatura = "";

      //Metodo para guardar la miniatura
      const tiposPdf = ["pdf"];
      const tiposVideo = ["mp4", "avi", "mov", "mkv"];

      if (tiposPdf.includes(tipo)) {
        miniatura = await getMiniaturePDF(archivo.path);
      } else if (tiposVideo.includes(tipo)) {
        miniatura = await getMiniatureVideo(archivo.path);
      } else if (tipo == "zip") {
      } else {
        miniatura = archivo.path;
      }
      const estado = "Subiendo";
      const descripcion = req.body.descripcion;
      const arch = await db.File.create({
        miniatura,
        tipo,
        fecha,
        nombre,
        descripcion,
        usuario_id,
        estado,
        archivo: archivo.path,
      });

      if (categorias) {
        const catIds = Array.isArray(categorias)
          ? categorias
          : JSON.parse(categorias);
        await arch.addCategoria(catIds);
      }
    }
    res.json({
      message: "Formulario recibido correctamente",
    });
  } catch (error) {
    console.error("Error al procesar el formulario:", error);
    res.status(500).json({ error: "Hubo un error al procesar el formulario" });
  }
});

//Listar archivos para los usuarios de forma general...
router.get("/general", async (req, res) => {
  try {
    const size = parseInt(req.query.cantidad);
    const offset = (parseInt(req.query.paginaActual) - 1) * size;
    const limit = size;

    const files = await db.File.findAndCountAll({
      attributes: [
        "id",
        "archivo",
        "descripcion",
        "estado",
        "fecha",
        "miniatura",
        "nombre",
        "tipo",
      ],
      include: [
        {
          model: db.Usuario,
          attributes: ["nombre"],
        },
        {
          model: db.Categoria,
          attributes: ["id", "nombre"],
          through: { attributes: [] },
        },
      ],
      where: {
        estado: "Publico",
      },
      limit,
      offset,
      distinct: true,
    });
    res.json(files);
  } catch (error) {
    console.error("Error al obtener archivos:", error);
    res.status(500).json({ error: "Error al listar archivos" });
  }
});

//Listar archivos subidos por el usuario
router.get("/perfil", async (req, res) => {
  try {
    const size = parseInt(req.query.cantidad);
    const offset = (parseInt(req.query.paginaActual) - 1) * size;
    const limit = size;

    const usuario_id = req.usuarioId;
    const where = {};

    where.estado = {
      [Op.ne]: "Subiendo",
    };
    where.usuario_id = usuario_id;
    const files = await db.File.findAndCountAll({
      attributes: [
        "id",
        "archivo",
        "descripcion",
        "estado",
        "fecha",
        "miniatura",
        "nombre",
        "tipo",
      ],
      where: where,
      include: [
        {
          model: db.Usuario,
          as: "UsuariosConAcceso",
          through: { attributes: ["file_id", "permiso", "usuario_id"] },
          attributes: ["email"],
        },
        {
          model: db.Usuario,
          attributes: ["nombre"],
        },

        {
          model: db.Categoria,
          attributes: ["id", "nombre"],
          through: { attributes: [] },
        },
      ],
      limit,
      offset,
      distinct: true,
    });
    res.json(files);
  } catch (error) {
    console.error("Error al obtener archivos:", error);
    res.status(500).json({ error: "Error al listar archivos" });
  }
});

router.get("/todo", async (req, res, next) => {
  const permisos = await obtenerPermisos(req.usuarioId);
  const permitido = permisos.verarchivo;
  if (permitido) {
    return next(); // Continúa con el siguiente
  } else {
    return res
      .status(401)
      .json({ message: "No se tiene permisos suficientes" });
  }
});

//Listar todos los archivos publico, privado o subiendose - se requieren permisos
router.get("/todo", async (req, res) => {
  try {
    const size = parseInt(req.query.cantidad);
    const offset = (parseInt(req.query.paginaActual) - 1) * size;
    const limit = size;

    const usuario_id = req.usuarioId;

    const files = await db.File.findAndCountAll({
      attributes: [
        "id",
        "archivo",
        "descripcion",
        "estado",
        "fecha",
        "miniatura",
        "nombre",
        "tipo",
      ],
      include: [
        {
          model: db.Usuario,
          as: "UsuariosConAcceso",
          through: { attributes: ["file_id", "permiso", "usuario_id"] },
          attributes: ["email"],
        },
        {
          model: db.Usuario,
          attributes: ["nombre"],
        },

        {
          model: db.Categoria,
          attributes: ["id", "nombre"],
          through: { attributes: [] },
        },
      ],
      limit,
      offset,
      distinct: true,
    });
    res.json(files);
  } catch (error) {
    console.error("Error al obtener archivos:", error);
    res.status(500).json({ error: "Error al listar archivos" });
  }
});

//Listar los archivos compartidos al usuario
router.get("/perfil-compartido", async (req, res) => {
  try {
    const size = parseInt(req.query.cantidad);
    const offset = (parseInt(req.query.paginaActual) - 1) * size;
    const limit = size;

    const usuario_id = req.usuarioId;
    const files = await db.File.findAll({
      attributes: ["id"],
      include: [
        {
          model: db.Usuario,
          as: "UsuariosConAcceso",
          where: { id: usuario_id },
          through: { attributes: [] },
          attributes: [],
        },

        {
          model: db.Usuario,
          attributes: [],
        },

        {
          model: db.Categoria,
          through: { attributes: [] },
          attributes: [],
        },
      ],
    });

    ids = [];

    for (const file of files) {
      ids.push(file.id);
    }
    const files1 = await db.File.findAndCountAll({
      where: {
        id: ids,
      },
      attributes: [
        "id",
        "archivo",
        "descripcion",
        "estado",
        "fecha",
        "miniatura",
        "nombre",
        "tipo",
      ],
      include: [
        {
          model: db.Usuario,
          as: "UsuariosConAcceso",
          through: { attributes: ["file_id", "permiso", "usuario_id"] },
          attributes: ["email"],
        },

        {
          model: db.Usuario,
          attributes: ["nombre"],
        },

        {
          model: db.Categoria,
          attributes: ["id", "nombre"],
          through: { attributes: [] },
        },
      ],
      limit,
      offset,
      distinct: true,
    });

    res.json(files1);
  } catch (error) {
    console.error("Error al obtener files:", error);
    res.status(500).json({ error: "Error al listar files" });
  }
});

//Listar los archivos que el usuario esta subiendo
router.get("/revisando", async (req, res) => {
  const usuario_id = req.usuarioId;
  try {
    const files = await db.File.findAll({
      attributes: [
        "id",
        "archivo",
        "descripcion",
        "estado",
        "fecha",
        "miniatura",
        "nombre",
        "tipo",
      ],
      where: {
        estado: "Subiendo",
        usuario_id,
      },
      include: [
        {
          model: db.Usuario,
          attributes: ["nombre"],
        },
        {
          model: db.Categoria,
          attributes: ["id", "nombre"],
          through: { attributes: [] },
        },
      ],
    });
    res.json(files);
  } catch (error) {
    console.error("Error al obtener archivos:", error);
    res.status(500).json({ error: "Error al listar archivos" });
  }
});

router.get("/conAcceso/:id", async (req, res, next) => {
  const permisos = await obtenerPermisos(req.usuarioId);
  const permitido = permisos.edarchivo;
  if (permitido) {
    return next(); // Continúa con el siguiente
  } else {
    const file = await db.File.findByPk(req.params.id, {
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
        nombre.File_usuario.permiso == "Editor"
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

//Obtener informacion de un archivo que se esta subiendo
router.get("/conAcceso/:id", async (req, res) => {
  const usuario_id = req.usuarioId;
  try {
    const id = req.params.id;
    const where = {};
    where.id = id;
    const files = await db.File.findAll({
      where: where,
      include: [
        {
          model: db.Usuario,
          as: "UsuariosConAcceso",
          through: { attributes: ["file_id", "permiso", "usuario_id"] },
          attributes: ["email"],
        },
      ],
    });
    res.json(files);
  } catch (error) {
    console.error("Error al obtener archivos:", error);
    res.status(500).json({ error: "Error al listar archivos" });
  }
});

router.post("/update", async (req, res, next) => {
  const permisos = await obtenerPermisos(req.usuarioId);
  const permitido = permisos.edarchivo;
  if (permitido) {
    return next(); // Continúa con el siguiente
  } else {
    const file = await db.File.findByPk(req.body.id, {
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
        nombre.File_usuario.permiso == "Editor"
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

//Actualizar un archivo
router.post("/update", upload.none(), async (req, res) => {
  try {
    const usuario_id = req.usuarioId;

    const { id, nombre, descripcion, fecha, estado } = req.body;
    let categorias = req.body.Categoria;
    // let conAcceso = req.body.UsuariosConAcceso;

    try {
      const filas = await db.File.findByPk(id);
      await filas.update(
        {
          nombre,
          descripcion,
          estado,
          fecha,
        },
        {
          where: { id },
        }
      );

      if (typeof categorias === "string") {
        try {
          categorias = JSON.parse(categorias);
        } catch (e) {
          return res.status(400).json({ mensaje: "Categorías inválidas" });
        }
      }

      const categoriasId = categorias.map((a) => a.id);
      await filas.setCategoria(categoriasId);

      if (typeof conAcceso === "string") {
        try {
          conAcceso = JSON.parse(conAcceso);
        } catch (e) {
          return res
            .status(400)
            .json({ mensaje: "Relaciones para compartir inválidas" });
        }
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
    db.Registro.create({
      usuario: usuario_id,
      accion:
        "El usuario: " +
        req.usuarioNombre +
        ", actualizo el archivo con el id: " +
        id,
    });
    res.json({
      message: "Formulario recibido correctamente",
    });
  } catch (error) {
    console.error("Error al procesar el formulario:", error);
    res.status(500).json({ error: "Hubo un error al procesar el formulario" });
  }
});

//Establecer como terminado de subir un archivo por el usuario
router.post("/estado/true/:id", upload.none(), async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuarioId;
    const filas = await db.File.findByPk(id);
    await filas.update(
      {
        estado: "Publico",
      },
      {
        where: { id, usuario_id },
      }
    );

    res.json({
      message: "Datos recibidos correctamente",
    });
  } catch (error) {
    console.error("Error al procesar los datos:", error);
    res.status(500).json({ error: "Hubo un error al procesar los datos" });
  }
});

router.delete("/:id", async (req, res, next) => {
  const permisos = await obtenerPermisos(req.usuarioId);
  const permitido = permisos.elarchivo;
  if (permitido) {
    return next(); // Continúa con el siguiente
  } else {
    const file = await db.File.findByPk(req.params.id);

    if (file.usuario_id == req.usuarioId) {
      return next();
    } else {
      return res
        .status(401)
        .json({ message: "No se tiene permisos suficientes" });
    }
  }
});

// Eliminar un archivo
router.delete("/:id", async (req, res) => {
  try {
    const usuario_id = req.usuarioId;
    const file = await db.File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ error: "Archivo no encontrada" });

    const rutaArchivo = path.join(__dirname, "..", file.archivo);
    if (fs.existsSync(rutaArchivo)) {
      fs.unlink(rutaArchivo, (err) => {
        if (err) {
          console.error("Error al eliminar el archivo:", err);
        }
      });
    }
    const rutaMiniatura = path.join(__dirname, "..", file.miniatura);
    if (fs.existsSync(rutaMiniatura)) {
      fs.unlink(rutaMiniatura, (err) => {
        if (err) {
          console.error("Error al eliminar el archivo:", err);
        }
      });
    }

    db.Registro.create({
      usuario: usuario_id,
      accion:
        "El usuario: " +
        req.usuarioNombre +
        ", elimino el archivo con el id: " +
        file.id,
    });
    await file.destroy();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/filtrado/:origen", async (req, res, next) => {
  if (req.params.origen === "todo") {
    const permisos = await obtenerPermisos(req.usuarioId);
    const permitido = permisos.verarchivo;
    if (permitido) {
      return next(); // Continúa con el siguiente
    } else {
      return res
        .status(401)
        .json({ message: "No se tiene permisos suficientes" });
    }
  }
  return next();
});

router.get("/filtrado/:origen", async (req, res) => {
  const origen = req.params.origen;
  const archivo = req.query.name;
  const usuario = req.query.user;
  const tipo = req.query.tipo;
  let categorias;
  if (isNaN(req.query.categorias)) {
    categorias = parseInt(req.query.categorias);
  } else {
    categorias = [];
  }
  const fecha_inicio = req.query.fecha_inicio;
  const fecha_fin = req.query.fecha_fin;
  const usuario_id = req.usuarioId;

  const { Op } = require("sequelize");

  const where = {};
  const include = [];
  const includeCompartido = [];

  try {
    if (tipo) {
      where.tipo = { [Op.like]: `%${tipo}%` };
    }

    if (archivo) {
      where.nombre = { [Op.like]: `%${archivo}%` };
    }

    if (fecha_inicio && fecha_fin) {
      const obtenerInicioDelDia = (fecha) => {
        const f = new Date(fecha);
        f.setUTCHours(0, 0, 0, 0); // 00:00:00.000

        return f;
      };

      const obtenerFinDelDia = (fecha) => {
        const f = new Date(fecha);

        f.setUTCHours(23, 59, 59, 999); // 23:59:59.999

        return f;
      };

      where.fecha = {
        [Op.between]: [
          obtenerInicioDelDia(fecha_inicio),
          obtenerFinDelDia(fecha_fin),
        ],
      };
    } else if (fecha_inicio) {
      where.fecha = {
        [Op.gte]: obtenerInicioDelDia(fecha_inicio),
      };
    } else if (fecha_fin) {
      where.fecha = {
        [Op.lte]: obtenerFinDelDia(fecha_fin),
      };
    }

    let ids = [];
    let ids1 = [];

    let estado = false;
    const categoriasArray = Array.isArray(categorias)
      ? categorias
      : [categorias];

    if (origen === "personal") {
      where.usuario_id = usuario_id;
      where.estado = {
        [Op.ne]: "Subiendo",
      };
    } else if (origen === "general") {
      where.estado = "Publico";
    }

    if (["personal", "general", "todo"].includes(origen)) {
      include.push({
        model: db.Usuario,
        ...(usuario && {
          where: {
            [Op.and]: [
              {
                nombre: {
                  [Op.like]: `%${usuario}%`,
                },
              },
            ],
          },
        }),
      });
    }

    if (["compartido"].includes(origen)) {
      includeCompartido.push({
        model: db.Usuario,
        as: "UsuariosConAcceso",
        where: { id: usuario_id },
      });
    }

    const categoriasIds = categoriasArray.map((id) => parseInt(id));

    if (categoriasIds.length === 0) {
      let files;

      files = await db.File.findAll({
        include: [
          {
            model: db.Usuario,
          },
          ...include,
          ...includeCompartido,
        ],
        where: where,
      });

      ids1 = [];
      for (const file of files) {
        ids1.push(file.id);
      }

      if (estado) {
        ids = ids.filter((num) => ids1.includes(num));
      } else {
        ids = ids1;
        estado = true;
      }
    }

    for (const categoria of categoriasIds) {
      let files;

      if (categorias) {
        files = await db.File.findAll({
          where: where,
          include: [
            ...includeCompartido,
            {
              model: db.Categoria,
              where: {
                id: categoria,
              },
            },
            {
              model: db.Usuario,
              ...(usuario && {
                where: {
                  nombre: {
                    [Op.like]: `%${usuario}%`,
                  },
                },
              }),
            },
          ],
        });
      }
      ids1 = [];

      for (const file of files) {
        ids1.push(file.id);
      }

      if (estado) {
        ids = ids.filter((num) => ids1.includes(num));
      } else {
        ids = ids1;
        estado = true;
      }
    }

    const size = parseInt(req.query.cantidad);
    const offset = (parseInt(req.query.paginaActual) - 1) * size;
    const limit = size;

    const files1 = await db.File.findAndCountAll({
      where: {
        id: ids,
      },
      attributes: [
        "id",
        "archivo",
        "descripcion",
        "estado",
        "fecha",
        "miniatura",
        "nombre",
        "tipo",
      ],
      include: [
        {
          model: db.Usuario,
          as: "UsuariosConAcceso",
          through: { attributes: ["file_id", "permiso", "usuario_id"] },
          attributes: ["email"],
        },
        {
          model: db.Usuario,
          attributes: ["nombre"],
        },
        {
          model: db.Categoria,
          attributes: ["id", "nombre"],
          through: { attributes: [] },
        },
      ],
      limit,
      offset,
      distinct: true,
    });

    res.json(files1);
  } catch (error) {
    console.error("Error al obtener files:", error);
    res.status(500).json({ error: "Error al listar files" });
  }
});

//Obtener a quien se comparte determinado archivo
router.get("/compartiendo/:id", async (req, res) => {
  const usuario_id = req.usuarioId;
  try {
    const id = req.params.id;
    const where = {};
    where.id = id;
    const files = await db.File.findOne({
      where: where,
      include: [
        {
          model: db.Usuario,
          as: "UsuariosConAcceso",
          through: { attributes: ["file_id", "permiso", "usuario_id"] },
          attributes: ["email"],
        },
      ],
    });
    res.json(files);
  } catch (error) {
    console.error("Error al obtener compartidos:", error);
    res.status(500).json({ error: "Error al obtener compartidos" });
  }
});

router.get("/borrar/:user/:file", async (req, res, next) => {
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
        req.params.user != req.usuarioId
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

//quitarle archivo compartido a tal usuario
router.get("/borrar/:user/:file", async (req, res) => {
  try {
    const user = req.params.user;
    const file = req.params.file;
    const usuario = await db.Usuario.findByPk(user);
    await usuario.removeFilesCompartidos(file);

    const where = {};
    where.id = file;
    const files = await db.File.findOne({
      where: where,
      include: [
        {
          model: db.Usuario,
          as: "UsuariosConAcceso",
          through: { attributes: ["file_id", "permiso", "usuario_id"] },
          attributes: ["email"],
        },
      ],
    });
    res.json(files);
  } catch (error) {
    res
      .status(500)
      .json({ error: "No se pudo eliminar", detalles: error.message });
  }
});

module.exports = router;
