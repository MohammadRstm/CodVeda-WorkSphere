const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || "dsffj329ufdksafiw";
const JWT_EXPIRY = "1h";

const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // REGISTER
  router.post("/register", async (req, res) => {
    const defaultProjectId = 7;
    const defaultDepartmentId = 6;

    try {
      const { name, age, username, password } = req.body.user;
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Username & password required" });
      }

      const [userFound] = await db.query(
        "SELECT id FROM Users WHERE username = ?",
        [username]
      );
      if (userFound.length > 0) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const hash = await bcrypt.hash(password, SALT_ROUNDS);

      const [result] = await db.query(
        `INSERT INTO Users (name, username, age, password, dep_id, project_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, username, age, hash, defaultDepartmentId, defaultProjectId]
      );

      res.status(201).json({ userId: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // LOGIN
  router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      const [rows] = await db.query(
        "SELECT * FROM Users WHERE username = ?",
        [username]
      );
      if (rows.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role},
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
      const [results] = await db.query(
        `SELECT u.id, u.name AS user_name, u.username, u.role,
                d.name AS dept_name, p.name AS project_name, 
                u.dep_id, u.project_id
         FROM Users u
         JOIN Departments d ON u.dep_id = d.id
         JOIN Projects p ON u.project_id = p.id
         ORDER BY u.name ASC`
      );
      res.status(200).json(results);
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

      const [results] = await db.query(
        "SELECT name, username, age, dep_id, project_id, role, id FROM Users WHERE id = ?",
        [id]
      );

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(results[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
    // Promote user 
    router.put("/promote/:id/:role", auth, async (req, res) => {
    try {
      const role = req.user.role;
      if (role !== "admin") {
        return res.status(401).json({ message: "User not authorized" });
      }

      const promotedUserRole = req.params.role;
      const promotedUserId = req.params.id;

      let newRole = "";
      if (promotedUserRole === "admin" || promotedUserRole === "manager") {
        newRole = "admin";
      } else if (promotedUserRole === "employee") {
        newRole = "manager";
      } else {
        return res.status(401).json({ message: "Unauthorized role" });
      }

      const [results] = await db.query(
        `UPDATE Users SET role = ? WHERE id = ?`,
        [newRole, promotedUserId]
      );

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User promoted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE USER
  router.delete("/delete", auth, async (req, res) => {
    try {
      const id = req.user.id;
      const role = req.user.role;

      if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid or missing ID" });
      }

      if (role !== "admin") {
        return res.status(401).json({ message: "User not authorized" });
      }

      const [results] = await db.query("DELETE FROM Users WHERE id = ?", [id]);

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET EXTENDED USER INFO
  router.get("/user/extended/:id", async (req, res) => {
    try {
      const id = req.params.id;

      const [results] = await db.query(
        `SELECT u.id, u.name AS user_name, u.username, u.age, 
                d.name AS dep_name, p.name AS project_name, 
                u.role, u.created_at, pro.photo_url, pro.bio
         FROM Users u
         JOIN Departments d ON u.dep_id = d.id
         JOIN Projects p ON u.project_id = p.id
         JOIN Profiles pro ON pro.user_id = u.id
         WHERE u.id = ?`,
        [id]
      );

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(results[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
