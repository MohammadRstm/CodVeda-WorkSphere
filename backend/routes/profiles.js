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

router.put('/update/info/:id' ,async (req , res) => {
  const id = req.params.id;
  try{
  const {name , age  , user_name , bio} = req.body;

  const [results] = await db.query(
    `
    Update Profiles
    set bio = ?
    where user_id = ?;

    Update Users 
    set name = ? , age = ? , username = ?
    where id = ?
    ` , [bio , id , name , age , user_name , id]);
    if (results.length === 0)
       return res.status(404).json({message : "User not found"});
      return res.status(200).json(results);
  }catch(err){
    return res.status(500).json({message : err.message});
  }
});

// router.put('/update/photo/:id', upload.single("photo"), (req, res) => {
//   const userId = req.params.id;
//   const newPhotoUrl = `../backend/uploads/${req.file.filename}`;

//   db.query(
//     `SELECT photo_url FROM Profiles WHERE user_id = ?`,
//     [userId],
//     (err, results) => {
//       if (err) return res.status(500).json({ error: err });

//       if (results.length === 0) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       const oldPhotoUrl = results[0].photo_url;

//       // Step 2: Delete old file from disk if it exists
//       if (oldPhotoUrl) {
//         const oldPath = path.join(__dirname, "..", oldPhotoUrl);
//         fs.unlink(oldPath, (err) => {
//           if (err) console.log("Old photo not found or already deleted:", err);
//         });
//       }

//       // Step 3: Update DB with new photo URL
//       db.query(
//         `UPDATE Profiles SET photo_url = ? WHERE user_id = ?`,
//         [newPhotoUrl, userId],
//         (err, result) => {
//           if (err) return res.status(500).json({ error: err });

//           res.status(200).json({ message: "Photo updated", url: newPhotoUrl });
//         }
//       );
//     }
//   );
// });
return router;
}
