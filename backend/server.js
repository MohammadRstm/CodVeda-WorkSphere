require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose"); // ✅ Mongoose import

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const server = http.createServer(app);

// Import socket initialization
const { init } = require("./socket");
const io = init(server);

// Import Mongoose models
const db = require("./models");

// Import routes (they are now functions that accept `db`)
const userRouter = require("./routes/users");
const profileRouter = require("./routes/profiles");
const projectsRouter = require("./routes/projects");
const departmentsRouter = require("./routes/departments");
const tasksRouter = require("./routes/tasks");
const messagesRouter = require('./routes/messages');

// Use routes, passing `db` to each
app.use("/users", userRouter(db));
app.use("/profiles", profileRouter(db));
app.use("/projects", projectsRouter(db));
app.use("/departments", departmentsRouter);
app.use("/tasks", tasksRouter(db));
app.use('/messages' , messagesRouter(db));

// MongoDB connection
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/codVedaLevel_3";
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB!");
    server.listen(3000, () => {
      console.log("🚀 Server running on http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
  });
