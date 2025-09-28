import Department from '../../models/Department.js';
export default{
  Query: {
    allDepartments: async () => {
      try {
        return await Department.find({ name: { $ne: "Demo" } }).sort({ name: 1 });
      } catch (err) {
        throw new Error("Error fetching departments: " + err.message);
      }
    },
  },
};
