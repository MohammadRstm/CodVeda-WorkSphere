import path from 'path';
import fs from 'fs';
import User from '../../models/User.js';

export default{
  Query: {
    getUserProfile: async (_, { id } , {user}) => {
      if (!user) throw new Error('Not authenticated');
      const fUser = await User.findById(id, {
        _id: 1,
        name: 1,
        age: 1,
        username : 1,
        created_at: 1,
        role : 1,
        "profile.bio": 1,
        "profile.photo_url": 1,
      })
      .populate({
      path: "dep_id",
      select: "name", // only get the department's name
    })
    .populate({
      path: "project_id",
      select: "name", // only get the project's name
    });
      if (!fUser) throw new Error("User profile not found");
      return fUser;
    },
  },

  Mutation: {
    updateUserProfile: async (_, { id, name, age, bio }) => {
      const user = await User.findById(id);
      if (!user) throw new Error("User not found");

      if (name !== undefined) user.name = name;
      if (age !== undefined) user.age = age;
      if (bio !== undefined) user.profile.bio = bio;

      await user.save();
      return user;
    },

   updateUserPhoto: async (_, { id, photo }) => {
  const user = await User.findById(id);
  if (!user) throw new Error("User not found");

  // photo is now an Upload type
  const { createReadStream, filename } = await photo;
  const stream = createReadStream();
  const filepath = path.join(__dirname, "../..", "uploads", Date.now() + "-" + filename);

  // Save file to server
  await new Promise((resolve, reject) => {
    const out = fs.createWriteStream(filepath);
    stream.pipe(out);
    out.on("finish", resolve);
    out.on("error", reject);
  });

  // Update user profile with new photo path
  user.profile.photo_url = `/uploads/${path.basename(filepath)}`;
  await user.save();

  return user;
},
},
};
