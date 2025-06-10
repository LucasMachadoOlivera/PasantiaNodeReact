module.exports = (sequelize, DataTypes) => {
  return sequelize.define("File", {
    miniatura: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    archivo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("Subiendo", "Publico", "Privado"),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true, // Permite NULL
    },

    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Usuarios", // Referencia a la tabla 'Usuarios'
        key: "id",
      },
    },
  });
};
