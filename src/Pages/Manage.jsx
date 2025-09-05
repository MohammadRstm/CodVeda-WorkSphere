import "./styles/Manage.css";
import { Header } from "../Components/Header";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function Manage() {
  const navigate = useNavigate();

  // Data
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);

  // UI state
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [promoteUser, setPromoteUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);

  // Table visibility
  const [visibleRows, setVisibleRows] = useState({
    employee: 5,
    manager: 5,
    admin: 5,
   });


  // New user form
  const [newUser, setNewUser] = useState({
    user_name: "",
    age: "",
    username: "",
    role: "",
    dep_id: "",
    project_id: "",
  });

  // Hide context menu when clicking anywhere
  useEffect(() => {
    const hideMenu = () => {
      const el = document.getElementById("context-menu");
      if (el) el.classList.add("hidden");
    };
    document.addEventListener("click", hideMenu);
    return () => document.removeEventListener("click", hideMenu);
  }, []);

  // Load data once
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    loadUsers();
    loadDepartments();
    loadProjects();
    
  };

  const loadUsers = async () => {
    const response = await axios.get(
      "http://localhost:3000/users/allUsers/allInfo"
    );
    setUsers(response.data);
  };

  const loadDepartments = async () => {
    const response = await axios.get("http://localhost:3000/departments");
    setDepartments(response.data);
  };

  const loadProjects = async () => {
    const response = await axios.get("http://localhost:3000/projects");
    setProjects(response.data);
  };

  const getDepartments = () =>
    departments.map((dep) => (
      <option key={dep.id} value={dep.id}>
        {dep.name}
      </option>
    ));

  const getProjects = () =>
    projects.map((project) => (
      <option key={project.id} value={project.id}>
        {project.name}
      </option>
    ));

  const populateTable = (userRole) => {
  const filtered = users.filter((user) => user.role === userRole);
  const visible = visibleRows[userRole];
  const sliced = filtered.slice(0, visible);

  return (
    <>
      {sliced.map((user) => (
        <tr
          key={user.id}
          data-id={user.id}
          onContextMenu={(e) => {
            e.preventDefault();
            setSelectedUserId(user.id);
            const menu = document.getElementById("context-menu");
            if (menu) {
              menu.style.top = `${e.pageY}px`;
              menu.style.left = `${e.pageX}px`;
              menu.classList.remove("hidden");
            }
          }}
        >
          <td>{user.id}</td>
          <td>{user.user_name}</td>
          <td>{user.username}</td>
          <td>
            <span className={`role-badge role-${user.role}`}>
              {user.role}
            </span>
          </td>
          <td>{user.dept_name}</td>
          <td>{user.project_name}</td>
          <td>
            <button
              className="btn-promote-row"
              data-id={user.id}
              onClick={() => setPromoteUser(user)}
            >
              Promote
            </button>
          </td>
          <td>
            <button
              className="btn-delete-row"
              data-id={user.id}
              onClick={() => setDeleteUser(user)}
            >
              Fire
            </button>
          </td>
        </tr>
      ))}

      {/* Extra row for show more/less */}
      <tr className="show-row">
        <td colSpan="8">
          <div className="show-controls">
            {visible < filtered.length && (
              <button
                className="arrow-btn"
                onClick={() =>
                  setVisibleRows({
                    ...visibleRows,
                    [userRole]: visible + 5,
                  })
                }
              >
                ▼ Show More
              </button>
            )}
            {visible > 5 && (
              <button
                className="arrow-btn"
                onClick={() =>
                  setVisibleRows({
                    ...visibleRows,
                    [userRole]: Math.max(5, visible - 5),
                  })
                }
              >
                ▲ Show Less
              </button>
            )}
          </div>
        </td>
      </tr>
    </>
  );
};


