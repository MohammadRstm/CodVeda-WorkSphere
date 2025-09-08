const express = require("express");
const router = express.Router();
const { Project } = require("../models"); // Sequelize model

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

