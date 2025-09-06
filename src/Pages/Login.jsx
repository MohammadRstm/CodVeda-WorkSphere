import { useState } from 'react';
import './styles/Login.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export function Login(){
const navigate = useNavigate();


const [username , setUsername] = useState("");
const [password , setPassword] = useState("");

const submithtmlForm = async (e) =>{
    e.preventDefault();
    try{
    const results = await axios.post('http://localhost:3000/users/login' , {
        username ,
        password
    });

    console.log(results)

    const token = results.data.token;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.role;
    const id = payload.id;

    localStorage.setItem(
        "token",
         token,
        
    );
    localStorage.setItem(
        "user",
        JSON.stringify({
            id,
            role,
        })
    )
    navigate("/Home");
    } catch(err){
        if (err.response)
            alert(err.response.data.message || 'Server error , please try again');
        else
            alert('Something went wrong')
    }
}

return (
<>
    <div className="login-page">
        <div className="glowing-orbs orb-1"></div>
        <div className="glowing-orbs orb-2"></div>
        <div className="glowing-orbs orb-3"></div>

        <div className="login-card">
            <h2>Welcome Back</h2>
            <p className="subtitle">Sign in to access your account</p>

            <div className="error" id="errorMessage">
                <i className="fas fa-exclamation-circle"></i> Invalid username or password
            </div>

            <form id="loginhtmlForm" onSubmit={submithtmlForm}>
                <div className="input-group">
                    <label htmlFor="username">User name</label>
                    <input type="text" id="username" placeholder="Enter your username"
                    onChange={(e) => {setUsername(e.target.value)}}
                    value = {username} />
                    <i className="fas fa-user"></i>
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" placeholder="Enter your password"
                    onChange={(e) => {setPassword(e.target.value)}}
                    value = {password} />
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
)
}
