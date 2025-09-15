import { Link, useNavigate } from "react-router-dom";
import "./styles/SignUp.css";
import axios from 'axios';
import { useEffect, useState } from "react";
import { CustomAlert } from "../Components/CustomAlert";

export function SignUp(){
    const navigate = useNavigate();

    const [user , setUser] = useState({
        name : "",
        username : "",
        age : "",
        password : "",
        department : ""
    });
    const [passwordConfirm , setPasswordConfirm] = useState("");
    const [departments , setDepartments] = useState([]);

    useEffect (() =>{
        const loadDepartments = async () =>{
            try{
                const response = await axios.get("http://localhost:3000/departments/allDepartments");
                setDepartments(response.data);
            }catch(err){
                if(err.response)
                    showAlert(err.response.data.message || 'Server error, please try again');
                else
                    showAlert("Network error, please try again later");
            }
        }
        loadDepartments();
    }, []);

    // Custom alert state
    const [alert, setAlert] = useState(null);

    // Function to show alerts
    const showAlert = (msg, type = "info") => {
        setAlert({ msg, type });
    }

    const submitForm = async (e) =>{
        e.preventDefault();
        // client side validation
        if (user.password !== passwordConfirm){
            showAlert('Confirm password must match password', 'error');
            return;
        }

        try {
            let response = await axios.post('http://localhost:3000/users/register', { user });
            console.log(response);
            showAlert("Account created successfully!", "success");
            navigate("/"); // redirect after success
        } catch(err) {
            if (err.response){
                showAlert(err.response.data.message || "Server error, please try again", "error");
            } else {
                showAlert("Network error, please try again later", "error");
            }
        }
    }

    return (
        <>
        {alert && (
            <CustomAlert
                message={alert.msg}
                type={alert.type}
                onClose={() => setAlert(null)}
            />
        )}

        <div className="signup-page">
            <div className="glowing-orbs orb-1"></div>
            <div className="glowing-orbs orb-2"></div>
            <div className="glowing-orbs orb-3"></div>
            
            <div className="signup-card">
                <h2>Create Account</h2>
                <p className="subtitle">Join our community today</p>
                
                <form id="signupForm" onSubmit={submitForm}>
                    <div className="input-group">
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" placeholder="Enter your full name"
                        onChange = {(e) => setUser({...user , name : e.target.value})}
                        value = {user.name} />
                        <i className="fas fa-user"></i>
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" placeholder="Choose a username"
                        onChange = {(e) => setUser({...user , username : e.target.value})}
                        value = {user.username}  />
                        <i className="fas fa-at"></i>
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="age">Age</label>
                        <input type="number" id="age" placeholder="Enter your age" min="13" max="120"
                        onChange = {(e) => setUser({...user , age : e.target.value})}
                        value = {user.age}  />
                        <i className="fas fa-birthday-cake"></i>
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" placeholder="Create a password"
                        onChange = {(e) => setUser({...user , password : e.target.value})}
                        value = {user.password}  />
                        <i className="fas fa-lock"></i>
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" placeholder="Confirm your password"
                        onChange = {(e) => setPasswordConfirm(e.target.value)}
                        value={passwordConfirm}  />
                        <i className="fas fa-lock"></i>
                    </div>
                    <div className="input-group">
                        <label htmlFor="department">Department</label>
                         <select
                            name="department"
                            value={user.department}
                            onChange={(e) => {setUser({...user , department : e.target.value})}}
                            required
                            >
                            <option value="">Select department</option>
                            {departments
                            .filter(dep => dep.name !== 'Demo')
                            .map((dep) => (
                                <option key={dep.id} value={dep.id}>
                                {dep.name}
                                </option>
                            ))}
                        </select>
                        <i className="fas fa-lock"></i>
                    </div>
                    
                    <button type="submit" className="signup-btn">Create Account</button>
                </form>

                <div className="links">
                    <Link to="/">Already have an account? Sign In</Link>
                </div>
            </div>
        </div>
        </>
    )
}
