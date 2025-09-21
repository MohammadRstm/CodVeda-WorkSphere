const mongoose = require('mongoose');
const {Schema , model , Types} = mongoose;

const messageSchema = new Schema({
    senderId : {type : Types.ObjectId , ref : 'User' , required : true} ,
    receiverId : {type : Types.ObjectId , ref : 'User' , required : true} ,
    message : {type : String , required : true},
    sentAt : {type : Date , required : true}
} , {
    collection : 'Messages'
});


module.exports = model('Message' , messageSchema);