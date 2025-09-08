module.exports = (sequelize, DataTypes) => {
  const Profile = sequelize.define("Profile", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    photo_url: {
      type: DataTypes.STRING(255),
      defaultValue: "https://www.w3schools.com/howto/img_avatar.png"
    },
    bio: {
      type: DataTypes.STRING(255),
      defaultValue: "Hello, I work at CodVeda!"
    }
  }, {
    tableName: "Profiles",
    timestamps: false
  });

  Profile.associate = (models) => {
    Profile.belongsTo(models.User, { foreignKey: "user_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
  };

  return Profile;
};
