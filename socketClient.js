import { io } from "socket.io-client";

let socket = null;

// Initialize socket once
export const initSocket = (baseURL , userId) => {
  if (!socket) {
    socket = io(baseURL, {
    withCredentials: true,
    autoConnect: true,
    auth : {userId}
   });
  }
  return socket;
};

// Connect after login
export const connectSocket = (userId) => {
  if (!socket) throw new Error("Socket not initialized");
  if (!socket.connected) {
    socket.auth = { userId }; // send userId to server
    socket.connect();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null; // clear the socket reference
  }
};

// Get socket anywhere
export const getSocket = () => {
  if (!socket) throw new Error("Socket not initialized");
  return socket;
};

// Notification helpers
export const onNotification = (callback) => {
  if (!socket) throw new Error("Socket not initialized");
  socket.on("notification", callback);
};

export const offNotification = (callback) => {
  if (!socket) throw new Error("Socket not initialized");
  socket.off("notification", callback);
};
