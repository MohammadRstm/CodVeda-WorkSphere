require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json()); 
app.use(cors()); 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Sequelize models
const db = require("./models"); 

// Routers now take models instead of mysql2 pool
const userRouter = require("./routes/users")(db);
app.use("/users", userRouter);

const profileRouter = require("./routes/profiles")(db);
app.use("/profiles", profileRouter);

const projectsRouter = require("./routes/projects")(db);
app.use("/projects", projectsRouter);

const departmentsRouter = require("./routes/departments")(db);
app.use("/departments", departmentsRouter);

// Sync database and start server
db.sequelize.authenticate()
  .then(() => {
    console.log("Database connection established successfully!");
    return db.sequelize.sync({ alter: false }); 
  })
  .then(() => {
    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000");
    });
  })
  .catch(err => {
    console.error("Unable to connect to database:", err);
  });
