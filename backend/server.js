const express = require("express");
const mysql = require("mysql2");
const cors = require('cors')
const app = express();

app.use(express.json()); // parse JSON request body
app.use(cors());// allow for requests from different ports

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Window7op123!",
  database: "CodeVeda_lvl_2",
  multipleStatements: true
});


db.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL!");
    connection.release();
  }
});


const userRouter = require('./routes/users')(db);
app.use('/users' , userRouter);

const profileRouter = require('./routes/profiles')(db);
app.use('/profile' , profileRouter);

const projectsRouter = require('./routes/projects')(db);
app.use('/projects' , projectsRouter);

const departmentsRouter = require('./routes/departments')(db);
app.use('/departments' , departmentsRouter);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});


