import "./styles/Profile.css"
import { Header } from "../Components/Header"
import { useEffect, useState } from "react";
import axios from 'axios'


export function Profile(){
    
    const mainUser = JSON.parse(localStorage.getItem('user'));
    const [showEditButton , setShowEditButton] = useState(true)

    const [user , setUser] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editUser, setEditUser] = useState(null);

    useEffect(() =>{
       const queryParams = new URLSearchParams(window.location.search);
       const id = queryParams.get("id");
       if (id != mainUser.id)
            setShowEditButton(false)
       loadUser(id);
    } , []);


    const loadUser = async (id) =>{
        try{
         let response = await axios.get(`http://localhost:3000/users/user/extended/${id}`);
         if (response){
            const data = response.data;
            if (data.photo_url && data.photo_url.startsWith("/uploads")) {
                data.photo_url = `http://localhost:3000${data.photo_url}`;
            }
            setUser(response.data);
            setEditUser(response.data);
         }
        }catch(err){
            if (err.response){
                alert(err.response.data.message || "Server error, please try again later")
            }
        }
    }

    const handleChange = (field, value) => {
        setEditUser(prev => ({ ...prev, [field]: value }));
    };
    const saveChanges = async () =>{
        try{
        let response = await axios.put(`http://localhost:3000/profiles/update/info/${editUser.id}` , 
            {
                name : editUser.user_name,
                age : editUser.age,
                bio : editUser.bio
            }
        );
        console.log(response);
        setEditUser(editUser);
        }catch(err){
            if (err.response)
                alert(err.response.data.message || "Server error , please try again")
            else
                alert("Network error please try again");
        }
    }
    const cancleChanges = () =>{
        setEditUser(user);
        setIsEditing(false);
    }


const handlePhotoUpload = async (e) => {
  const file = e.target.files[0]; 
  if (!file) return;

  const formData = new FormData();
  formData.append("photo", file);
  try {
    const res = await axios.put(
      `http://localhost:3000/profiles/update/photo/${user.id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    loadUser(user.id); // reload user data to update image
  } catch (err) {
    if (err.response) alert(err.response.data.message || "Server error");
    else alert("Network error, please try again");
  }
};



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
                <img src={user.photo_url } alt="User Profile" className="profile-image"
                    id="profile-img"/>
                    {showEditButton &&(
                <div className="image-upload">
                    <label htmlFor="file-input" className="upload-label">
                        <i className="fas fa-camera"></i> Change Photo
                    </label>
                    <input
                    type="file"
                    id="file-input"
                    name = "photo"
                    className="file-input"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    />
                </div>
                    )}
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
                {showEditButton && (
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
                )}

            </div>
        </div>
    </main>
    )}
</>
);
}
