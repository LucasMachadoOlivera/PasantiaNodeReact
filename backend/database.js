const db = require("./models"); // Asegúrate de que el path es correcto
const bcrypt = require("bcrypt");
const path = require("path");

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

  const existing1 = await db.Permiso.findOne({
    where: { nombre: "Admin" },
  });
  if (!existing1) {
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
  }

  const existing2 = await db.Permiso.findOne({
    where: { nombre: "Default" },
  });
  if (!existing2) {
    await db.Permiso.create({ nombre: "Default" });
  }

  const existing3 = await db.Usuario.findOne({
    where: { email: "todo@demo.com" },
  });

  if (!existing3) {
    const hashedPassword = await bcrypt.hash("todo123", 10);
    await db.Usuario.create({
      nombre: "Todo",
      email: "todo@demo.com",
      contraseña: hashedPassword,
      permiso_id: 1,
    });
  }

  const existing4 = await db.Categoria.findOne({
    where: { nombre: "Talleres" },
  });
  if (!existing4) {
    await db.Categoria.create({ nombre: "Talleres" });
  }

  const existing5 = await db.Categoria.findOne({
    where: { nombre: "Investigación" },
  });
  if (!existing5) {
    await db.Categoria.create({ nombre: "Investigación" });
  }

  const existing6 = await db.Categoria.findOne({
    where: { nombre: "Docentes" },
  });
  if (!existing6) {
    await db.Categoria.create({ nombre: "Docentes" });
  }
}

module.exports = seedDatabase;
