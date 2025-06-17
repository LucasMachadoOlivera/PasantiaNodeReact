const db = require("../models"); // o la ruta correcta a tus modelos
const { Op } = require("sequelize");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

cron.schedule("0 * * * *", async () => {
  try {
    const ahora = new Date();
    const hace10Minutos = new Date(ahora.getTime() - 1 * 60 * 60 * 1000); // 1 hora atrás

    // Buscar usuarios en estado "pendiente" creados o actualizados hace más de 10 min
    const usuariosPendientes = await db.Usuario.findAll({
      where: {
        estado: "pendiente",
        updatedAt: {
          [Op.lt]: hace10Minutos,
        },
      },
    });

    for (const usuario of usuariosPendientes) {
      usuario.estado = "expirado";
      await usuario.save();
      console.log(`Usuario ${usuario.id} actualizado a expirado`);
    }
  } catch (error) {
    console.error("Error en la tarea programada:", error);
  }
});

// Ejecutar todos los días a la medianoche (00:00)
cron.schedule("0 0 * * *", async () => {
  try {
    const hace1Dia = new Date(Date.now() - 24 * 60 * 60 * 1000); // hace 1 día

    // Buscar usuarios con estado pendiente y más de 1 día sin actualizar
    const usuarios = await db.Usuario.findAll({
      where: {
        estado: "expirado",
        updatedAt: {
          [Op.lt]: hace1Dia,
        },
      },
    });

    for (const usuario of usuarios) {
      await usuario.destroy(); // Eliminamos el usuario
      console.log(`Usuario ${usuario.id} eliminado (pendiente > 1 día)`);
    }

    console.log("Tarea diaria de eliminación completada");
  } catch (error) {
    console.error("Error en la tarea de eliminación diaria:", error);
  }
});

cron.schedule("0 * * * *", async () => {
  try {
    const ahora = new Date();
    const hace10Minutos = new Date(ahora.getTime() - 1 * 60 * 60 * 1000); // 1 hora atrás

    // Buscar usuarios en estado "pendiente" creados o actualizados hace más de 10 min
    const usuariosPendientes = await db.Usuario.findAll({
      where: {
        estado: "pendiente",
        updatedAt: {
          [Op.lt]: hace10Minutos,
        },
      },
    });

    for (const usuario of usuariosPendientes) {
      usuario.estado = "expirado";
      await usuario.save();
      console.log(`Usuario ${usuario.id} actualizado a expirado`);
    }
  } catch (error) {
    console.error("Error en la tarea programada:", error);
  }
});

//Eliminar Registros de cierta antiguedad
cron.schedule("0 * * * *", async () => {
  try {
    const ahora = new Date();
    const hace10Minutos = new Date(ahora.getTime() - 1 * 60 * 60 * 1000); // 1 hora atrás

    const registrosPendientes = await db.Registro.findAll({
      where: {
        updatedAt: {
          [Op.lt]: hace10Minutos,
        },
      },
    });

    for (const registro of registrosPendientes) {
      await registro.destroy();
      console.log(`Borrado registro ${registro.id}`);
    }
  } catch (error) {
    console.error("Error en la tarea programada:", error);
  }
});
