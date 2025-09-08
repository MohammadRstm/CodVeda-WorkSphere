// routes/users.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || "dsffj329ufdksafiw";
const JWT_EXPIRY = "2h";

const express = require("express");
const router = express.Router();

module.exports = (db) => {
  const { User, Department, Project, Profile } = db; 

router.post("/register", async (req, res) => {
  const defaultProjectId = 7;
  const defaultDepartmentId = 6;

  try {
    const { name, age, username, password } = req.body.user;

    if (!username || !password) {
      return res.status(400).json({ message: "Username & password required" });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await User.create({
      name,
      username,
      age,
      password: hash,
      dep_id: defaultDepartmentId,
      project_id: defaultProjectId,
    });

    res.status(201).json({ userId: newUser.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// GET ALL USERS WITH INFO
router.get("/allUsers/allInfo", async (req, res) => {
  try {
    const users = await User.findAll({
  attributes: ["id", "name", "username", "role"], 
  include: [
    {
      model: Department,
      attributes: ["id", "name"], 
    },
    {
      model: Project,
      attributes: ["id", "name"], 
    },
  ],
  order: [["name", "ASC"]],
});


    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SPECIFIC USER
router.get("/user/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid or missing ID" });
    }

    const user = await User.findByPk(id, {
      attributes: ["id", "name", "username", "age", "dep_id", "project_id", "role"],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PROMOTE USER
router.put("/promote/:id/:role", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "User not authorized" });
    }

    const { id, role } = req.params;
    let newRole = "";

    if (role === "admin" || role === "manager") newRole = "admin";
    else if (role === "employee") newRole = "manager";
    else return res.status(401).json({ message: "Unauthorized role" });

    const [updated] = await User.update({ role: newRole }, { where: { id } });
    if (!updated) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User promoted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE USER
router.delete("/delete", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "User not authorized" });
    }

    const deleted = await User.destroy({ where: { id: req.user.id } });
    if (!deleted) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET EXTENDED USER INFO
router.get("/user/extended/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: Department, attributes: ["name"] },
        { model: Project, attributes: ["name"] },
        { model: Profile, attributes: ["photo_url", "bio"] },
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

return router;
}