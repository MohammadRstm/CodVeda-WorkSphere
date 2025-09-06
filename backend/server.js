require('dotenv').config()

const express = require("express")
const mysql = require("mysql2/promise")
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const app = express()

app.use(express.json()); // parse JSON request body
app.use(cors());// allow for requests from different ports

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'dsffj329ufdksafiw';
const JWT_EXPIRY = '1h';

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

function auth(req , res , next){
  const header = req.header['authorization'];
  const token = header && header.split(' ')[1];

  if (!token) res.status(401).json({message : 'No Token'});
  
  try{
    const decoded = jwt.verify(token , JWT_SECRET);
    req.user = decoded;
    next();
  }catch(err){
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

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


