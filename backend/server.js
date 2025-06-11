const express = require("express");
const session = require("express-session");
const db = require("./models");
const path = require("path");
const cors = require("cors");
//require("./cron/cron");
const passport = require("./passport/passport");

const app = express();
// Configuración de CORS para permitir que React (cliente) se comunique con Express (servidor)
app.use(
  cors({
    origin: "http://localhost:5173", // Cambia esta URL si tu React está corriendo en otro puerto
    credentials: true, // Esto es importante para enviar las cookies de sesión
  })
);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "secreto",
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
    res.status(401).json({ error: "No autenticado" });
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
    const response = await fetch(`http://localhost:3000/api/upload/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.cookie, // ⬅️ reenviamos las cookies del cliente original
      },
    });

    if (!response.ok) {
      return res.status(response.status).send("Error al obtener imagen");
    }

    // Construir la ruta completa del archivo
    const filePath = path.join(imageFolderPath, id);

    // Validar si el archivo existe
    res.sendFile(filePath, (err) => {
      if (err) {
        console.log("FALOO", filePath);
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
    const response = await fetch(`http://localhost:3000/api/upload/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.cookie, // ⬅️ reenviamos las cookies del cliente original
      },
    });

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
      `http://localhost:3000/api/upload/mini/${id}`,
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
        console.log("FALOO", filePath);
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

// Sincroniza la base de datos
db.sequelize
  .sync({ force: false })
  .then(async () => {
    console.log("✅ Base de datos sincronizada (tablas creadas)");

    //seedDatabase();

    app.listen(3000, () => {
      console.log("🚀 Servidor corriendo en http://localhost:3000");
    });
  })
  .catch((error) => {
    console.error("❌ Error al sincronizar la base de datos:", error);
  });
