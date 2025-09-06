import "./styles/Profile.css"
import { Header } from "../Components/Header"
import { useEffect, useState } from "react";
import axios from 'axios'


export function Profile(){

    const [user , setUser] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editUser, setEditUser] = useState(null);

    useEffect(() =>{
       const queryParams = new URLSearchParams(window.location.search);
       const id = queryParams.get("id");
       console.log(user)
       loadUser(id);
    } , []);

    const loadUser = async (id) =>{
       let response = await axios.get(`http://localhost:3000/users/user/extended/${id}`);
       setUser(response.data);
       setEditUser(response.data);
    }

    const handleChange = (field, value) => {
        setEditUser(prev => ({ ...prev, [field]: value }));
    };
    const saveChanges = async () =>{
        let response = await axios.put(`http://localhost:3000/profiles/update/info/${editUser.id}`);
        console.log(response);
        setEditUser(null);
    }
    const cancleChanges = () =>{
        setEditUser(user);
        setIsEditing(false);
    }


return (
<>
    <Header />
    <div className="grid-background"></div>
    <div className="glowing-orbs orb-1"></div>
    <div className="glowing-orbs orb-2"></div>
    <div className="glowing-orbs orb-3"></div>
    <div className="glowing-orbs orb-4"></div>

    {(user) && (

    <main className="profile-container">
        <h1 className="profile-title">{user.user_name}</h1>

        <div className="profile-content">
            <div className="profile-image-container">
                <img src={user.photo_url} alt="User Profile" className="profile-image"
                    id="profile-img"/>
                <div className="image-upload">
                    <label htmlFor="file-input" className="upload-label">
                        <i className="fas fa-camera"></i> Change Photo
                    </label>
                    <input type="file" id="file-input" className="file-input" accept="image/*" />
                </div>
            </div>

            <div className="profile-info">
                <div className="info-card">
                    <div className="info-header">
                        <i className="fas fa-user"></i>
                        <h2>Personal Information</h2>
                    </div>
                    <div className="info-content">
                        <div className="info-item">
                            <span className="info-label">Name:</span>
                            {isEditing ? (
                                <input
                                type="text"
                                value={editUser.user_name}
                                onChange = {(e) => handleChange('user_name' , e.target.value)}
                                className="input-edit"
                                />
                            ) : (
                             <span className="info-value" id="user-name">{user.user_name}</span>
                            )}
                        </div>
                        <div className="info-item">
                            <span className="info-label">Age:</span>
                            {isEditing ? (
                                <input
                                type="text"
                                value={editUser.age}
                                onChange = {(e) => handleChange('age' , e.target.value)}
                                className="input-edit"
                                />
                            ) : (
                                <span className="info-value" id="user-age">{user.age}</span>
                            )}
                        </div>
                        <div className="info-item">
                            <span className="info-label">User Name:</span>
                            <span className="info-value" id="user-age">{user.username}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Role:</span>
                            <span className="info-value" id="user-position">{user.role}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Department:</span>
                            <span className="info-value" id="user-department">{user.dep_name}</span>
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
                            <span className="info-label">Employee ID:</span>
                            <span className="info-value" id="user-id">{user.id}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Start Date:</span>
                            <span className="info-value" id="start-date">{new Date(user.created_at).toLocaleDateString()}</span>
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
                            <span className="info-label">Project :</span>
                            <span className="info-value" id="user-project">{user.project_name}</span>
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
                           type="text"
                           onChange={(e) => handleChange('bio' , e.target.value)} 
                           ></textarea>
                        ): (
                            <p id="user-bio">{user.bio}</p>
                        )}
                    </div>
                </div>

                <div className="action-buttons">
                    {!isEditing ? (
                    <button
                    className="btn-edit"
                    id="btn-edit"
                    onClick={() => setIsEditing(true)}
                    >
                        <i className="fas fa-edit"></i> Edit Profile
                    </button>
                    ) : (
                    <>
                        <button className="btn-save" id="btn-save" onClick={saveChanges}>
                            <i className="fas fa-save"></i> Save Changes
                        </button>
                        <button className="btn-cancel" id="btn-cancel" onClick={cancleChanges}>
                            <i className="fas fa-times"></i> Cancel
                        </button>
                    </>
                    )}
                </div>

            </div>
        </div>
    </main>
    )}
</>
);
}
