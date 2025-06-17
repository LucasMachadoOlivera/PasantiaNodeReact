const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();
//const dbConfig = require("../db");

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Registro = require("./Log")(sequelize, DataTypes);
db.Permiso = require("./Permisos")(sequelize, DataTypes);
db.Usuario = require("./User")(sequelize, DataTypes);
db.File = require("./File")(sequelize, DataTypes);
db.Categoria = require("./Category")(sequelize, DataTypes);

db.FilePermission = require("./FilePermission")(sequelize, DataTypes);

// Relaciones
db.Usuario.hasMany(db.File, { foreignKey: "usuario_id" });
db.File.belongsTo(db.Usuario, { foreignKey: "usuario_id" });

db.Usuario.hasMany(db.Registro, { foreignKey: "log_id" });
db.Registro.belongsTo(db.Usuario, { foreignKey: "log_id" });

db.Permiso.hasMany(db.Usuario, { foreignKey: "permiso_id" });
db.Usuario.belongsTo(db.Permiso, { foreignKey: "permiso_id" });

db.File.belongsToMany(db.Categoria, {
  through: "Categoria_File",
  foreignKey: "file_id",
  otherKey: "categoria_id",
});

db.Categoria.belongsToMany(db.File, {
  through: "Categoria_File",
  foreignKey: "categoria_id",
  otherKey: "file_id",
});

db.File.belongsToMany(db.Usuario, {
  as: "UsuariosConAcceso",
  through: db.FilePermission,
  foreignKey: "file_id",
  otherKey: "usuario_id",
});

db.Usuario.belongsToMany(db.File, {
  as: "FilesCompartidos",
  through: db.FilePermission,
  foreignKey: "usuario_id",
  otherKey: "file_id",
});

// Intento de conexión con reintentos (no afecta la exportación)
(async function initConnection() {
  const maxRetries = 10;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await sequelize.authenticate();
      console.log("Conectado a la base de datos");

      await sequelize.sync();
      console.log("Base de datos sincronizada");
      break;
    } catch (error) {
      retries++;
      console.error(
        `Error conectando/sincronizando (intento ${retries}): ${error.message}`
      );
      if (retries === maxRetries) {
        console.error("🚨 No se pudo conectar a la base de datos. Abortando.");
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, 5000)); // espera 5s
    }
  }
})();

module.exports = db;
