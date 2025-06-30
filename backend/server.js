require("dotenv").config();
const express = require("express");
const session = require("express-session");
const mysql = require("mysql2");
const db = require("./models");
const path = require("path");
const cors = require("cors");
require("./cron/cron");
const passport = require("./passport/passport");
const MySQLStore = require("express-mysql-session")(session);

const mysqlOptions = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
};

const connection = mysql.createConnection(mysqlOptions);

const promiseConnection = connection.promise();

const sessionStore = new MySQLStore({}, promiseConnection);

const app = express();
// Configuracion de CORS para permitir que React (cliente) se comunique con Express (servidor)
app.use(
  cors({
    origin: `http://${process.env.REACT_HOST}:${process.env.REACT_PORT}`, // puerto React está corriendo
    credentials: true, // Esto es importante para enviar las cookies
  })
);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "secreto",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true si usas HTTPS
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
const fileRoutes = require("./routes/files");
const uploadRoute = require("./routes/upload");
const registroRoute = require("./routes/registro");
const permisoRoute = require("./routes/permisos");
const emailRoute = require("./routes/email");

const seedDatabase = require("./database");

app.use(express.static(path.join(__dirname, "src/pages/public")));

// Rutas
app.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({ ok: true });
});

app.post("/logout", (req, res) => {
  req.logout(() => res.json({ ok: true }));
});

app.get("/usuario", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      id: req.user.id,
      nombre: req.user.nombre,
      email: req.user.email,
      fecha: req.user.createdAt,
    });
  } else {
    res.status(404).json({ error: "No autenticado" });
  }
});

const imageFolderPath = path.join(__dirname, "uploads");
const miniatureFolderPath = path.join(__dirname, "thumbnails");

app.use("/api", (req, res, next) => {
  if (req.isAuthenticated()) {
    req.usuarioId = req.user.id; // Agrega el ID del usuario a la request
    req.usuarioNombre = req.user.nombre;
    req.usuarioEmail = req.user.email;
  } else {
    return res
      .status(401)
      .json({ message: "No autenticado. Redirigiendo a login." });
  }

  next(); // Continúa con el siguiente
});

app.use("/uploads/:id", async (req, res) => {
  try {
    // Realizamos un fetch al servidor, enviando las cookies de sesión
    const id = req.params.id;
    const response = await fetch(
      `http://localhost:${process.env.PORT}/api/upload/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.cookie, // ⬅️ reenviamos las cookies del cliente original
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).send("Error al obtener imagen");
    }

    // Construir la ruta completa del archivo
    const filePath = path.join(imageFolderPath, id);

    // Validar si el archivo existe
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).send("Imagen no encontrada.");
      }
    });
  } catch (error) {
    console.error("Error al hacer el fetch", error);
    return res.status(500).send("Error interno del servidor");
  }
});

app.use("/descargar/uploads/:id", async (req, res) => {
  try {
    // Realizamos un fetch al servidor, enviando las cookies de sesión
    const id = req.params.id;
    const response = await fetch(
      `http://localhost:${process.env.PORT}/api/upload/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.cookie, // ⬅️ reenviamos las cookies del cliente original
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).send("Error al obtener imagen");
    }

    // Construir la ruta completa del archivo
    const filePath = path.join(imageFolderPath, id);

    // Validar si el archivo existe
    res.download(filePath, (err) => {
      if (err) {
        res.status(404).send("Imagen no encontrada.");
      }
    });
  } catch (error) {
    console.error("Error al hacer el fetch", error);
    return res.status(500).send("Error interno del servidor");
  }
});

app.use("/thumbnails/:id", async (req, res) => {
  try {
    // Realizamos un fetch al servidor, enviando las cookies de sesión
    const id = req.params.id;
    const response = await fetch(
      `http://localhost:${process.env.PORT}/api/upload/mini/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.cookie, // ⬅️ reenviamos las cookies del cliente original
        },
      }
    );
    if (!response.ok) {
      return res.status(response.status).send("Error al obtener imagen");
    }
    // Construir la ruta completa del archivo
    const filePath = path.join(miniatureFolderPath, id);
    // Validar si el archivo existe
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).send("Imagen no encontrada.");
      }
    });
  } catch (error) {
    console.error("Error al hacer el fetch", error);
    return res.status(500).send("Error interno del servidor");
  }
});

app.use("/api/upload", uploadRoute);

app.use("/api/permisos", permisoRoute);

app.use("/api/usuarios", userRoutes);

app.use("/api/categorias", categoryRoutes);

app.use("/api/files", fileRoutes);

app.use("/api/registros", registroRoute);

app.use("/api/email", emailRoute);

// Sincroniza la base de datos
db.sequelize
  .sync({ force: false }) //para resetear cambiar a true
  .then(async () => {
    console.log("Base de datos sincronizada (tablas creadas)");

    seedDatabase();

    app.listen(process.env.PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error al sincronizar la base de datos:", error);
  });
