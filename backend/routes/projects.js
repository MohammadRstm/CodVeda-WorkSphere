const express = require('express');
const router = express.Router();


module.exports = (db) =>{
router.get('/' ,async (req , res) =>{
    try{
        const [results] = await db.query('Select id , name From Projects');
        if (results.length === 0) return res.status(404).json({message : 'Server error, please try again'});
        return res.status(200).json(results);
    }catch(err){
        return res.status(500).json({message : err.message});
    }
});

return router;
}
