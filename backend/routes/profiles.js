const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require("path");
const fs = require("fs");

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
    db.query(
      `
      Select u.id , u.name , u.age , u.created_at , p.photo_url , p.bio
      from User u, Profiles p
      where u.id = ? and u.id = p.user_id
      ` ,[id],
      (err , results) =>{
        if (err) return res.status(500).json({error : err});

        if (results.length === 0)
          return res.status(404).json({message : 'User not found'});

        const userProfile = results[0];
        return res.status(200).json(userProfile)
      }
    )
});

router.put('/update/info/:id' , (req , res) => {
  const id = req.params.id;
  console.log(id)
  const {name , age , bio} = req.body;
  console.log(name + age + bio)

  db.query(
    `
    Update Profiles
    set bio = ?
    where user_id = ?;

    Update User 
    set name = ? , age = ? 
    where id = ?
    ` , [bio , id , name , age , id],
    (err , results) => {
      if (err) return res.status(500).json({error : err});
      if (results.affectedRows === 0)
        return res.status(404).json({message : 'User not found'});
      return res.status(200).json(results);
    }
  );

});

router.put('/update/photo/:id', upload.single("photo"), (req, res) => {
  const userId = req.params.id;
  const newPhotoUrl = `../backend/uploads/${req.file.filename}`;

  db.query(
    `SELECT photo_url FROM Profiles WHERE user_id = ?`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const oldPhotoUrl = results[0].photo_url;

      // Step 2: Delete old file from disk if it exists
      if (oldPhotoUrl) {
        const oldPath = path.join(__dirname, "..", oldPhotoUrl);
        fs.unlink(oldPath, (err) => {
          if (err) console.log("Old photo not found or already deleted:", err);
        });
      }

      // Step 3: Update DB with new photo URL
      db.query(
        `UPDATE Profiles SET photo_url = ? WHERE user_id = ?`,
        [newPhotoUrl, userId],
        (err, result) => {
          if (err) return res.status(500).json({ error: err });

          res.status(200).json({ message: "Photo updated", url: newPhotoUrl });
        }
      );
    }
  );
});


return router;
}
