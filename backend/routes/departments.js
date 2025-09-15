// routes/departments.js
const express = require("express");
const router = express.Router();
const { Department } = require("../models"); // Sequelize model

module.exports = () => {
  // GET ALL DEPARTMENTS
  router.get("/allDepartments", async (req, res) => {
    try {
      const departments = await Department.findAll({
        attributes: ["id", "name"],
      });

      if (!departments || departments.length === 0) {
        return res.status(404).json({ message: "No departments found" });
      }

      res.status(200).json(departments);
    } catch (err) {
      res.status(500).json({ message: "Server error, please try again" });
    }
  });

  return router;
};
