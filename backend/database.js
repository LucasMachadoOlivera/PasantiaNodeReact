const db = require("./models"); // Asegúrate de que el path es correcto
const bcrypt = require("bcrypt");
const path = require("path");

async function seedDatabase() {
  const vercategoria = true;
  const agcategoria = true;
  const edcategoria = true;
  const elcategoria = true;

  const verarchivo = true;
  const agarchivo = true;
  const edarchivo = true;
  const elarchivo = true;

  const registrar = true;

  const verusuario = true;
  const agusuario = true;
  const edusuario = true;
  const elusuario = true;

  const resusuario = true;

  const verpermiso = true;
  const agpermiso = true;
  const edpermiso = true;
  const elpermiso = true;

  const verlogs = true;

  const permisoAll = await db.Permiso.create({
    nombre: "Admin",
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
  });
  const permiso = await db.Permiso.create({ nombre: "Default" });
  const permisocat = await db.Permiso.create({
    nombre: "Categoria",
    vercategoria,
    agcategoria,
    elcategoria,
  });
  const permisoarch = await db.Permiso.create({
    nombre: "Archivo",
    vercategoria,
    verarchivo,
    agarchivo,
  });
  const permisouser = await db.Permiso.create({
    nombre: "User",
    verusuario,
    agusuario,
    elusuario,
  });
  const existing = await db.Usuario.findOne({
    where: { email: "lucasmachadoolivera12@gmail.com" },
  });
  if (!existing) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.Usuario.create({
      nombre: "Admin",
      email: "lucasmachadoolivera12@gmail.com",
      contraseña: hashedPassword,
      permiso_id: 1,
    });
    console.log("Usuario admin creado");
  } else {
    console.log("Usuario admin ya existe");
  }

  const existing1 = await db.Usuario.findOne({
    where: { email: "lucasmachado123456889@gmail.com" },
  });
  if (!existing1) {
    const hashedPassword1 = await bcrypt.hash("usuario123", 10);
    await db.Usuario.create({
      nombre: "Usuario",
      email: "lucasmachado123456889@gmail.com",
      contraseña: hashedPassword1,
      permiso_id: 1,
    });
    console.log("Usuario usuario creado");
  } else {
    console.log("Usuario usuario ya existe");
  }

  const existing2 = await db.Usuario.findOne({
    where: { email: "edit@demo.com" },
  });
  if (!existing2) {
    const hashedPassword2 = await bcrypt.hash("edit123", 10);
    await db.Usuario.create({
      nombre: "Edit",
      email: "edit@demo.com",
      contraseña: hashedPassword2,
      permiso_id: 1,
    });
    console.log("Usuario edit creado");
  } else {
    console.log("Usuario edit ya existe");
  }

  const existing0 = await db.Usuario.findOne({
    where: { email: "todo@demo.com" },
  });

  if (!existing0) {
    const hashedPassword = await bcrypt.hash("todo123", 10);
    await db.Usuario.create({
      nombre: "Todo",
      email: "todo@demo.com",
      contraseña: hashedPassword,
      permiso_id: 1,
    });
    console.log("Usuario todo creado");
  } else {
    console.log("Usuario todo ya existe");
  }

  // Crear Files y categorias para probar
  const file1 = await db.File.create({
    miniatura: path.join("uploads", "descarga (1)-1747261105160.jpg"),
    tipo: "jpg",
    nombre: "descarga (1)",
    archivo: path.join("uploads", "descarga (1)-1747261105160.jpg"),
    estado: "Publico",
    fecha: new Date(),
    usuario_id: 1,
  });
  const user1 = await db.Usuario.findByPk(2);
  await user1.addFilesCompartidos(file1, {
    through: { permiso: "Editor" },
  });

  const file2 = await db.File.create({
    miniatura: path.join("uploads", "descarga (2)-1747261105161.jpg"),
    tipo: "jpg",
    nombre: "descarga (2)",
    archivo: path.join("uploads", "descarga (2)-1747261105161.jpg"),
    fecha: new Date(),
    usuario_id: 1,
    estado: "Publico",
  });
  const user2 = await db.Usuario.findByPk(3);
  await user2.addFilesCompartidos(file2, {
    through: { permiso: 1 },
  });

  const file3 = await db.File.create({
    miniatura: path.join("uploads", "descarga (3)-1747261105161.jpg"),
    tipo: "jpg",
    nombre: "descarga (3)",
    archivo: path.join("uploads", "descarga (3)-1747261105161.jpg"),
    fecha: new Date(),
    estado: "Publico",
    usuario_id: 2,
  });
  const user3 = await db.Usuario.findByPk(1);
  await user3.addFilesCompartidos(file3, {
    through: { permiso: 1 },
  });

  const file4 = await db.File.create({
    miniatura: path.join("uploads", "descarga (4)-1747261105162.jpg"),
    tipo: "png",
    nombre: "descarga (4)",
    archivo: path.join("uploads", "descarga (4)-1747261105162.jpg"),
    fecha: new Date(),
    estado: "Publico",
    usuario_id: 3,
  });
  const user4 = await db.Usuario.findByPk(2);
  await user4.addFilesCompartidos(file4, {
    through: { permiso: 1 },
  });

  const admin = await db.Categoria.create({ nombre: "Talleres" });
  const editor = await db.Categoria.create({ nombre: "Investigación" });
  const user = await db.Categoria.create({ nombre: "Docentes" });

  user0 = await db.Usuario.findByPk(4);

  await user0.addFilesCompartidos(file1, {
    through: { permiso: "Visualizador" },
  });
  await user0.addFilesCompartidos(file2, {
    through: { permiso: 2 },
  });
  await user0.addFilesCompartidos(file3, {
    through: { permiso: 2 },
  });
  await user0.addFilesCompartidos(file4, {
    through: { permiso: 2 },
  });

  await file1.addCategoria([admin, editor]);
  await file2.addCategoria(editor);
  await file3.addCategoria(admin);
  await file4.addCategoria(user);
}

module.exports = seedDatabase;
