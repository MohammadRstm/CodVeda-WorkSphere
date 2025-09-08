// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    dep_id: { type: DataTypes.INTEGER, allowNull: false },
    project_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(30), allowNull: false },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    age: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    role: {
      type: DataTypes.ENUM("employee", "manager", "admin"),
      allowNull: false
    },
    password: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: "Users",
    timestamps: false
  });   

  User.associate = (models) => {
    User.belongsTo(models.Department, { foreignKey: "dep_id" });
    User.belongsTo(models.Project, { foreignKey: "project_id" });
    User.hasOne(models.Profile, { foreignKey: "user_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
  };

  return User;
};
