const express = require("express");
const auth = require("../middlewares/auth");
const { getIO } = require("../socket"); // socket helper
const mongoose = require("mongoose");


module.exports = (db) => {
  const { User } = db;
  const router = express.Router();

  // ADD TASKS
  router.post("/addTasks", auth, async (req, res) => {
    const { tasks } = req.body;
    if (!tasks) return res.status(400).json({ message: "no tasks provided" });

    try {
      for (let [index, task] of tasks.entries()) {
        const { name, username, project, description, days_to_finish } = task;
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
          return res
            .status(404)
            .json({ message: `User of Task ${index + 1} does not exist` });
        }

        // Update user's project if needed
        if (!user.project_id || user.project_id.toString() !== project) {
          user.project_id = project;
        }

        if (!name) {
        return res
          .status(400)
          .json({ message: `Task ${index + 1} is missing a name` });
      }
        // Push the new task to user's tasks array
        const newTask = {
          name,
          description,
          days_to_finish,
          state: "in Progress",
        };
        console.log(newTask)
        user.tasks.push(newTask);
        await user.save();

        // Send live notification to user
        const addedTask = user.tasks[user.tasks.length - 1];
        getIO().to(user._id.toString()).emit("notification", {
          type: "task",
          userId: user._id,
          message: `You have received a new task: ${addedTask.name}`,
        });
      }

      res.status(201).json({ message: "Tasks created successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message || "Server error" });
    }
  });

  // UPDATE TASK (mark as done)
  router.put("/update", auth, async (req, res) => {
    const { taskId, managerId, projectId } = req.body;
    if (!taskId) return res.status(400).json({ message: "Task ID required" });

    try {
      // Find the user that has this task
      const user = await User.findOne({ "tasks._id": taskId });
      if (!user) return res.status(404).json({ message: "Task not found" });

      // Update the task state
      const task = user.tasks.id(taskId);
      task.state = "done";
      await user.save();

      // Check if there are any unfinished tasks for this project
      const unfinishedTasks = await User.aggregate([
        { $match: { "tasks.project_id":new mongoose.Types.ObjectId(projectId) } },
        { $unwind: "$tasks" },
        { $match: { "tasks.project_id":new mongoose.Types.ObjectId(projectId), "tasks.state": "in Progress" } },
      ]);

      if (unfinishedTasks.length > 0) {
        getIO().to(managerId.toString()).emit("notification", {
          type: "task",
          userId: managerId,
          message: "One of your employees submitted a task",
        });
      } else {
        getIO().to(managerId.toString()).emit("notification", {
          type: "task",
          userId: managerId,
          message: "Your Project is complete",
        });
      }

      res.status(200).json({ message: "Task successfully submitted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message || "Server error" });
    }
  });

  return router;
};
