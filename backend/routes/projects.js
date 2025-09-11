const express = require("express");
const auth = require("../middlewares/auth");

const router = express.Router();
const { Project , sequelize, Sequelize} = require("../models"); // Sequelize model
const { FaTrophy } = require("react-icons/fa");

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

  if (role === 'admin') {
    try {
      const projects = await sequelize.query(`
        SELECT p.id AS projId, p.name AS projName, p.deadline,p.start_date,  d.name AS depName , m.name
        FROM Projects p
        JOIN Departments d ON p.dep_id = d.id
        JOIN Users m ON m.project_id = p.id
        WHERE m.role = 'manager'
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
// GET A SPECIFIC PROJECT DETAILS
router.get('/details/:id' , auth ,async (req , res) =>{
  const id = Number(req.params.id);
  if (!id)
    res.status(400).json({message : 'Bad http request'});

    try{
      const projectDetails = await sequelize.query(`
          Select p.id, p.name as projectName , d.name as depName , p.start_date , p.deadline,
                 u.name as managerName 
          from Projects p 
          Join users u on u.project_id = p.id
          Join departments d on p.dep_id = d.id
          where p.id = ?
        ` , {
          replacements : [id],
          type : sequelize.QueryTypes.SELECT
        });

      if (!projectDetails ||  projectDetails.length === 0)
        res.status(404).json({message : "Project not found"});
      console.log(projectDetails)
      const taskDetails = await sequelize.query(`
        select t.name as taskName, t.days_to_finish , t.id , t.description, t.state,
        u.name as assignedTo, u.username
        from Tasks t 
        Join users u on t.user_id = u.id
        where t.project_id = ?
        `, {
          replacements : [id],
          type : sequelize.QueryTypes.SELECT
        });

      const response = {
        ...projectDetails[0],
        tasks : taskDetails
      }

      res.status(200).json(response);
    }catch(err){
      res.status(500).json({message : err.message || "Server error"});
    }
});

router.get('/progress/:id' , async (req , res) =>{
  const projectId = Number(req.params.id);
  if (!projectId)
    res.status(400).json({message : "Bad http request"});
  try{
    // get the states of the tasks which belong to the project requested
    const tasks = await sequelize.query(`
        Select state
        from tasks
        where project_id = ?
      `, {
        replacements : [projectId],
        type : sequelize.QueryTypes.SELECT
      });
    if (!tasks || tasks.length === 0)
      return res.status(404).json({message : 'No tasks for this project'})
    let doneTasks = 0;
    for (let i = 0; i < tasks.length ; i++){
      if (tasks[i].state === 'done')
        doneTasks++;
    }
    console.log
    return res.status(200).json({ratio : doneTasks / tasks.length});
  }catch(err){
    res.status(500).json({message : err.message || "Server error"});
  }
});




