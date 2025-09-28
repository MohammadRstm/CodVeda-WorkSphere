const express = require("express");
const router = express.Router();
const { Department } = require("../models");

// GET all departments
router.get("/allDepartments", async (req, res) => {
  try {
    const departments = await Department.find({name : { $ne : 'Demo' }}).sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    console.error("Error fetching departments:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
