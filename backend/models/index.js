const { Sequelize, DataTypes } = require("sequelize");
const dbConfig = require("../db");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
});

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

module.exports = db;
