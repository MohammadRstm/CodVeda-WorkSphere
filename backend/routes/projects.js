const express = require('express');
const router = express.Router();


module.exports = (db) =>{
router.get('/' , (req , res) =>{
    db.query('Select id , name From Projects' ,
        (err , results) =>{
            if (err) return res.status(500).json({error : err});

            return res.status(200).json(results);
        }
    );
});

return router;
}
