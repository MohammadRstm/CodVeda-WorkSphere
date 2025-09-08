// routes/profiles.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Import Sequelize models
const { User, Profile } = require("../models");

// Multer config for file upload
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

module.exports = () => {
  // GET SPECIFIC USER PROFILE
  router.get("/get/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const user = await User.findByPk(id, {
        attributes: ["id", "name", "age", "created_at"],
        include: [
          {
            model: Profile,
            attributes: ["photo_url", "bio"],
          },
        ],
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

      const user = await User.findByPk(id, { include: Profile });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update both User and Profile
      if (bio !== undefined) {
        await user.Profile.update({ bio });
      }
      await user.update({ name, age });

      res.status(200).json({ message: "Profile updated successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // UPLOAD USER'S PHOTO
  router.put("/update/photo/:id", upload.single("photo"), async (req, res) => {
    const userId = req.params.id;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newPhotoUrl = `/uploads/${req.file.filename}`;

    try {
      const profile = await Profile.findOne({ where: { user_id: userId } });
      if (!profile) {
        return res.status(404).json({ message: "User not found" });
      }

      // Delete old photo if it exists and is not the default
      if (
        profile.photo_url &&
        !profile.photo_url.includes("w3schools.com/howto/img_avatar.png")
      ) {
        const oldPath = path.join(
          __dirname,
          "..",
          profile.photo_url.replace("/uploads", "uploads")
        );
        fs.unlink(oldPath, (err) => {
          if (err) console.log("Old photo not found or already deleted:", err);
        });
      }

      await profile.update({ photo_url: newPhotoUrl });

      res.status(200).json({ url: newPhotoUrl });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};
