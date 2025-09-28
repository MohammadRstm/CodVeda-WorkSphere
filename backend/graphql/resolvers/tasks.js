import mongoose from 'mongoose';
import User from '../../models/User.js';
import { getIO } from '../../socket.js';

export default{
 Query: {
  allTasks: async (_, { userId }, { user }) => {
    if (!user) throw new Error("Not authenticated");

    if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");
    const userDoc = await User.findById(userId);
    if (!userDoc) throw new Error("User not found");
    return userDoc.tasks;
  },
},

Mutation: {
  addTask: async (_, {tasks}, { user }) => {
    if (!user) throw new Error("Not authenticated");
    try{
        tasks.forEach(async (task) => {
        const userDoc = await User.findOne({username : task.username});
        if (!userDoc) throw new Error("User not found");
        // set new project for employee 
        userDoc.project_id = new mongoose.Types.ObjectId(task.project);
        const newTask = {
          name : task.name,
          description : task.description,
          days_to_finish : task.days_to_finish,
          state : 'In Progress'
        }
        userDoc.tasks.push(newTask);  
        await userDoc.save(); 
        // send notification 
        getIO().to(userDoc._id.toString()).emit('notification' , {message : 'You have been assigned a new task'})
        });
      }catch(err){
        console.log(err);
        throw new Error('Server error');
      }
    
    return tasks;
  },

  updateTask: async (_, { userId , taskId}, { user }) => {
    if (!user) throw new Error("Not authenticated");

    const userDoc = await User.findById(userId);
    if (!userDoc) throw new Error("User not found");
    const taskIndex = userDoc.tasks.findIndex((t) => t._id.toString() === taskId);
    if (taskIndex === -1) throw new Error("Task not found");
    // set task state to done
    userDoc.tasks[taskIndex].state = 'done';
    await userDoc.save();

    // send noti for manager
    const manager = await User.findOne({project_id : userDoc.project_id});
    if(manager)
      getIO().to(manager._id.toString()).emit('notification' , {message : 'Employee '+ userDoc.name + ' submitted a task'});
    return userDoc.tasks[taskIndex];
  },

  deleteTask: async (_, { userId, taskId }, { user }) => {
    if (!user) throw new Error("Not authenticated");

    const userDoc = await User.findById(userId);
    if (!userDoc) throw new Error("User not found");

    userDoc.tasks = userDoc.tasks.filter((t) => t._id.toString() !== taskId);
    await userDoc.save();
    return userDoc.tasks;
  },
},

};
