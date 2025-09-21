const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const taskSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  days_to_finish: { type: Number, default: 0 },
  state: { type: String, default: "In Progress" },
});

const profileSchema = new Schema(
  {
    bio: { type: String, default: "Hello World!" },
    photo_url: { type: String, default: "https://www.w3schools.com/howto/img_avatar.png" },
  },
  { _id: false } 
);

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, default: null },
    dep_id: { type: Types.ObjectId, ref: "Department" }, 
    project_id: { type: Types.ObjectId, ref: "Project" },
    role: { type: String, enum: ["employee", "manager", "admin"], default: "employee" },
    created_at: { type: Date, default: Date.now },
    profile: { type: profileSchema, default: () => ({}) },
    tasks: { type: [taskSchema], default: [] },  
  },
  {
    collection: "Users", 
  }
);

module.exports = model("User", userSchema);
