import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../../models/User.js";
import Department from "../../models/Department.js";
import Project from "../../models/Project.js";
import { getIO } from "../../socket.js";

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || "dsffj329ufdksafiw";
const JWT_EXPIRY = "2h";

export default{
Query: {
  allUsers: async (_, __, { user }) => {
    if (!user) throw new Error("Not authenticated");
    return await User.find().populate("dep_id project_id");
  },

  userById: async (_, { id }, { user }) => {
    if (!user) throw new Error("Not authenticated");

    const userDoc = await User.findById(new mongoose.Types.ObjectId(id)).populate("dep_id project_id");
    if (!userDoc) throw new Error("User not found");
    return userDoc;
  },

  allEmployees: async (_, __, { user }) => {
    if (!user) throw new Error("Not authenticated");
    return await User.find({ role: "employee" });
  },

  allManagers: async (_, __, { user }) => {
    if (!user) throw new Error("Not authenticated");
    return await User.find({ role: "manager" }).populate("project_id dep_id");;
  },
},



Mutation: {
  register: async (_, { input }) => {
    const defaultProjectId = new mongoose.Types.ObjectId("64cc441dd3a1d8d8c410bd32");
    const defaultRole = "employee";

    const existingUser = await User.findOne({ username: input.username });
    if (existingUser) throw new Error("Username already exists");
    
    const hash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const dep = await Department.findById({ _id : new mongoose.Types.ObjectId(input.department)});
    if (!dep) throw new Error("Department not valid");

    const newUser = new User({
      name: input.name,
      username: input.username,
      age: input.age,
      role: defaultRole,
      password: hash,
      dep_id: dep._id,
      project_id: defaultProjectId,
    });

    await newUser.save();
    return newUser;
  },

  login: async (_, { username, password }) => {
    const user = await User.findOne({ username });
    if (!user) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    return { token, user };
  },

  promoteUser: async (_, { id }, { user }) => {
    if (!user) throw new Error("Not authenticated");
    if (user.role !== 'admin') throw new Error('User not permitted');

    const targetUser = await User.findById(id);
    if (!targetUser) throw new Error("User not found");

    let newRole;
    if (targetUser.role === "employee") {
      const unfinishedTasks = targetUser.tasks.some((t) => t.state !== "done");
      if (unfinishedTasks) throw new Error("Employee has unfinished tasks");
      targetUser.tasks = [];
      newRole = "manager";
    } else if (targetUser.role === "manager") {
      if (targetUser.project_id) throw new Error("Manager has unfinished project");
      newRole = "admin";
    } else throw new Error("Admin cannot be promoted");

    targetUser.role = newRole;
    await targetUser.save();

    // send notification to target user
    getIO().to(id.toString()).emit('notification' , {message : 'Hooray!! You have been promoted'});
    return targetUser;
  },

  demoteUser: async (_, { id }, { user, io }) => {
    if (!user) throw new Error("Not authenticated");
    if (user.role !== 'admin') throw new Error('User not permitted');

    const targetUser = await User.findById(id);
    if (!targetUser) throw new Error("User not found");

    let newRole;
    if (targetUser.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount === 1) throw new Error("Cannot demote the only admin");
      newRole = "manager";
    } else if (targetUser.role === "manager") {
      if (targetUser.project_id) throw new Error("Manager has unfinished project");
      newRole = "employee";
    } else throw new Error("Employee cannot be demoted further");

    targetUser.role = newRole;
    await targetUser.save();

    // send noti
    getIO().to(id.toString()).emit('notification' , {message : 'You have been demoted'});

    return targetUser;
  },

  deleteUser: async (_, { id }, { user }) => {
    if (!user) throw new Error("Not authenticated");
    if (user.role !== 'admin') throw new Error('User not permitted');

    const targetUser = await User.findById(id);
    if (targetUser.role === 'admin'){
      const countAdmins = await User.countDocuments({role : 'admin'});
      if (countAdmins === 1) throw new Error("Can't fire the only admin");
    }else if (targetUser.role === 'manager'){
      if (targetUser.project_id) throw new Error("Manager still have'nt submitted their project");
    }else{// employee
      targetUser.tasks.forEach((task) =>{
        if (task.state === 'In Progress') throw new Error('Employee still have task(s) not done');
      });
    }
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) throw new Error("User not found");
    return deleted;
  },
},

};
