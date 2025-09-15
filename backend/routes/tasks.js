const express = require("express");
const auth = require("../middlewares/auth");
const { FaTrophy } = require("react-icons/fa");
const { User , Task} = require("../models");


const router = express.Router();


module.exports = () =>{

    router.post('/addTasks' ,auth , async (req , res) =>{
        const {tasks} = req.body;
        if (!tasks)
            res.status(400).json({message : "no tasks provided"});
    try {
    for (let [index, task] of tasks.entries()) {
      const { name, username, project, description , days_to_finish} = task;

      // Find user by username
      const user = await User.findOne({
        attributes: ["id"],
        where: { username: username }
      });

      if (!user) {
        return res
          .status(404)
          .json({ message: `User of Task ${index + 1} does not exist` });
      }else{
        await User.update({project_id : project} , {where : {username}})
      }

      await Task.create({
        name,
        user_id: user.id,
        description,
        project_id: project,
        days_to_finish
      });
    }

    res.status(201).json({ message: "Tasks created successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

router.put('/update' , auth ,  async (req , res) =>{
    const id = req.body.taskId;
    try{
        await Task.update({state : 'done'} , {where : {id}});
        res.status(200).json({message : 'Task succeessfully submited'});
    }catch(err){
        console.error(err);
        res.status(500).json({ message: err.message || "Server error" });
    }
});

    return router;
}