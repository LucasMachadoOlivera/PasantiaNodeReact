const db = require("../models"); // o la ruta correcta a tus modelos
const { Op } = require("sequelize");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

//Eliminar Archivos que esten pendientes a subir
cron.schedule("0 0 * * *", async () => {
  try {
    const ahora = new Date();

    const haceUnDia = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);

    const archivosPendientes = await db.File.findAll({
      where: {
        estado: "Subiendo",

        updatedAt: {
          [Op.lt]: haceUnDia,
        },
      },
    });

    for (const file of archivosPendientes) {
      if (!file)
        return res.status(404).json({ error: "Archivo no encontrada" });

      const rutaArchivo = path.join(__dirname, "..", file.archivo);
      if (fs.existsSync(rutaArchivo)) {
        fs.unlink(rutaArchivo, (err) => {
          if (err) {
            console.error("Error al eliminar el archivo:", err);
          }
        });
      }
      await file.destroy();
    }
  } catch (error) {
    console.error("Error en la tarea programada:", error);
  }
});

//Eliminar Registros de cierta antiguedad
cron.schedule("0 0 * * *", async () => {
  try {
    const ahora = new Date();

    const haceUnMes = new Date(ahora);
    haceUnMes.setMonth(haceUnMes.getMonth() - 1); // Hace un meS

    const registrosPendientes = await db.Registro.findAll({
      where: {
        updatedAt: {
          [Op.lt]: haceUnMes,
        },
      },
    });

    for (const registro of registrosPendientes) {
      await registro.destroy();
    }
  } catch (error) {
    console.error("Error en la tarea programada:", error);
  }
});