const Table = ({ role, title }) => {
  const totalUsers = users.filter((u) => u.role === role).length;

  return (
    <>
      <h2 className="section-title">{title}</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th scope="col">Id</th>
            <th scope="col">Name</th>
            <th scope="col">User Name</th>
            <th scope="col">Role</th>
            <th scope="col">Dept. Name</th>
            <th scope="col">Project</th>
            <th scope="col">Promote</th>
            <th scope="col">Fire</th>
          </tr>
        </thead>
        <tbody>{populateTable(role)}</tbody>
      </table>

    </>
  );
};



  const figureOutPromotion = (role) => {
    if (role === "manager") return <strong>Admin</strong>;
    if (role === "employee") return <strong>Manager</strong>;
    return <strong>Already Admin</strong>;
  };

  const goToProfile = () => {
    if (selectedUserId) navigate(`/Profile?id=${selectedUserId}`);
  };

  const promote = async (id, role) => {
    const response = await axios.put(
      `http://localhost:3000/users/promote/${id}/${role}`
    );
    console.log(response);
    await loadUsers();
    setPromoteUser(null);
  };

  const addUser = async () => {
    const response = await axios.post("http://localhost:3000/users/add", {
      user_name: newUser.user_name,
      age: newUser.age,
      username: newUser.username,
      role: newUser.role,
      dep_id: newUser.dep_id,
      project_id: newUser.project_id,
    });
    console.log(response);
    await loadUsers();
    setShowAddModal(false);
    setNewUser({
      name: "",
      age: "",
      username: "",
      role: "",
      department: "",
      project: "",
    });
  };

  const fireUser = async () => {
    const response = await axios.delete(
      `http://localhost:3000/users/delete/${deleteUser.id}`
    );
    console.log(response);
    await loadUsers();
    setDeleteUser(null);
  };

  return (
    <>
      <Header />

      <div className="grid-background" />
      <div className="glowing-orbs orb-1" />
      <div className="glowing-orbs orb-2" />
      <div className="glowing-orbs orb-3" />
      <div className="glowing-orbs orb-4" />

      <h1>Welcome Mohammad Rostom</h1>
      <h3>List of users</h3>

      <div className="toolbar">
        <div className="search-container">
          <input
          type="text"
          id="search-input"
          placeholder="Search by user name..."
          onKeyDown={ (e) =>{
            if (e.key === 'Enter'){
                const query = e.target.value.trim();
                if (!query) return;

                const user = users.find((u) => u.username.toLowerCase() === query.toLowerCase());
                 if (user) {
                    navigate(`/profile?id=${user.id}`);
                } else {
                    alert("User not found!");
                }
            }
          }
          }
           />
        </div>
        <div className="add-user-container">
          <button
            id="btn-add-user"
            className="btn-add-user"
            onClick={() => setShowAddModal(true)}
            aria-label="Add user"
            title="Add user"
          >
            <i className="fas fa-plus" />
          </button>
        </div>
      </div>

      <Table role="employee" title="Employees" />
      <Table role="manager" title="Managers" />
      <Table role="admin" title="Admins" />

      {/* Delete modal */}
      {deleteUser && (
        <div id="modal-confirm" className="modal">
          <div className="modal-content">
            <p>
              Are you sure you want to fire <strong>{deleteUser.user_name}</strong>?
            </p>
            <div className="modal-buttons">
              <button
                id="btn-confirm-yes"
                className="btn-delete"
                onClick={fireUser}
              >
                Yes
              </button>
              <button
                id="btn-confirm-no"
                className="btn-cancel"
                onClick={() => setDeleteUser(null)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAddModal && (
        <div id="modal-add" className="modal">
          <div className="modal-content wide">
            <p>Add a new user</p>

            <label htmlFor="input-add-name">Name</label>
            <input
              type="text"
              id="input-add-name"
              className="input-text"
              placeholder="Enter name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, user_name: e.target.value })}
            />

            <label htmlFor="input-add-age">Age</label>
            <input
              type="number"
              id="input-add-age"
              className="input-text"
              placeholder="Enter age"
              value={newUser.age}
              onChange={(e) => setNewUser({ ...newUser, age: e.target.value })}
            />

            <label htmlFor="input-add-username">User Name</label>
            <input
              type="text"
              id="input-add-username"
              className="input-text"
              placeholder="Enter User Name"
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
            />

            <label>Role</label>
            <div className="role-options">
              <label className="role-pill">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={newUser.role === "admin"}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                />
                Admin
              </label>
              <label className="role-pill">
                <input
                  type="radio"
                  name="role"
                  value="manager"
                  checked={newUser.role === "manager"}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                />
                Manager
              </label>
              <label className="role-pill">
                <input
                  type="radio"
                  name="role"
                  value="employee"
                  checked={newUser.role === "employee"}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                />
                Employee
              </label>
            </div>

            <div className="department-option">
              <label htmlFor="select-dep-option">Departments</label>
              <select
                id="select-dep-option"
                className="input-select"
                value={newUser.dep_id}
                onChange={(e) =>
                  setNewUser({ ...newUser, dep_id: e.target.value })
                }
              >
                <option value="">-- Select Department --</option>
                {getDepartments()}
              </select>
            </div>

            <div className="department-option">
              <label htmlFor="select-project-option">Project</label>
              <select
                id="select-project-option"
                className="input-select"
                value={newUser.project_id}
                onChange={(e) =>
                  setNewUser({ ...newUser, project_id: e.target.value })
                }
              >
                <option value="">-- Select Project --</option>
                {getProjects()}
              </select>
            </div>

            <div className="modal-buttons">
              <button id="btn-add-confirm" className="btn-update" onClick={addUser}>
                Add User
              </button>
              <button
                id="btn-add-cancel"
                className="btn-cancel"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promote modal */}
      {promoteUser && (
        <div id="modal-promote" className="modal">
          <div className="modal-content">
            <p>
              Promote <strong>{promoteUser.user_name}</strong>?
            </p>
            <p>
              This will change their role from <strong>{promoteUser.role}</strong> to{" "}
            </p>
            <h4>{figureOutPromotion(promoteUser.role)}</h4>
            <div className="modal-buttons">
              <button
                id="btn-promote-confirm"
                className="btn-promote"
                onClick={() => promote(promoteUser.id, promoteUser.role)}
              >
                Promote
              </button>
              <button
                id="btn-promote-cancel"
                className="btn-cancel"
                onClick={() => setPromoteUser(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context menu */}
      <div id="context-menu" className="hidden">
        <button id="show-profile" onClick={goToProfile}>
          Show Profile
        </button>
      </div>
    </>
  );
}
