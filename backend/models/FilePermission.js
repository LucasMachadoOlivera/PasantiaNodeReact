// models/file_etiqueta.js
module.exports = (sequelize, DataTypes) => {
  const FileUsuario = sequelize.define("File_usuario", {
    permiso: {
      type: DataTypes.ENUM("Editor", "Visualizador"),
    },
  });

  return FileUsuario;
};
