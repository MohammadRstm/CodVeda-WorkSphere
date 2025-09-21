const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


module.exports = (db) =>{
const {Message} = db;
    
// router.post('/saveMessage/:receivedId/:senderId' , async (req , res) =>{
//     const chat = req.body.chat;
//     const {receivedId , senderId} = req.params;
//     try{
//       if (chat && receivedId && senderId){
//         await Promise.all(
//             chat.map(async (mssg) =>{
//                 const newMessage = new Message({
//                     senderId,
//                     receivedId,
//                     message : mssg.text,
//                     sentAt : mssg.time
//                 });
//                 newMessage.save();
//             })
//         );
//         res.status(200).json({messages : 'Messages saved'});
//       }else{
//         res.status(400).json({message : 'Bad http request'})
//       }
//     }catch(err){
//         console.log(err.message);
//         res.status(500).json({message : err.message});
//     }
// });

router.get('/allMessages/:senderId/:receiverId' , async (req , res) =>{
const {receiverId , senderId} = req.params;
try{
    if (receiverId && senderId){
        const messages = await Message.find( {$or :[
        { senderId: new mongoose.Types.ObjectId(senderId), receiverId: new mongoose.Types.ObjectId(receiverId) },
        { senderId: new mongoose.Types.ObjectId(receiverId), receiverId: new mongoose.Types.ObjectId(senderId) }
            ]
        }).sort({sentAt : 1});
        res.status(200).json(messages);
    }else{
        res.status(400).json({message : 'Bad http request'})
    }
}catch(err){
    console.log(err.message);
    res.status(500).json({message : err.message});
}
});

return router;
}