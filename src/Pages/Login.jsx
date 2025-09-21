import { useState } from 'react';
import './styles/Login.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { CustomAlert } from '../Components/CustomAlert';
import {jwtDecode} from "jwt-decode";
import { connectSocket  , initSocket , disconnectSocket} from '../../socketClient';
export function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState(null); // Alert state

  const BASE_URL = import.meta.env.VITE_API_URL;

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
  };

  const submithtmlForm = async (e) => {
    e.preventDefault();
    try {
      const results = await axios.post(`${BASE_URL}/users/login`, {
        username,
        password
      });
    
      const token = results.data.token;
      const payload = jwtDecode(token);
      const role = payload.role;
      const id = payload.id;
      const userName = payload.username;

      const queryParams = new URLSearchParams(window.location.search);
      const logOut = queryParams.get('logout');
      if (logOut){
        localStorage.clear();
        disconnectSocket();
        console.log('socket disconnected');
      }
        

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ id, role , userName }));

    showAlert("Login successful!", "success"); // Show success alert
    // tell the server who logged in for websocket communication
    if (id){
      initSocket(import.meta.env.VITE_API_URL, id);
      const socket = connectSocket(id);
      socket.on("connect", () => console.log("Socket connected for user:", id));
    }
     setTimeout(() => navigate("/Home"), 1000);
    } catch (err) {
      if (err.response) showAlert(err.response.data.message || "Server error, please try again");
      else showAlert("Something went wrong");
    }
  };

  return (
    <>
      {alert && (
        <CustomAlert
          message={alert.msg}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="login-page">
        <div className="glowing-orbs orb-1"></div>
        <div className="glowing-orbs orb-2"></div>
        <div className="glowing-orbs orb-3"></div>

        <div className="login-card">
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to access your account</p>

          <form id="loginhtmlForm" onSubmit={submithtmlForm}>
            <div className="input-group">
              <label htmlFor="username">User name</label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
              <i className="fas fa-user"></i>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <i className="fas fa-lock"></i>
            </div>

            <button type="submit" className="login-btn">Sign In</button>
          </form>

          <div className="links">
            <Link to="/SignUp">Create Account</Link>
          </div>
        </div>
      </div>
    </>
  );
}
