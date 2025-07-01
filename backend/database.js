const db = require("./models"); // Asegúrate de que el path es correcto
const bcrypt = require("bcrypt");

async function seedDatabase() {
  const vercategoria = true;
  const agcategoria = true;
  const edcategoria = true;
  const elcategoria = true;

  const verarchivo = true;
  const edarchivo = true;
  const elarchivo = true;

  const verusuario = true;
  const agusuario = true;
  const edusuario = true;
  const elusuario = true;

  const verpermiso = true;
  const agpermiso = true;
  const edpermiso = true;
  const elpermiso = true;

  const verlogs = true;

  const existing00 = await db.Permiso.findOne({
    where: { nombre: "Admin" },
  });

  if (!existing00) {
    await db.Permiso.create({
      nombre: "Admin",
      vercategoria,
      agcategoria,
      edcategoria,
      elcategoria,
      verarchivo,
      edarchivo,
      elarchivo,
      verusuario,
      agusuario,
      edusuario,
      elusuario,
      verpermiso,
      agpermiso,
      edpermiso,
      elpermiso,
      verlogs,
    });
    console.log("Permiso creado");
  } else {
    console.log("Permiso ya existe");
  }

  const existing000 = await db.Permiso.findOne({
    where: { nombre: "Default" },
  });
  if (!existing000) {
    await db.Permiso.create({ nombre: "Default" });
    console.log("Permiso creado");
  } else {
    console.log("Permiso ya existe");
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

  const existing1 = await db.Categoria.findOne({
    where: { nombre: "Talleres" },
  });
  if (!existing1) {
    const admin = await db.Categoria.create({ nombre: "Talleres" });
    console.log("Categoria creada");
  } else {
    console.log("Categoria ya existe");
  }

  const existing2 = await db.Categoria.findOne({
    where: { nombre: "Investigación" },
  });
  if (!existing2) {
    const editor = await db.Categoria.create({ nombre: "Investigación" });
    console.log("Categoria creada");
  } else {
    console.log("Categoria ya existe");
  }

  const existing3 = await db.Categoria.findOne({
    where: { nombre: "Docentes" },
  });
  if (!existing3) {
    const user = await db.Categoria.create({ nombre: "Docentes" });
    console.log("Categoria creada");
  } else {
    console.log("Categoria ya existe");
  }
}

module.exports = seedDatabase;
