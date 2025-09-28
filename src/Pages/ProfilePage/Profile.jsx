import "../styles/Profile.css";
import axios from 'axios';
import { Header } from "../../Components/Header";
import { useEffect, useState } from "react";
import { CustomAlert } from "../../Components/CustomAlert";
import { capitalizeWords } from "../../utils/capetalizeWords";
import { EditMode } from "./EditMode";
import { ProfileImage } from "./ProfileImage";

export function Profile() {
  const mainUser = JSON.parse(localStorage.getItem("user"));
  const [showEditButton, setShowEditButton] = useState(true);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [alert, setAlert] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const id = queryParams.get("id");
    if (id !== mainUser.id) setShowEditButton(false);
    loadUser(id);
  }, []);

  const showAlert = (msg, type = "info") => {
    setAlert({ msg, type });
  };

  const loadUser = async (id) => {
    const query = `
      query GetUserProfile($id: ID!) {
        getUserProfile(id: $id) {
          _id
          name
          username
          age
          role
          dep_id { name }
          project_id { name }
          profile {
            bio
            photo_url
          }
          created_at
        }
      }
    `;
    try {
      const response = await fetch(`${BASE_URL}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query, variables: { id } }),
      });
      const result = await response.json();
      if (result.errors) {
        showAlert(result.errors[0].message, "error");
        return;
      }

      const data = result.data.getUserProfile;
      const defaultImage = "https://www.w3schools.com/howto/img_avatar.png";
      const photo_url = data.profile?.photo_url
        ? `${BASE_URL}${data.profile.photo_url}`
        : defaultImage;

      const userData = {
        id: data._id,
        user_name: data.name,
        username: data.username,
        age: data.age,
        role: data.role,
        dep_name: data.dep_id?.name || "",
        project_name: data.project_id?.name || "",
        photo_url,
        bio: data.profile?.bio || "",
        created_at: data.created_at,
      };
      setUser(userData);
      setEditUser(userData);
    } catch (err) {
      showAlert("Network error, please try again later", "error");
    }
  };

  const handleChange = (field, value) => {
    setEditUser((prev) => ({ ...prev, [field]: value }));
  };

  const saveChanges = async () => {
    const mutation = `
      mutation UpdateUserProfile($id: ID!, $name: String, $age: Int, $bio: String) {
        updateUserProfile(id: $id, name: $name, age: $age, bio: $bio) {
          _id
          name
          age
          profile { bio }
        }
      }
    `;
    try {
      const response = await fetch(`${BASE_URL}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            id: editUser.id,
            name: editUser.user_name,
            age: parseInt(editUser.age, 10),
            bio: editUser.bio,
          },
        }),
      });
      const result = await response.json();
      if (result.errors) {
        showAlert(result.errors[0].message, "error");
        return;
      }
      setUser({ ...editUser });
      setIsEditing(false);
      showAlert("Profile updated successfully!", "success");
    } catch {
      showAlert("Network error please try again", "error");
    }
  };

  const cancleChanges = () => {
    setEditUser(user);
    setIsEditing(false);
  };
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(
        "operations",
        JSON.stringify({
        query: `
            mutation updateUserPhoto($id: ID!, $photo: Upload!) {
            updateUserPhoto(id: $id, photo: $photo) {
                _id
                profile {
                photo_url
                }
            }
            }
        `,
        variables: { id: user.id, photo: null },
        })
    );
    formData.append("map", JSON.stringify({ "0": ["variables.photo"] }));
    formData.append("0", file);

    try {
        const response = await axios.post(`${BASE_URL}/graphql`, formData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        });

        const result = response.data;
        if (result.errors) {
        showAlert(result.errors[0].message, "error");
        return;
        }

        loadUser(user.id);
        showAlert("Photo uploaded successfully!", "success");
    } catch (err) {
        showAlert("Network error, please try again", "error");
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
      <div className="grid-background"></div>
      <div className="glowing-orbs orb-1"></div>
      <div className="glowing-orbs orb-2"></div>
      <div className="glowing-orbs orb-3"></div>
      <div className="glowing-orbs orb-4"></div>

      {user && (
        <main className="profile-container">
          <h1 className="profile-title">
            {capitalizeWords(user.user_name)}
          </h1>

          <div className="profile-content">
            <ProfileImage
              handlePhotoUpload={handlePhotoUpload}
              user={user}
              showEditButton={showEditButton}
            />

            <div className="profile-info">
              <div className="info-card">
                <div className="info-header">
                  <i className="fas fa-user"></i>
                  <h2>Personal Information</h2>
                </div>
                <div className="info-content">
                  <div className="info-item">
                    <span className="info-label">Name</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editUser.user_name}
                        onChange={(e) =>
                          handleChange("user_name", e.target.value)
                        }
                        className="input-edit"
                      />
                    ) : (
                      <span className="info-value" id="user-name">
                        {user.user_name}
                      </span>
                    )}
                  </div>
                  <div className="info-item">
                    <span className="info-label">Age</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editUser.age}
                        onChange={(e) =>
                          handleChange("age", e.target.value)
                        }
                        className="input-edit"
                      />
                    ) : (
                      <span className="info-value" id="user-age">
                        {user.age}
                      </span>
                    )}
                  </div>
                  <div className="info-item">
                    <span className="info-label">User Name</span>
                    <span className="info-value">{user.username}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Role</span>
                    <span className="info-value">{user.role}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Department</span>
                    <span className="info-value">{user.dep_name}</span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-header">
                  <i className="fas fa-calendar-alt"></i>
                  <h2>Employment Details</h2>
                </div>
                <div className="info-content">
                  <div className="info-item">
                    <span className="info-label">Employee ID</span>
                    <span className="info-value">{user.id}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Start Date</span>
                    <span className="info-value">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-header">
                  <i className="fas fa-briefcase"></i>
                  <h2>Currently Working On</h2>
                </div>
                <div className="info-content">
                  <div className="info-item">
                    <span className="info-label">Project</span>
                    <span className="info-value">{user.project_name}</span>
                  </div>
                </div>
              </div>

              <div className="info-card bio-card">
                <div className="info-header">
                  <i className="fas fa-file-alt"></i>
                  <h2>Bio</h2>
                </div>
                <div className="info-content">
                  {isEditing ? (
                    <textarea
                      className="textarea-edit"
                      value={editUser.bio}
                      onChange={(e) =>
                        handleChange("bio", e.target.value)
                      }
                    ></textarea>
                  ) : (
                    <p>{user.bio}</p>
                  )}
                </div>
              </div>

              {showEditButton && (
                <EditMode
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  saveChanges={saveChanges}
                  cancleChanges={cancleChanges}
                />
              )}
            </div>
          </div>
        </main>
      )}
    </>
  );
}
