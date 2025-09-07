import "./styles/Manage.css";
import { Header } from "../Components/Header";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function Manage() {
  const navigate = useNavigate();

  // Data
  const [users, setUsers] = useState([]);

  // user's data
  const user = localStorage.getItem('user');

  // UI state
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [promoteUser, setPromoteUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  // Table visibility
  const [visibleRows, setVisibleRows] = useState({
    employee: 5,
    manager: 5,
    admin: 5,
   });

  // Hide context menu when clicking anywhere
  useEffect(() => {
    const hideMenu = (e) => {
      if (e.button === 0){
        const el = document.getElementById("context-menu");
        if (el) el.classList.add("hidden");
      }
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
  };

  const loadUsers = async () => {
    const response = await axios.get(
      "http://localhost:3000/users/allUsers/allInfo"
    );
    setUsers(response.data);
  };

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
            const container = document.querySelector(".page-container");
            const rect = container.getBoundingClientRect();
            const menu = document.getElementById("context-menu");
            if (menu) {
              menu.style.top = `${e.clientY - rect.top}px`;
              menu.style.left = `${e.clientX - rect.left}px`;
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
    if (selectedUserId) navigate(`/profile?id=${selectedUserId}`);
  };



  const promote = async (id , role) => {
    const token = localStorage.getItem('token');
    console.log(token)
    try{
    const response = await axios.put(
      `http://localhost:3000/users/promote/${id}/${role}` , {} ,
      {
        headers : {
          Authorization : `Bearer ${token}`
        }
      }
    );
    console.log(response);
    await loadUsers();
    setPromoteUser(null);
  }catch(err){
    if (err.response){
      alert(err.response.data.message || 'something wen wrong');
    }else{
      alert("Network error , please try again later");
    }
    setPromoteUser(null);
  }
  };

  const fireUser = async () => {
    const token = localStorage.getItem("token");
    try{
    const response = await axios.delete(
      `http://localhost:3000/users/delete` ,  
      {
        headers : {
          Authorization : `Bearer ${token}`
        }
      }
    );
    console.log(response);
    await loadUsers();
    setDeleteUser(null);
  }catch(err){
    if (err.response){
      alert(err.response.data.message || 'something went wrong');
    }else{
      alert("Network error, please try again.");
    }
    setDeleteUser(null)
  }
  };

  return (
    <>
      <Header />
      <div className="page-container">
        <div className="page-content">
          <div className="grid-background" />
          <div className="glowing-orbs orb-1" />
          <div className="glowing-orbs orb-2" />
          <div className="glowing-orbs orb-3" />
          <div className="glowing-orbs orb-4" />

          <h1>Welcome {user.name}</h1>
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
          </div>

          <Table role="admin" title="Admins" />
          <Table role="manager" title="Managers" />
          <Table role="employee" title="Employees" />
        </div>
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
      </div>
    </>
  );
}
