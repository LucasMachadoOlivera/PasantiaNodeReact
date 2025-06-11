const express = require("express");
const router = express.Router();
const db = require("../models");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

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

function generarUsername() {
  return "user" + Math.floor(1000 + Math.random() * 9000); // user1234
}

function generarPassword(longitud = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
  let password = "";
  for (let i = 0; i < longitud; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

const emailPorpietario = "p30225241@gmail.com";
const pass = "klaj ehny jxct eslb";

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailPorpietario,
    pass: pass,
  },
});

//Crear un usuario
router.post("/", async (req, res) => {
  try {
    const permisos = await obtenerPermisos(req.usuarioId);
    const permitido = permisos.agusuario;
    if (permitido) {
      const email = req.body.email;
      const nombre = generarUsername();
      const contraseña = generarPassword();
      const estado = "Validando";
      const permiso_id = 1;

      const hashedPassword = await bcrypt.hash(contraseña, 10);
      const nuevoUsuario = await db.Usuario.create({
        nombre,
        email,
        estado,
        contraseña: hashedPassword,
        permiso_id,
      });

      db.Registro.create({
        usuario: nuevoUsuario.id,
        accion: "El usuario: " + nombre + " se registro",
      });

      const mailOptions = {
        from: emailPorpietario,
        to: email,
        subject: "Registro exitoso",
        html: `<h2>¡Bienvenido, ${nombre}!</h2>
           <p>Tu cuenta ha sido creada exitosamente.</p>
           <p><b>Usuario:</b> ${nombre}</p>
           <p><b>Contraseña:</b> ${contraseña}</p>`,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).send({ message: "Correo enviado correctamente" });
    } else {
      throw new Error("No se tiene permisos suficientes");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error al enviar el correo" });
  }
});

//Resetear contraseña de cierto usuario
router.post("/update", async (req, res) => {
  try {
    const permisos = await obtenerPermisos(req.usuarioId);
    const permitido = permisos.resusuario;
    if (permitido) {
      const id = req.body.id;
      const email = req.body.email;
      const nombre = req.body.nombre;
      const contraseña = generarPassword();

      const hashedPassword = await bcrypt.hash(contraseña, 10);
      const nuevoUsuario = await db.Usuario.update(
        {
          contraseña: hashedPassword,
        },
        {
          where: { id },
        }
      );

      db.Registro.create({
        usuario: nuevoUsuario.id,
        accion: "El usuario: " + nombre + " se le reseteo la contraseña",
      });

      const mailOptions = {
        from: emailPorpietario,
        to: email,
        subject: "Contraseña actualizada",
        html: `<h2>¡Bienvenido, ${nombre}!</h2>
           <p>Tu contraseña a sido reseteada.</p>
           <p><b>Usuario:</b> ${nombre}</p>
           <p><b>Contraseña:</b> ${contraseña}</p>`,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).send({ message: "Correo enviado correctamente" });
    } else {
      throw new Error("No se tiene permisos suficientes");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error al enviar el correo" });
  }
});

module.exports = router;
