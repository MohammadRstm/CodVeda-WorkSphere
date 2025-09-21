const express = require("express");
const auth = require("../middlewares/auth");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const router = express.Router();
const { Project, User, Department } = require("../models");

module.exports = () => {

  // GET ALL PROJECTS
  router.get("/", async (req, res) => {
    try {
      const projects = await Project.find({}, { _id: 1, name: 1 }).sort({ name: 1 });
      if (!projects || projects.length === 0) {
        return res.status(404).json({ message: "No projects found" });
      }
      res.status(200).json(projects);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // GET ALL ACCORDING TO WHO REQUESTED THEM
  router.get("/extend/departments", auth, async (req, res) => {
    const role = req.user.role;

    try {
      if (role === "admin") {
        const projects = await Project.aggregate([
          {
            $match: { name: { $ne: "demo" } },
          },
          {
            $addFields: {
              dep_id: { $toObjectId: "$dep_id" }, // ensure dep_id is ObjectId
            },
          },
          {
            $lookup: {
              from: "Departments",
              localField: "dep_id",
              foreignField: "_id",
              as: "department",
            },
          },
          { $unwind: "$department" },
          {
            $lookup: {
              from: "Users",
              let: { projId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$project_id", "$$projId"] },
                        { $eq: ["$role", "manager"] },
                      ],
                    },
                  },
                },
              ],
              as: "managers",
            },
          },
          { $unwind: "$managers" },
          {
            $project: {
              projId: "$_id",
              projName: "$name",
              deadline: 1,
              start_date: 1,
              dep_id: 1,
              depName: "$department.name",
              managerName: "$managers.name",
              managerId: "$managers._id",
            },
          },
          { $sort: { depName: 1, projName: 1 } },
        ]);
        console.log(projects)
        return res.status(200).json(projects);
      }else {
        // Manager / Employee
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const projects = await Project.aggregate([
          { $match: { _id: user.project_id } },
          {
            $lookup: {
              from: "departments",
              localField: "dep_id",
              foreignField: "_id",
              as: "department",
            },
          },
          { $unwind: "$department" },
          {
            $project: {
              projId: "$_id",
              projName: "$name",
              deadline: 1,
              depName: "$department.name",
            },
          },
        ]);

        if (!projects || projects.length === 0) {
          return res.status(404).json({ message: "User is not working in any project" });
        }

        return res.status(200).json(projects);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error, please try again later" });
    }
  });

  // GET A SPECIFIC PROJECT DETAILS
  router.get("/details/:id", auth, async (req, res) => {
    const projectId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(projectId))
      return res.status(400).json({ message: "Bad http request" });

    try {
      const project = await Project.findById(projectId).populate("dep_id", "name");
      if (!project) return res.status(404).json({ message: "Project not found" });

      const manager = await User.findOne({ project_id: projectId, role: "manager" });
      const tasks = await User.aggregate([
        { $match: { project_id: project._id } },
        { $unwind: "$tasks" },
        { $replaceRoot: { newRoot: "$tasks" } },
      ]);

      const response = {
        id: project._id,
        projectName: project.name,
        depName: project.dep_id.name,
        start_date: project.start_date,
        deadline: project.deadline,
        managerName: manager?.name,
        managerId: manager?._id,
        tasks,
      };

      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: err.message || "Server error" });
    }
  });

  // GET MORE DETAILS FOR A SPECIFIC PROJECT (TASKS)
  router.get("/progress/:id", async (req, res) => {
    const projectId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(projectId)){
      console.log("bad objectId")
      return res.status(400).json({ message: "Bad http request" });
    }

    try {
      const tasks = await User.aggregate([
        { $match: { project_id:new mongoose.Types.ObjectId(projectId) } },
        { $unwind: "$tasks" },
        { $project: { state: "$tasks.state" } },
      ]);

      if (!tasks || tasks.length === 0) return res.status(200).json({ ratio: 0.1 });
      const doneTasks = tasks.filter((t) => t.state === "done").length;
      res.status(200).json({ ratio: doneTasks / tasks.length });
    } catch (err) {
      console.log(err.message)
      res.status(500).json({ message: err.message || "Server error" });
    }
  });

  // ADD A NEW PROJECT
  // ADD A NEW PROJECT
  router.post("/addProject", auth, async (req, res) => {
    try {
      const { name, deadline, department, manager } = req.body.formData;

      // 1️⃣ Check if this manager already manages a project
      const existingManager = await User.findOne({ 
        _id: manager, 
        project_id: { $nin: [null , new mongoose.Types.ObjectId('68cc441dd3a1d8d8c410bd3f')] } 
      });

      if (existingManager) {
        return res
          .status(400)
          .json({ message: "This manager is already assigned to a project." });
      }

      
      const newProject = new Project({ 
        name, 
        deadline, 
        dep_id: department 
      });
      await newProject.save();

      // 3️⃣ Assign project to manager
      await User.findByIdAndUpdate(manager, { project_id: newProject._id });

      res.status(200).json(newProject);
    } catch (err) {
      res.status(500).json({ message: err.message || "Server error" });
    }
  });


  // GET PROJECT DETAILS FOR A SPECIFIC USER
  router.get("/details/user/:userId", auth, async (req, res) => {
    const userId = req.params.userId;
    const role = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "Bad http request" });

    try {
      const user = await User.findById(userId).populate("project_id dep_id");
      if (!user) return res.status(404).json({ message: "User not found" });

      let tasks;
      if (role === "employee") {
        tasks = user.tasks.filter((t) => t.state === "in Progress");
      } else {
        // manager
        const allUsers = await User.find(
          { project_id: user.project_id._id },
          { name: 1, username: 1, tasks: 1 } // only fetch what you need
        );

        tasks = allUsers.flatMap((u) =>
          u.tasks.map((t) => ({
            ...t.toObject(),        // convert Mongoose subdoc to plain object
            assigned_to: u.username,
            assigned_name: u.name,
          }))
        );
      }

      let managerName, managerId;
      
        const manager = await User.findOne({ project_id: user.project_id._id, role: "manager" });
        if (!manager) return res.status(404).json({ message: "Manager not found" });
        managerName = manager.name;
        managerId = manager._id;
      

      const response = {
        id: user.project_id._id,
        projectName: user.project_id.name,
        depName: user.dep_id.name,
        dep_id: user.dep_id._id,
        start_date: user.project_id.start_date,
        deadline: user.project_id.deadline,
        managerName,
        managerId,
        tasks,
      };

      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: err.message || "Server error" });
    }
  });

  // UPDATE A PROJECT
  router.put("/update/:id/:oldManager", auth, async (req, res) => {
    const projectId = req.params.id;
    const oldManagerId = req.params.oldManager;
    const { newName, newManager, newDeadline } = req.body;

    if (!newName || !newManager || !newDeadline) {
      return res.status(400).json({ message: "Missing arguments" });
    }

    try {
      await Project.findByIdAndUpdate(projectId, { name: newName, deadline: newDeadline });

      if (oldManagerId === newManager) {
        return res.status(200).json({ message: "Project updated, manager unchanged" });
      }

      const newManagerRecord = await User.findById(newManager);
      if (!newManagerRecord) return res.status(404).json({ message: "New manager not found" });

      const tempProjectId = newManagerRecord.project_id;
      await User.findByIdAndUpdate(newManager, { project_id: projectId });

      if (tempProjectId && !tempProjectId.equals(projectId)) {
        await User.findByIdAndUpdate(oldManagerId, { project_id: tempProjectId });
      } else {
        await User.findByIdAndUpdate(oldManagerId, { project_id: null });
      }

      return res.status(200).json({ message: "Project and managers updated successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message || "Something went wrong" });
    }
  });

  // DELETE A PROJECT
  router.delete("/delete", auth, async (req, res) => {
    const projectId = req.body.projectId;
    const defaultProject = new mongoose.Types.ObjectId("68cc441dd3a1d8d8c410bd3f"); // demo project

    try {
      await User.updateMany(
        { project_id: projectId, role: { $in: ["manager", "employee"] } },
        { project_id: defaultProject }
      );

      // Remove tasks from all users in the project
      await User.updateMany(
        { project_id: projectId },
        { $set: { tasks: [] } }
      );

      await Project.findByIdAndDelete(projectId);

      res.status(200).json({ message: "Project deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message || "Something went wrong" });
    }
  });

  return router;
};
