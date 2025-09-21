const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

module.exports = (db) => {
  const { User } = db;

  // Multer config for file upload
  const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  const upload = multer({ storage });

  // GET SPECIFIC USER PROFILE
  router.get("/get/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const user = await User.findById(id, {
        _id: 1,
        name: 1,
        age: 1,
        created_at: 1,
        "profile.bio": 1,
        "profile.photo_url": 1,
      });

      if (!user) {
        return res.status(404).json({ message: "User profile not found" });
      }

      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // UPDATE USER'S PROFILE INFO
  router.put("/update/info/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const { name, age, bio } = req.body;
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (bio !== undefined) {
        user.profile.bio = bio;
      }
      if (name !== undefined) user.name = name;
      if (age !== undefined) user.age = age;

      await user.save();
      res.status(200).json({ message: "Profile updated successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // UPLOAD USER'S PHOTO
  router.put("/update/photo/:id", upload.single("photo"), async (req, res) => {
    const userId = req.params.id;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const newPhotoUrl = `/uploads/${req.file.filename}`;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Delete old photo if it exists and is not the default
      if (
        user.profile.photo_url &&
        !user.profile.photo_url.includes("w3schools.com/howto/img_avatar.png")
      ) {
        const oldPath = path.join(
          __dirname,
          "..",
          user.profile.photo_url.replace("/uploads", "uploads")
        );
        fs.unlink(oldPath, (err) => {
          if (err)
            console.log("Old photo not found or already deleted:", err.message);
        });
      }

      user.profile.photo_url = newPhotoUrl;
      await user.save();

      res.status(200).json({ url: newPhotoUrl });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};
