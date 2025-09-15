const express = require("express");
const auth = require("../middlewares/auth");
const { Op } = require("sequelize");


const router = express.Router();
const { Project , sequelize, Sequelize , User , Task} = require("../models"); // Sequelize model
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

// GET ALL ACCORDING TO WHO REQUESTED THEM 
router.get('/extend/departments', auth, async (req, res) => {
  const role = req.user.role;

  if (role === 'admin') {
    try {
      const projects = await sequelize.query(`
        SELECT p.id AS projId, p.name AS projName, p.deadline,p.start_date , p.dep_id,  d.name AS depName  , m.name, m.id as managerId
        FROM Projects p
        JOIN Departments d ON p.dep_id = d.id
        JOIN Users m ON m.project_id = p.id
        WHERE m.role = 'manager' and p.name != 'demo'
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
  const id = Number(req.params.id);// project id 
  if (!id)
    res.status(400).json({message : 'Bad http request'});

    try{
      const projectDetails = await sequelize.query(`
          Select p.id, p.name as projectName , d.name as depName , p.start_date , p.deadline,
                 u.name as managerName 
          from Users u 
          Join projects p on u.project_id = p.id
          Join departments d on u.dep_id = d.id
          where p.id = ? and u.role = 'manager'
        ` , {
          replacements : [id],
          type : sequelize.QueryTypes.SELECT
        });

      if (!projectDetails ||  projectDetails.length === 0)
        res.status(404).json({message : "Project not found"});
      
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
// GET MORE DETAILS FOR A SPECIFIC PROJECT (TASKS)
router.get('/progress/:id' , async (req , res) =>{
  const defaultRatio = 0.1;
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
      return res.status(200).json({ratio : defaultRatio})
    let doneTasks = 0;
    for (let i = 0; i < tasks.length ; i++){
      if (tasks[i].state === 'done')
        doneTasks++;
    }
    return res.status(200).json({ratio : doneTasks / tasks.length});
  }catch(err){
    res.status(500).json({message : err.message || "Server error"});
  }
});

// ADD A NEW PROJECT
router.post('/addProject' , auth , async (req , res) =>{
  try{
  const {name , deadline , department , manager} = req.body.formData; 
  const inserted = await Project.create({
    name : name,
    deadline : deadline,
    dep_id : department
  });

  await User.update({project_id : inserted.id } , {where: { id: manager }} );
  res.status(200).json(inserted);
  }catch(err){
    res.status(500).json({message : err.message || "Server error"});
  }
});
// GET PROJECT DETAILS FOR A SPECIFIC USER
router.get('/details/user/:userId' ,auth , async (req ,res) =>{
  const userId = req.params.userId;
  const {role} = req.user;
  if (!userId)
    return res.status(400).json({message : 'Bad http request'});
  try{
    let project = null;
    let managerName = ""; // employees can't get their manager name directly
    if (role === 'manager'){
       project = await sequelize.query(`
       select p.id, p.name as projectName , d.name as depName , d.id as dep_id , p.start_date , p.deadline,
        u.name as managerName
       from users u
       Join Projects p on u.project_id = p.id
       Join Departments d on p.dep_id = d.id
       where u.id = ?
       ` , {
         replacements : [userId],
         type : sequelize.QueryTypes.SELECT
       });
    }else {// employee
      project = await sequelize.query(`
       select p.id, p.name as projectName , d.name as depName , d.id as dep_id , p.start_date , p.deadline
       from users u
       Join Projects p on u.project_id = p.id
       Join Departments d on p.dep_id = d.id
       where u.id = ?
       ` , {
         replacements : [userId],
         type : sequelize.QueryTypes.SELECT
       });

      managerName = await sequelize.query(`
      select m.name as managerName
      from Users m
      where m.role = 'manager' and m.project_id = ?
      ` , {
        replacements : [project[0].id],
        type : sequelize.QueryTypes.SELECT
      });
      if (!managerName || managerName.length === 0){
        return res.status(404).json({message : 'Manager not found'});
      }
    }
    if (!project || project.length === 0){
     return res.status(404).json({message : 'Project not found'});
    }
    let tasks = null;
    if (role === 'employee'){// get task for that employee
      tasks = await sequelize.query(`
        select t.name as taskName, t.days_to_finish , t.id , t.description, t.state,
          u.name as assignedTo, u.username
          from Tasks t 
          join users u on t.user_id = u.id 
          where u.id = ? and t.state = 'in Progress'
        ` , {
          replacements : [userId],
          type : sequelize.QueryTypes.SELECT
        });
    }else {// get all the tasks of the current project for the manager
      // we need to get the project that the manager is managing and get all the tasks that belong to that project
      tasks = await sequelize.query(`
        select t.name as taskName, t.days_to_finish , t.id , t.description, t.state,
        u.name as assignedTo, u.username
        from Tasks t
        join Users u on t.user_id = u.id
        where t.project_id = ?
        ` , {
          replacements : [project[0].id],
          type : sequelize.QueryTypes.SELECT
        });
    }

    if (!tasks || tasks.length === 0){
      res.status(200);
    }
    
    if (role === 'employee'){
      project[0] = {
        ...project[0],
        managerName : managerName[0].managerName
      }
    }
    const response = {
      ...project[0],
      tasks
    }
    res.status(200).json(response);
  }catch(err){
    res.status(500).json({message : err.message|| 'Server error'});
  }
});

router.put('/update/:id/:oldManager', auth, async (req, res) => {
  const projectId = req.params.id;
  const oldManagerId = req.params.oldManager;
  const { newName, newManager, newDeadline } = req.body;

  if (!newName || !newManager || !newDeadline) {
    return res.status(400).json({ message: 'Missing arguments' });
  }

  try {
    // Step 1: Update project info
    await Project.update(
      { name: newName, deadline: newDeadline },
      { where: { id: projectId } }
    );

    // Step 2: If oldManager == newManager, stop here
    if (oldManagerId == newManager) {
      return res.status(200).json({ message: 'Project updated, manager unchanged' });
    }

    // Step 3: Get the new manager’s current project
    const newManagerRecord = await User.findOne({ where: { id: newManager } });
    if (!newManagerRecord) {
      return res.status(404).json({ message: 'New manager not found' });
    }

    const tempProjectId = newManagerRecord.project_id; // Save old project of new manager

    // Step 4: Assign the updated project to the new manager
    await User.update({ project_id: projectId }, { where: { id: newManager } });

    // Step 5: Assign the old project of the new manager to the old manager (if it exists)
    if (tempProjectId && tempProjectId != projectId) {
      await User.update({ project_id: tempProjectId }, { where: { id: oldManagerId } });
    } else {
      // If new manager didn't have a project, clear old manager's assignment
      await User.update({ project_id: null }, { where: { id: oldManagerId } });
    }

    return res.status(200).json({ message: 'Project and managers updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Something went wrong' });
  }
});

router.delete('/delete', auth, async (req, res) => {
  const projectId = req.body.projectId; // send just id in body
  const defaultProject = 32; // id for the demo project

  try {
    // 1️⃣ Reassign manager & employees to demo project
    await User.update(
      { project_id: defaultProject },
      { where: { project_id: projectId, role: { [Op.or]: ['manager', 'employee'] } } }
    );

    // 2️⃣ Delete all related tasks
    await Task.destroy({ where: { project_id: projectId } });

    // 3️⃣ Delete the project itself
    await Project.destroy({ where: { id: projectId } });

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Something went wrong' });
  }
});


return router;
};


