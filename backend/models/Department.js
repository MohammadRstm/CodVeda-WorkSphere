module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define("Department", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false }
  }, {
    tableName: "Departments",
    timestamps: false
  });

  Department.associate = (models) => {
    Department.hasMany(models.Project, { foreignKey: "dep_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
    Department.hasMany(models.User, { foreignKey: "dep_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
  };

  return Department;
};
