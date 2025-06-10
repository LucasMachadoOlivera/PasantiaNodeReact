module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("Usuario", {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Asegura que el email sea único
      validate: {
        isEmail: true, // Verifica que el email tenga formato válido
      },
    },
    contraseña: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    permiso_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Permisos", // Referencia a la tabla 'Usuarios'
        key: "id",
      },
    },
  });

  // Método para verificar la contraseña (para usar con Passport)
  User.prototype.validPassword = function (contraseña) {
    return bcrypt.compareSync(contraseña, this.contraseña);
  };

  return User;
};
