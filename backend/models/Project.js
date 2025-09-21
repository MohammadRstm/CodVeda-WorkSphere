const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const projectSchema = new Schema(
  {
    name: { type: String, required: true },
    start_date: { type: Date, default: Date.now },
    deadline: { type: Date, required: true },
    dep_id: { type: Types.ObjectId, ref: "Department", required: true },
  },
  {
    collection: "Projects", 
  }
);

module.exports = model("Project", projectSchema);
