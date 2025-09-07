const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require("path");
const fs = require("fs");
const auth = require("../middlewares/auth");

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || "dsffj329ufdksafiw";
const JWT_EXPIRY = "1h";



const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage });

module.exports = (db) => {
// GET SPECIFIC USER
router.get('/get/:id' , (req , res) =>{
  const id = req.params.id;
  try{
  const [results] = db.query(
      `
      Select u.id , u.name , u.age , u.created_at , p.photo_url , p.bio
      from User u, Profiles p
      where u.id = ? and u.id = p.user_id
      ` ,[id])
      if (results.length === 0)
        res.status(404).json({message : 'User profile not found'});
      res.status(200).json(results[0]);
  }catch(err){
    res.status(500).json({message : err.message});
  }
  
});
// UPDATE USER'S PROFILE INFO
router.put('/update/info/:id' ,async (req , res) => {
  const id = req.params.id;
  try{
  const {name , age , bio} = req.body;

  const [results] = await db.query(
    `
    Update Profiles
    set bio = ?
    where user_id = ?;

    Update Users 
    set name = ? , age = ? 
    where id = ?
    ` , [bio , id , name , age , id]);
    if (results.length === 0)
       return res.status(404).json({message : "User not found"});
      return res.status(200).json(results);
  }catch(err){
    return res.status(500).json({message : err.message});
  }
});
// UPLOAD USRE'S PHOTO
router.put('/update/photo/:id', upload.single("photo"), async (req, res) => {
  const userId = req.params.id;
  console.log(userId)
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const newPhotoUrl = `/uploads/${req.file.filename}`; // public URL

  try {
    const [results] = await db.query(
      `SELECT photo_url FROM Profiles WHERE user_id = ?`,
      [userId]
    );

    if (results.length === 0) return res.status(404).json({ message: "User not found" });

    const oldPhotoUrl = results[0].photo_url;
    if (oldPhotoUrl) {
      const oldPath = path.join(__dirname, "..", oldPhotoUrl.replace('/uploads', 'uploads'));
      fs.unlink(oldPath, (err) => {
        if (err) console.log("Old photo not found or already deleted:", err);
      });
    }

    await db.query(
      `UPDATE Profiles SET photo_url = ? WHERE user_id = ?`,
      [newPhotoUrl, userId]
    );

    res.status(200).json({ url: newPhotoUrl });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
return router;
}
