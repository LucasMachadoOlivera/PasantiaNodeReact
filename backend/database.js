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

  const permisoAll = await db.Permiso.create({
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
  const permiso = await db.Permiso.create({ nombre: "Default" });

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

  const admin = await db.Categoria.create({ nombre: "Talleres" });
  const editor = await db.Categoria.create({ nombre: "Investigación" });
  const user = await db.Categoria.create({ nombre: "Docentes" });
}

module.exports = seedDatabase;
