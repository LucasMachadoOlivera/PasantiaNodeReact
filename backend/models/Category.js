module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Categoria", {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });
};
