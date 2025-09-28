import User from '../../models/User.js';
import Project from '../../models/Project.js';
import Department from '../../models/Department.js';
import mongoose from 'mongoose';
import { getIO } from '../../socket.js';

export default {
 Query: {
  allProjects: async (_, __, { user }) => {
    if (!user) throw new Error("Not authenticated");

    const projects = await Project.find().sort({ name: 1 }).populate("dep_id", "name");
    const managers = await User.find({ role: "manager", project_id: { $ne: null } });

    return projects.map((proj) => {
      const manager = managers.find((m) => m.project_id?.toString() === proj._id.toString());
      return {
        _id: proj._id,
        name: proj.name,
        dep_id: proj.dep_id,
        managerName: manager?.name || null,
        managerId: manager?._id || null,
        start_date: proj.start_date,
        deadline: proj.deadline,
      };
    });
  },

  projectDetails: async (_, { id }, { user }) => {
    if (!user) throw new Error("Not authenticated");
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Bad request");

    const userInfoArray = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "Projects",      
          localField: "project_id",
          foreignField: "_id",
          as: "project"
        }
      },
      {
        $lookup: {
          from: "Departments",   
          localField: "dep_id",
          foreignField: "_id",
          as: "department"
        }
      }
   ]);
   const userInfo = userInfoArray[0];
   if(!userInfo.project[0]) return;// user wasn't assigned a project yet 
   // manager name and tasks differ in the way we query them when the user is either a manager or a employee
   let managerName = "";
   let tasks = [];
   let managerId = "";

   if (user.role === 'employee'){//
      const manager = await User.findOne({role : 'manager' , project_id : userInfo.project[0]._id});
      if(!manager) throw new Error('Manager not found');
      managerName = manager.name;
      managerId = manager._id;
      tasks = userInfo.tasks.filter((t) => t.state !== 'done');// only get undone tasks
   }else if (user.role === 'manager'){
    managerName = userInfo.name;
    managerId = userInfo._id;
    tasks = await User.aggregate([
      { $match: { role: "employee", project_id: userInfo.project[0]._id } },
      { $unwind: "$tasks" },     
      {
        $addFields: {
          "tasks.username": "$username"   // inject username into each task
        }
      },
      { $replaceRoot: { newRoot: "$tasks" } } 
    ]);
   }

    return {
      id: userInfo.project[0]._id,
      projectName: userInfo.project[0].name,
      depName: userInfo.department[0].name,
      dep_id : userInfo.department[0]._id,
      start_date: userInfo.project[0].start_date,
      deadline: userInfo.project[0].deadline,
      managerName,
      managerId,
      tasks,
    };
  },

  projectProgress: async (_, { projectId }, { user }) => {
    if (!user) throw new Error("Not authenticated");

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error("Invalid project ID");
    }

    const tasks = await User.aggregate([
      { $match: { project_id: new mongoose.Types.ObjectId(projectId) } },
      { $unwind: "$tasks" },
      { $project: { state: "$tasks.state" } },
    ]);

    if (!tasks || tasks.length === 0) return 0.1;

    const doneTasks = tasks.filter((t) => t.state === "done").length;
    return doneTasks / tasks.length;
  },

},
  Mutation : {
    addProject : async (_ , {formData} , {user}) => {
      let newProject;
      try{
        if (user.role !== 'admin') throw new Error('User not autorized');
        // add new project
        newProject = new Project({
          name : formData.name ,
          deadline : formData.deadline,
          start_date : new Date(),
          dep_id : new mongoose.Types.ObjectId(formData.department)
        });
        await newProject.save();
        // assign selected manager the project
        await User.updateOne({role : 'manager' , _id : new mongoose.Types.ObjectId(formData.manager)} , {
          $set : {
            project_id : newProject
          }
        });

        // notify manager
        getIO().to(formData.manager.toString()).emit('notification' , {message : 'You have been assigned a new project'});
        

    }catch(err){
      console.log(err)
      throw new Error('Server error');
    }
      return newProject;
    },

    deleteProject : async (_ , {id} , {user}) => {
      try{
        // authenticate user
        if(!user) throw new Error('User not authenticated');
        const project = await Project.findById(new mongoose.Types.ObjectId(id));
        if(!project) throw new Error('Project not found');

        //remove project
        await Project.deleteOne({_id : new mongoose.Types.ObjectId(id)});
        // remove project from manager
        await User.updateOne({project_id : new mongoose.Types.ObjectId(id) , role : 'manager'} , {$set : {project_id : null}});
        // remove project & tasks from users 
        const response = await User.updateMany({project_id : new mongoose.Types.ObjectId(id) , role : 'employee'} ,
         {$set : {project_id : null , tasks : [] }} , { strict: false });

        // notify manager
        const manager = await User.findOne({role : 'manager' , project_id : project._id});
        getIO().to(manager._id.toString()).emit('notification' , {message : 'Your project got deleted'});
         
      }catch(err){
        console.log(err)
        throw new Error('Server error');
      }
    },

    updateProject : async(_ , {id , newName , newManager , oldManager , newDeadline} , {user}) =>{
      try{
        if(!user) throw new Error('User not authenticated');
        const newMng = new mongoose.Types.ObjectId(newManager);
        const oldMng = new mongoose.Types.ObjectId(oldManager);
        const project_id = new mongoose.Types.ObjectId(id);

        const newDeadLine = new Date(newDeadline);

        const project = await Project.findById(project_id);
        if(!project) throw new Error('Project not found');
        // update project
        await Project.updateOne({_id : project_id} , {$set : {deadline : newDeadLine , name : newName}});
        // switch projects between managers
        // find the project of new manager and set project_id of old mng to it
        const project_new_mng = await User.findOne({ _id: newMng }, { project_id: 1, _id: 1 });
        await User.updateOne({_id : oldMng} , {$set : {project_id : project_new_mng.project_id}});
        // set the project to new manager
        await User.updateOne({_id : newMng} , {$set : {project_id : project_id}});

        return project;
      }catch(err){
        console.log(err);
        throw new Error('Server error');
      }
    },
    submitProject : async (_ , {manager , projectId} , {user}) =>{
      if (!user) throw new Error('User not authenticated');
      try{
        // remove project for manager
        const mngr = await User.findById(manager);
        if(!mngr) throw new Error('Manager not found');
        mngr.project_id = null;
        await mngr.save();
        // remove project for employees and their tasks set to empty again
        const employees = await User.find({project_id : new mongoose.Types.ObjectId(projectId) , role : 'employee'},);
      for (const emp of employees) {
        emp.project_id = null;
        emp.tasks = [];
        await emp.save(); 
      }
      }catch(err){
        throw new Error('Server error');
      }
    }
  }
};
