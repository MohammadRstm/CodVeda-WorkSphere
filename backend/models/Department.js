// models/Department.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const departmentSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  {
    collection: "Departments",
  }
);

export default model("Department", departmentSchema);
