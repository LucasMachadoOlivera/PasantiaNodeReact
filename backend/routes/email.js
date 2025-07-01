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
          where: { id },
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

const emailPorpietario = process.env.EMAIL_ADDRESS;
const pass = process.env.EMAIL_APPLICATION_PASS;

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailPorpietario,
    pass: pass,
  },
});

router.post("/", async (req, res, next) => {
  const permisos = await obtenerPermisos(req.usuarioId);
  const permitido = permisos.agusuario;
  if (permitido) {
    const dominio = req.body.email.split("@")[1];
    if (dominio == "estudiantes.utec.edu.uy" || dominio == "utec.edu.uy") {
      return next(); // Continúa con el siguiente
    } else {
      return res.status(401).json({ message: "Correo o Dominio incorrecto" });
    }
  }
  return res.status(401).json({ message: "No se tiene permisos suficientes" });
});

//Crear un usuario
router.post("/", async (req, res) => {
  let userid = "";
  try {
    const email = req.body.email;
    const nombre = generarUsername();
    const contraseña = generarPassword();
    //const estado = "Validando";
    const permiso_id = 2;
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const nuevoUsuario = await db.Usuario.create({
      nombre,
      email,
      //estado,
      contraseña: hashedPassword,
      permiso_id,
    });

    userid = nuevoUsuario.id;

    await db.Registro.create({
      usuario: nuevoUsuario.id,
      accion:
        "El usuario: " +
        userid +
        " : " +
        nombre +
        " se registro por " +
        req.usuarioId +
        " : " +
        req.usuarioNombre,
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

    await transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        res.status(500).send({ message: "Error al enviar el correo" });
        db.Usuario.destroy({
          where: { id: userid },
        });
      } else {
        res.status(200).send({ message: "Correo enviado correctamente" });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Error al enviar el correo" });
  }
});

router.post("/update", async (req, res, next) => {
  const permisos = await obtenerPermisos(req.usuarioId);
  const permitido = permisos.edusuario;
  if (permitido) {
    next(); // Continúa con el siguiente
  } else {
    return res
      .status(401)
      .json({ message: "No se tiene permisos suficientes" });
  }
});

//Resetear contraseña  de cierto usuario
router.post("/update", async (req, res) => {
  try {
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
      accion:
        "El usuario: " +
        userid +
        " : " +
        nombre +
        " se le reseteo la contraseña por " +
        req.usuarioId +
        " : " +
        req.usuarioNombre,
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
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error al enviar el correo" });
  }
});

module.exports = router;
