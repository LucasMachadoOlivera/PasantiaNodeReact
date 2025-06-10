module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Permiso", {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vercategoria: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
    agcategoria: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
    edcategoria: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
    elcategoria: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
    verarchivo: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
    agarchivo: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
    edarchivo: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
    elarchivo: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
    registrar: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
    verusuario: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
    agusuario: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
    edusuario: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
    elusuario: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
    resusuario: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
    verpermiso: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
    agpermiso: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
    edpermiso: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
    elpermiso: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
    verlogs: {
      type: DataTypes.BOOLEAN, // Campo booleano
      allowNull: false,
      defaultValue: false, // Valor por defecto
    },
  });
};
