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

// // GET a single department by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const department = await Department.findById(req.params.id);
//     if (!department) return res.status(404).json({ message: "Department not found" });
//     res.json(department);
//   } catch (err) {
//     console.error("Error fetching department:", err.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // CREATE a new department
// router.post("/", async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name) return res.status(400).json({ message: "Name is required" });

//     const existing = await Department.findOne({ name });
//     if (existing) return res.status(400).json({ message: "Department already exists" });

//     const newDepartment = new Department({ name });
//     await newDepartment.save();

//     res.status(201).json(newDepartment);
//   } catch (err) {
//     console.error("Error creating department:", err.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // UPDATE a department
// router.put("/:id", async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name) return res.status(400).json({ message: "Name is required" });

//     const updated = await Department.findByIdAndUpdate(
//       req.params.id,
//       { name },
//       { new: true } // return updated doc
//     );

//     if (!updated) return res.status(404).json({ message: "Department not found" });

//     res.json(updated);
//   } catch (err) {
//     console.error("Error updating department:", err.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // DELETE a department
// router.delete("/:id", async (req, res) => {
//   try {
//     const deleted = await Department.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: "Department not found" });
//     res.json({ message: "Department deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting department:", err.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

module.exports = router;
