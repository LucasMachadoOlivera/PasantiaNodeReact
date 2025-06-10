module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Registro", {
    accion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    log_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Usuarios", // Referencia a la tabla 'Usuarios'
        key: "id",
      },
    },
  });
};
