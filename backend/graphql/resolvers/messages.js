import mongoose from 'mongoose';
import Message from '../../models/Message.js';
import User from '../../models/User.js';
import { getIO } from '../../socket.js';

export default{
  Query: {
    allMessages: async (_, { senderId, receiverId } , {user}) => {
      if (!user) throw new Error('Not authenticated');
      if (!senderId || !receiverId) throw new Error("Bad request: Missing IDs");

      try {
        return await Message.find({
          $or: [
            { senderId: new mongoose.Types.ObjectId(senderId), receiverId: new mongoose.Types.ObjectId(receiverId) },
            { senderId: new mongoose.Types.ObjectId(receiverId), receiverId: new mongoose.Types.ObjectId(senderId) },
          ],
        }).sort({ sentAt: 1 });
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },

  Mutation: {
    sendMessage: async (_, { senderId, receiverId, message } , {user}) => {
      if(!user) throw new Error('User not authenticated');
      console.log('here')
      try {
        const newMessage = new Message({
          senderId,
          receiverId,
          message,
          sentAt: new Date(),
        });
        await newMessage.save();

        // send message to reciever
        getIO().to(receiverId).emit("message", { userId: senderId, type: "message", message });

        return newMessage;
      } catch (err) {
        console.log(err)
        throw new Error("Error sending message: " + err.message);
      }
    },
  },
};
