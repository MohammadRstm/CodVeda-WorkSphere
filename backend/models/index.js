const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || "codveda_level3",   // database
  process.env.DB_USER || "root",             // username
  process.env.DB_PASSWORD || "Window7op123!",// password
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",                        // MUST specify
    logging: false,                           // optional
    port: process.env.DB_PORT || 3306
  }
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Import models
db.Department = require("./Department")(sequelize, DataTypes);
db.Project = require("./Project")(sequelize, DataTypes);
db.User = require("./User")(sequelize, DataTypes);
db.Profile = require("./Profile")(sequelize, DataTypes);
db.Task = require('./Task')(sequelize , DataTypes)
// Run associations
Object.values(db).forEach(model => {
  if (model.associate) model.associate(db);
});

module.exports = db;
