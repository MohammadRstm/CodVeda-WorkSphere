const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const departmentSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  {
    collection: "Departments",
  }
);

module.exports = model("Department", departmentSchema);
