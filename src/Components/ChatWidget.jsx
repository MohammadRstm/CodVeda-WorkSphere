// ChatWidget.jsx
import { useEffect, useRef, useState } from "react";
import "./ChatWidget.css";
import axios from "axios";
import { getSocket } from "../../socketClient";
import { formatTime } from "../utils/formatDate";

// we need to get the messages from the data base

export default function ChatWidget() {
  const messagesEndRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const BASE_URL = import.meta.env.VITE_API_URL;
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // load messages
  useEffect(() =>{
    if (!selectedUser) return; // <<< important
    const loadMessages = async () =>{
      try{
        const query = `
          query AllMessages($senderId: ID!, $receiverId: ID!) {
            allMessages(senderId: $senderId, receiverId: $receiverId) {
              senderId
              receiverId
              sentAt
              message
            }
          }
        `;
        const variables = {
          senderId : user.id,
          receiverId : selectedUser._id
        }
        const res = await fetch(`${BASE_URL}/graphql` , {
          method : 'POST',
          headers : {
            "Content-type" : "application/json",
            Authorization : `Bearer ${token}`
          },
          body : JSON.stringify({query , variables})
        });
        const result = await res.json();
        if(result.errors) throw new Error(result.errors[0].message || 'Server error');
          const loadedMessages = result.data.allMessages.map((mssg) => ({
            type: mssg.senderId === user.id ? 'sender' : 'receiver',
            text: mssg.message,
            time: mssg.sentAt,
          }));
          setMessages(loadedMessages);
      }catch(err){
        console.log(err.message || 'messages did not load');
      }
    };
    loadMessages();
  } , [BASE_URL , user.id , selectedUser])

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      const query = `
        query{
          allUsers {
            _id
            name
            username
            profile{
              photo_url
            }
            role
          }
        }
      `;
      try{
        const res = await fetch(`${BASE_URL}/graphql` , {
          method : 'POST',
          headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          },
        body: JSON.stringify({ query }),
        });

        if(res){
          const results = await res.json();
          if(results.data.allUsers){
            setUsers(results.data.allUsers.filter((u) => u._id != user.id))
          } 
        }

      }catch (err) {
        console.log(err.message ? "server error" : "network error");
      }
    };
    loadUsers();
  }, [BASE_URL, user.id]);

  // Filter users live as user types
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Listen for incoming messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handleMessage = (data) => {
      if (selectedUser && data.userId === selectedUser._id) {
        console.log('here')
        setMessages((prev) => [
          ...prev,
          { type: "receiver", text: data.message, time:  new Date().toISOString() },
        ]);
      }
    };
    socket.on("message", handleMessage);
    return () => socket.off("message", handleMessage);
  }, [selectedUser , messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const receipient = selectedUser._id;
    try{
      const mutation = `
        mutation SendMessage($senderId: ID! , $receiverId: ID! , $message: String!){
          sendMessage(senderId : $senderId , receiverId : $receiverId , message: $message){
            message
          }
        }
      `;
      const variables = {
        receiverId : receipient,
        senderId : user.id,
        message
      }
      const res = await fetch(`${BASE_URL}/graphql` , {
        method : 'POST',
        headers :{
          "Content-type":"application/json",
          Authorization : `Bearer ${token}`
        },
        body : JSON.stringify({query : mutation , variables})
      });
      const result = await res.json();
      if(result.errors) throw new Error(result.errors[0].message || 'Server error');
      // Add the sent message to the chat locally
      setMessages((prev) => [
        ...prev,
        { type: "sender", text: message, time: new Date().toISOString() },
      ]);
      setMessage(""); // Clear input
    }catch(err){
      console.log(err.message ? "server error" : "network error");  
    }
};

  // Message component
 const Message = ({ message, time, type }) => (
  <div className={`message-wrapper ${type === "sender" ? "sent" : "received"}`}>
    <div className="message">{message}</div>
    <span className="message-time">{time}</span>
  </div>
);

  return (
    <div className={`chat-widget ${isOpen ? "open" : ""}`}>
      <div className="chat-header" onClick={() => setIsOpen(!isOpen)}>
        <span>💬 Chat</span>
        <span className="arrow">{isOpen ? "▼" : "▲"}</span>
      </div>

      {isOpen && (
        <div className="chat-body">
          {/* Search bar */}
          {!selectedUser && (
            <div className="chat-search-container">
              <input
                type="text"
                className="chat-search"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="chat-search-btn">🔍</button>
            </div>
          )}
          {/* User list */}
          {!selectedUser && (
            <div className="chat-users">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    className="chat-user"
                    onClick={() => {
                      setSelectedUser(u);
                      setMessages([]); // Clear previous chat
                    }}
                  >
                    <img src={`${u.profile.photo_url}`} alt="user" />
                    <div className="chat-user-info">
                      <p>{u.name}</p>
                      <span>{u.role}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No users found</p>
              )}
            </div>
          )}
          {/* Chat area */}
          {selectedUser && (
            <div className="chat-area">
              <div className="chat-area-header">
                <img
                  src={selectedUser.profile.photo_url}
                  alt="user"
                  className="chat-area-photo"
                />
                <span className="chat-area-name">{selectedUser.name}</span>
                <button
                  className="chat-area-close"
                  onClick={() => setSelectedUser(null)}
                >
                  ✖
                </button>
              </div>

              <div className="chat-messages">
                {messages.map((msg, index) => (
                  <Message
                    key={index}
                    type={msg.type === "sender" ? "sender" : "receiver"}
                    time={formatTime(msg.time)}
                    message={msg.text}
                  />
                ))}
                <div ref={messagesEndRef} /> {/* anchor for scrolling */}
              </div>

              <div className="chat-input-container">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Type a message..."
                  value={message}
                  autoFocus
                  onChange={(e) => { setMessage(e.target.value)}}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="chat-send" onClick={sendMessage}>
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
