const express = require('express');
const router = express.Router();

module.exports = (db) => {

router.get("/allUsers", (req, res) => {// get all users 
  db.query("SELECT * FROM User", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    return res.status(200).json(results);
  });
});

router.get('/allUsers/allInfo' , (req , res) =>{// get all users with all their info (deptName, project exct..)
  db.query(`Select u.id , u.name as user_name , u.username , u.role ,
                   d.name as dept_name , p.name as project_name
            From Users u , Projects p , Departments d
            Where u.dep_id = d.id and u.project_id = p.id
            order by u.name asc
          `, (err , results) =>{
            if (err) return res.status(500).json(err);
            
            return res.status(200).json(results);
          });
});


router.get("/user/:id", (req, res) => {// get specific user 
  const id = Number(req.params.id);
  if (Number.isNaN(id) || id <= 0)
    return res.status(400).json({ message: "Invalid or missing ID" });

  db.query("SELECT * FROM User WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (!results || results.length === 0)
      return res.status(404).json({ message: "User not found" });
    return res.status(200).json(results[0]); 
  });
});


router.post("/add", (req, res) => {// add new user 
  const { name, age } = req.body;

  if (!name || Number.isNaN(age) || age <= 0)
    return res
      .status(400)
      .json({ message: "Invalid or missing name or age" });

  db.query(
    "INSERT INTO User (name, age) VALUES (?, ?)",
    [name, age],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      const newUser = {id : results.insertId , age , name}
      return res.status(200).json(newUser);
    }
  );
});


router.put("/update", (req, res) => {// update user 
  const { id, name, age } = req.body;

  if (Number.isNaN(id) || id <= 0)
    return res.status(400).json({ message: "Invalid or missing ID" });

  if (!name || Number.isNaN(age) || age <= 0)
    return res
      .status(400)
      .json({ message: "Invalid or missing name or age" });

  db.query(
    "UPDATE User SET name = ?, age = ? WHERE id = ?",
    [name, age, id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.affectedRows === 0)
        return res.status(404).json({ message: "User not found" });
      return res.status(200).json(results);
    }
  );
});

router.delete("/delete/:id", (req, res) => {// delete user
  const id = Number(req.params.id);
  if (Number.isNaN(id) || id <= 0)
    return res.status(400).json({ message: "Invalid or missing ID" });

  db.query("DELETE FROM User WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.affectedRows === 0)
      return res.status(404).json({ message: "User not found" });
    return res.status(200).json(results);
  });
});

return router;

}