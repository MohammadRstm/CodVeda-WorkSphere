import { useEffect, useState } from 'react';
import './styles/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { CustomAlert } from '../Components/CustomAlert';
import { connectSocket  , initSocket , disconnectSocket} from '../../socketClient';
export function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState(null); // Alert state

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() =>{
      const queryParams = new URLSearchParams(window.location.search);
      const logOut = queryParams.get('logout');
      if (logOut){
        localStorage.clear();
        disconnectSocket();
        console.log('socket disconnected');
      }
  } , [])

  const showAlert = (msg, type = "error") => {
    setAlert({ msg, type });
  };

  const submithtmlForm = async (e) => {
    e.preventDefault();
    const mutation = `
      mutation LoginUser($username: String!, $password: String!) {
        login(username: $username, password: $password) {
          token
          user {
            _id
            username
            role
            name
          }
        }
      }
    `;
    const variables = { username, password };

    try {
      const response = await fetch(`${BASE_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mutation, variables }),
      });

      const results = await response.json(); 
      if (results.errors) {
        showAlert(results.errors[0].message, "error");
        return;
      }
    
      const { token, user: userData } = results.data.login;
      localStorage.setItem("token", token);
      localStorage.setItem("user",
         JSON.stringify({
          id : userData._id,
          role : userData.role,
          userName : userData.username
      }));

      showAlert("Login successful!", "success"); // Show success alert
        
    // tell the server who logged in for websocket communication
    if (userData._id) {
      initSocket(import.meta.env.VITE_API_URL, userData._id);
      const socket = connectSocket(userData._id);
      socket.on("connect", () => console.log("Socket connected for user:", userData._id));
      localStorage.setItem('loggedIn' , true);
    }
     setTimeout(() => navigate("/Home"), 1000);
    } catch (err) {
      showAlert("Network error, please try again", "error");
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
