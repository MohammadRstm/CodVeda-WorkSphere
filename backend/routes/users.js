const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");
const { getIO } = require("../socket"); // socket helper
const express = require("express");
const mongoose = require("mongoose");

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || "dsffj329ufdksafiw";
const JWT_EXPIRY = "2h";

module.exports = (db) => {
  const { User, Department, Project , Message} = db;
  const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const defaultProjectId = new mongoose.Types.ObjectId("64cc441dd3a1d8d8c410bd32"); // demo project
  const defaultRole = "employee";

  try {
    const { name, age, username, password, department } = req.body.user;
    if (!username || !password)
      return res.status(400).json({ message: "Username & password required" });

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(409).json({ message: "Username already exists" });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const dep_id = await Department.findOne({name : department});
    if (!dep_id)
      return res.status(400).json({message : 'Department not valid'});

    const newUser = new User({
      name,
      username,
      age,
      role: defaultRole,
      password: hash,
      dep_id : dep_id.id,
      project_id: defaultProjectId,
    });

    await newUser.save();
    res.status(201).json({ userId: newUser._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


  // LOGIN
  router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
      res.status(200).json({ message: "Login successful", token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET ALL USERS WITH INFO
  router.get("/allUsers/allInfo", async (req, res) => {
    try {
      const users = await User.find({}, "name username role dep_id project_id")
        .populate("dep_id", "name")
        .populate("project_id", "name")
        .sort({ name: 1 });

      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // GET ALL EMPLOYEES
  router.get("/all/employees", async (req, res) => {
    try {
      const employees = await User.find({ role: "employee" });
      res.status(200).json(employees);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // GET SPECIFIC USER
  router.get("/user/:id", async (req, res) => {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid or missing ID" });

      const user = await User.findById(id, "name username age dep_id project_id role");
      if (!user) return res.status(404).json({ message: "User not found" });

      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// PROMOTE USER
router.put("/promote/:id/:role", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "User not authorized" });
    }

    const userId = req.params.id;
    const currentRole = req.params.role.toLowerCase();
    let newRole;

    if (currentRole === "employee") {
      // Check if employee has unfinished tasks
      const employee = await User.findById(userId, "tasks");
      if (!employee) return res.status(404).json({ message: "User not found" });

      const hasUnfinishedTasks = employee.tasks.some(
        (t) => t.state !== "done"
      );
      if (hasUnfinishedTasks) {
        return res.status(400).json({
          message:
            "This employee still has unfinished tasks and cannot be promoted.",
        });
      }

      // Clear tasks since all are done
      employee.tasks = [];
      await employee.save();

      newRole = "manager";
    } else if (currentRole === "manager") {
      const manager = await User.findById(userId , "project_id");
      if (!manager) return res.status(404).json({message :"User not found"});

      const hasUNfinishedProject = manager.project_id ? true : false;
      if (hasUNfinishedProject)
        return res.status(400).json({message : 'Manager has an unfinished project!'});
      // after submission project_id is set to null automatically so no need to set it here

      newRole = "admin";
    } else if (currentRole === "admin") {
      return res
        .status(400)
        .json({ message: "Admin cannot be promoted further" });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updated = await User.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { role: newRole }
    );

    if (updated.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "User not found or already promoted" });
    }

    // 🔔 Send promotion notification via socket
    getIO().to(userId.toString()).emit("notification", {
      message: `You have been promoted to a ${newRole}`,
      userId,
      type: "Promotion",
    });

    res
      .status(200)
      .json({ message: `User promoted to ${newRole} successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// DMOTE USER
router.put('/demote/:id/:role' , auth , async (req , res) =>{
  const {id , role} = req.params;
  if (!id || !role)
    return res.status(400).json({message :'Bad http request'});
  try{
    const userRole = req.user.role;
    if (userRole !== 'admin')
      return res.status(403).json({message : 'User not authorized'});
    let newRole = "";

    if (role === 'admin'){
      const adminCount = await User.countDocuments({role : 'admin'});
      if (adminCount === 1){
        return res.status(400).json({message : 'You cannot demote the only admin'});
      }
      newRole = 'manager'
    }else if (role === 'manager'){
      const manager = await User.findById(id , "project_id");
      if (!manager) return res.status(404).json({message :"User not found"});

      const hasUNfinishedProject = manager.project_id ? true : false;
      if (hasUNfinishedProject)
        return res.status(400).json({message : 'Manager has an unfinished project!'});
      newRole = 'employee';
    }else if(role === 'employee'){
      return res.status(400).json({message : 'Employees cannot be demoted furthure!'});
    }else{
      return res.status(400).json({message : 'Invalid role'});
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const result = await User.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { role: newRole }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    getIO().to(id.toString()).emit("notification", {
      message: `You have been demoted to a ${newRole}`,
      id,
      type: "Demotion",
    });
    res.status(200).json({message : 'User demoted successfully'});
  }catch(err){
    res.status(500).json({message : 'Server error'});
    console.log(err.message);
  }
});

  // DELETE USER
  router.delete("/delete/:id", auth, async (req, res) => {
    try {
      if (req.user.role !== "admin") return res.status(401).json({ message: "User not authorized" });

      if (req.user.role === 'admin'){
        const adminCount = await User.countDocuments({role : 'admin'});
        if (adminCount === 1){
          return res.status(400).json({message : 'You cannot fire the only admin'});
        }
      }

      const deleted = await User.deleteOne({ _id: req.params.id });
      if (deleted.deletedCount === 0) return res.status(404).json({ message: "User not found" });

      res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET EXTENDED USER INFO
  router.get("/user/extended/:id", async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .populate("dep_id", "name")
        .populate("project_id", "name");

      if (!user) return res.status(404).json({ message: "User not found" });
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET ALL MANAGERS
  router.get("/managers", async (req, res) => {
    try {
      const managers = await User.find({ role: "manager" });
      if (!managers || managers.length === 0)
        return res.status(404).json({ message: "No managers in chosen department" });

      res.status(200).json(managers);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // GET ALL MANAGERS AND EMPLOYEES WITH THEIR PROFILE PICS
  router.get("/managers/employees/profiles/:id", async (req, res) => {
    try {
      const ownId = req.params.id;
      const users = await User.find(
        { _id: { $ne: ownId }, role: { $ne: "admin" } },
        "name role _id profile"
      );
      res.status(200).json(
        users.map((u) => ({
          photo_url: u.profile?.photo_url || "",
          name: u.name,
          role: u.role,
          id: u._id,
        }))
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: err.message });
    }
  });

  // SUBMITTING THE PROJECT OF THE MANAGER
  router.put('/submitProject/:managerId/:projectId' , auth ,async (req , res) =>{
    try{
      const {managerId , projectId} = req.params;
      // set manager's and employee's project_id to null as its done
      await User.updateMany({project_id : projectId} , {$set : {project_id : null}});

      res.status(200).json({message : 'Project submitted successfully'});
    }catch(err){
      res.status(500).json({message : err.message});
      console.log(err.message);
    }
  })

  // FOR MESSAGE SENDING AND RECEIVING
  router.post("/messages/send/:recipient", auth, async(req, res) => {
    const recipientId = req.params.recipient;
    const {message} = req.body;

    try{
      // save message in db
      const newMessage = new Message({
        senderId : req.user.id,
        receiverId : recipientId,
        message,
        sentAt : new Date()
      });
      await newMessage.save();
      // send notification about new message to recipient
      getIO().to(recipientId.toString()).emit("message", {
        userId: req.user.id,
        type: "message",
        message,
      });
      res.status(200).json({ success: "true" });
    }catch(err){
      console.log(err.message);
      res.status(500).json({message : 'Server error'});
    }
  });
  return router;
};
