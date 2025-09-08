module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    "Project",
    {
      id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
      },
      dep_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
          model: "Departments",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      name: { 
        type: DataTypes.STRING(40), 
        allowNull: false 
      },
    },
    {
      tableName: "Projects",
      timestamps: false, 
    }
  );

  Project.associate = (models) => {
    Project.belongsTo(models.Department, { 
      foreignKey: "dep_id", 
      onDelete: "CASCADE", 
      onUpdate: "CASCADE" 
    });
    Project.hasMany(models.User, { 
      foreignKey: "project_id", 
      onUpdate: "CASCADE", 
      onDelete: "CASCADE" 
    });
  };

  return Project;
};

