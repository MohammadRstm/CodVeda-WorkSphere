import "../styles/Manage.css";
import { Header } from "../../Components/Header";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UsersTable } from "./UsersTable";
import { DeleteModal } from "./DeleteModal";
import { PromoteModal } from "./PromoteModal";
import { CustomAlert } from "../../Components/CustomAlert";
import { DemoteModal } from "./DemoteModal.jsx";

export function Manage() {
  const navigate = useNavigate();

  // Data
  const [users, setUsers] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  // UI state
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [promoteUser, setPromoteUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [demoteUser, setDemoteUser] = useState(null);

  // Alerts
  const [alert, setAlert] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_URL;

  // Table visibility
  const [visibleRows, setVisibleRows] = useState({
    employee: 5,
    manager: 5,
    admin: 5,
  });

  // Roles
  const roles = [
    { role: "admin", title: "Admins" },
    { role: "manager", title: "Managers" },
    { role: "employee", title: "Employees" },
  ];

  // Hide context menu on click
  useEffect(() => {
    const hideMenu = (e) => {
      if (e.button === 0) {
        const el = document.getElementById("context-menu");
        if (el) el.classList.add("hidden");
      }
    };
    document.addEventListener("click", hideMenu);
    return () => document.removeEventListener("click", hideMenu);
  }, []);

  // Load data once
  useEffect(() => {
    loadUsers();
  }, []);

  // 📌 Load all users
  const loadUsers = async () => {
    const query = `
      query {
        allUsers {
          _id
          name
          username
          role
          age
          dep_id {
            _id
            name
          }
          project_id {
            _id
            name
          }
        }
      }
    `;
    try {
      const response = await fetch(`${BASE_URL}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      if (result.errors) {
        showAlert(result.errors[0].message, "error");
        return;
      }

      setUsers(result.data.allUsers);
    } catch (err) {
      showAlert("Failed to load users.", "error");
      console.log(err);
    }
  };

  // 📌 Custom alert handler
  const showAlert = (msg, type = "info") => {
    setAlert({ msg, type });
  };

  const goToProfile = () => {
    if (selectedUserId) navigate(`/profile?id=${selectedUserId}`);
  };

  // 📌 Promote user
  const promote = async (id) => {
    const mutation = `
      mutation Promote($id: ID!) {
        promoteUser(id: $id) {
          _id
          role
        }
      }
    `;
    try {
      const response = await fetch(`${BASE_URL}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ query: mutation, variables: { id } }),
      });

      const result = await response.json();
      if (result.errors) {
        showAlert(result.errors[0].message, "error");
      } else {
        await loadUsers();
        setPromoteUser(null);
        showAlert("User promoted successfully!", "success");
      }
    } catch {
      showAlert("Network error, please try again later", "error");
      setPromoteUser(null);
    }
  };

  // 📌 Demote user
  const demote = async (id) => {
    const mutation = `
      mutation Demote($id: ID!) {
        demoteUser(id: $id) {
          _id
          role
        }
      }
    `;
    try {
      const response = await fetch(`${BASE_URL}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ query: mutation, variables: { id } }),
      });

      const result = await response.json();
      if (result.errors) {
        showAlert(result.errors[0].message, "error");
      } else {
        await loadUsers();
        setDemoteUser(null);
        showAlert("User demoted successfully!", "success");
      }
    } catch {
      showAlert("Network error, please try again later", "error");
      setDemoteUser(null);
    }
  };

  // 📌 Delete user
  const fireUser = async () => {
    const mutation = `
      mutation DeleteUser($id: ID!) {
        deleteUser(id: $id) {
          _id
          username
        }
      }
    `;
    try {
      const response = await fetch(`${BASE_URL}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          query: mutation,
          variables: { id: deleteUser._id },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        showAlert(result.errors[0].message, "error");
      } else {
        await loadUsers();
        setDeleteUser(null);
        showAlert("User fired successfully!", "success");
      }
    } catch {
      showAlert("Network error, please try again.", "error");
      setDeleteUser(null);
    }
  };

  // 📌 Search by username
  const handleUserSearch = (e) => {
    if (e.key === "Enter") {
      const query = e.target.value.trim();
      if (!query) return;
      const foundUser = users.find(
        (u) => u.username.toLowerCase() === query.toLowerCase()
      );
      if (foundUser) navigate(`/profile?id=${foundUser._id}`);
      else showAlert("User not found!", "error");
    }
  };

  return (
    <>
      <Header />
      {alert && (
        <CustomAlert
          message={alert.msg}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="page-container">
        <div className="page-content">
          <div className="grid-background" />
          <div className="glowing-orbs orb-1" />
          <div className="glowing-orbs orb-2" />
          <div className="glowing-orbs orb-3" />
          <div className="glowing-orbs orb-4" />

          <h1>Welcome {user?.userName}</h1>
          <h3>List of users</h3>

          <div className="toolbar">
            <div className="search-container">
              <input
                type="text"
                id="search-input"
                placeholder="Search by user name..."
                onKeyDown={handleUserSearch}
              />
            </div>
          </div>

          {roles.map((UserRole, index) => (
            <UsersTable
              key={index}
              role={UserRole.role}
              title={UserRole.title}
              users={users}
              visibleRows={visibleRows}
              setVisibleRows={setVisibleRows}
              setSelectedUserId={setSelectedUserId}
              setPromoteUser={setPromoteUser}
              setDeleteUser={setDeleteUser}
              setDemoteUser={setDemoteUser}
            />
          ))}
        </div>

        {deleteUser && (
          <DeleteModal
            fireUser={fireUser}
            deleteUser={deleteUser}
            setDeleteUser={setDeleteUser}
          />
        )}

        {promoteUser && (
          <PromoteModal
            promote={promote}
            promoteUser={promoteUser}
            setPromoteUser={setPromoteUser}
          />
        )}

        {demoteUser && (
          <DemoteModal
            demote={demote}
            demoteUser={demoteUser}
            setDemoteUser={setDemoteUser}
          />
        )}

        <div id="context-menu" className="hidden">
          <button id="show-profile" onClick={goToProfile}>
            Show Profile
          </button>
        </div>
      </div>
    </>
  );
}
