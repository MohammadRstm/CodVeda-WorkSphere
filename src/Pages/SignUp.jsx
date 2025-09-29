import { Link, useNavigate } from "react-router-dom";
import "./styles/SignUp.css";
import { useEffect, useState } from "react";
import { CustomAlert } from "../Components/CustomAlert";

export function SignUp() {
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_URL;

  const [user, setUser] = useState({
    name: "",
    username: "",
    age: "",
    password: "",
    department: "",
  });
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [departments, setDepartments] = useState([]);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = "info") => {
    setAlert({ msg, type });
  };

  useEffect(() => {
    const loadDepartments = async () => {
      const query = `
        query {
          allDepartments {
            _id
            name
          }
        }
      `;
      try {
        const response = await fetch(`${BASE_URL}/graphql`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
           },
          body: JSON.stringify({ query }),
        });
        const result = await response.json();

        setDepartments(result.data.allDepartments);
        console.log(result)
      } catch (err) {
        showAlert("Failed to load departments. Please try again.", "error");
      }
    };
    loadDepartments();
  }, []);

  const submitForm = async (e) => {
    e.preventDefault();

    if (user.password !== passwordConfirm) {
      showAlert("Confirm password must match password", "error");
      return;
    }

    const mutation = `
      mutation RegisterUser($input: UserInput!) {
        register(input: $input) {
          _id
          name
          username
        }
      }
    `;

    const variables = {
      input: {
        name: user.name,
        username: user.username,
        age: parseInt(user.age),
        password: user.password,
        department: user.department,
      },
    };

    try {
      const response = await fetch(`${BASE_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mutation, variables }),
      });
      const result = await response.json();

      if (result.errors) {
        showAlert(result.errors[0].message, "error");
        return;
      }

      showAlert("Account created successfully!", "success");
      navigate("/"); // redirect to login
    } catch (err) {
      showAlert("Network error, please try again later.", "error");
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
              <input
                type="text"
                id="name"
                placeholder="Enter your full name"
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                value={user.name}
              />
              <i className="fas fa-user"></i>
            </div>

            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Choose a username"
                onChange={(e) => setUser({ ...user, username: e.target.value })}
                value={user.username}
              />
              <i className="fas fa-at"></i>
            </div>

            <div className="input-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                placeholder="Enter your age"
                min="13"
                max="120"
                onChange={(e) => setUser({ ...user, age: e.target.value })}
                value={user.age}
              />
              <i className="fas fa-birthday-cake"></i>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Create a password"
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                value={user.password}
              />
              <i className="fas fa-lock"></i>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm your password"
                onChange={(e) => setPasswordConfirm(e.target.value)}
                value={passwordConfirm}
              />
              <i className="fas fa-lock"></i>
            </div>

            <div className="input-group">
              <label htmlFor="department">Department</label>
              <select
                name="department"
                value={user.department}
                onChange={(e) =>
                  setUser({ ...user, department: e.target.value })
                }
                required
              >
                <option value="">Select department</option>
                {departments
                  .filter((dep) => dep.name !== "Demo")
                  .map((dep) => (
                    <option key={dep._id} value={dep._id}>
                      {dep.name}
                    </option>
                  ))}
              </select>
              <i className="fas fa-lock"></i>
            </div>

            <button type="submit" className="signup-btn">
              Create Account
            </button>
          </form>

          <div className="links">
            <Link to="/">Already have an account? Sign In</Link>
          </div>
        </div>
      </div>
    </>
  );
}
