const express = require("express");
const auth = require("../middlewares/auth");

const router = express.Router();
const { Project, Department } = require("../models"); // Sequelize model

module.exports = () => {
  // GET ALL PROJECTS
  router.get("/", async (req, res) => {
    try {
      const projects = await Project.findAll({
        attributes: ["id", "name"], // only fetch id and name
      });

      if (!projects || projects.length === 0) {
        return res.status(404).json({ message: "No projects found" });
      }

      res.status(200).json(projects);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};

// GET ALL ACCORDING TO WHO REQUESTED THEM 
router.get('/extend/departments', auth, async (req, res) => {
  const role = req.user.role;

  if (role === 'Admin') {
    try {
      const projects = await sequelize.query(`
        SELECT p.id AS projId, p.name AS projName, p.deadline, d.name AS depName
        FROM Projects p
        JOIN Departments d ON p.dep_id = d.id
        ORDER BY d.name, p.name
      `, { type: sequelize.QueryTypes.SELECT });

      res.status(200).json(projects);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error, please try again later" });
    }

  } else { // Manager / Employee
    try {
      const projects = await sequelize.query(`
        SELECT p.id AS projId, p.name AS projName, p.deadline, d.name AS depName
        FROM Projects p
        JOIN Departments d ON p.dep_id = d.id
        JOIN Users u ON u.project_id = p.id
        WHERE u.id = ?
        ORDER BY d.name, p.name
      `, {
        replacements: [req.user.id],
        type: sequelize.QueryTypes.SELECT
      });

      if (projects.length === 0) {
        return res.status(404).json({ message: 'User is not working in any project' });
      }

      res.status(200).json(projects);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error, please try again later" });
    }
  }
});




