const express = require('express');
const router = express.Router();


module.exports = (db) =>{
router.get('/' , async (req , res) =>{
    try {
    const [departments] = await db.query('Select id , name From Departments');
    if (departments.length === 0)
        return res.status(500).json({message : 'Server error, please try again'});
    return res.status(200).json({departments : departments});
    }catch(err){
        return res.status(500).json({message : 'Server error , please try again'});
    }
});
return router;
}
