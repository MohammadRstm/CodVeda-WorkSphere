import "./styles/Profile.css"
import { Header } from "../Components/Header"


export function Profile(){

return (
<>
    <Header />
    <div className="grid-background"></div>
    <div className="glowing-orbs orb-1"></div>
    <div className="glowing-orbs orb-2"></div>
    <div className="glowing-orbs orb-3"></div>
    <div className="glowing-orbs orb-4"></div>

    <main className="profile-container">
        <h1 className="profile-title">User Profile</h1>

        <div className="profile-content">
            <div className="profile-image-container">
                <img src="https://www.w3schools.com/howto/img_avatar.png" alt="User Profile" className="profile-image"
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
                            <span className="info-value" id="user-name">Mohammad Rostom</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Age:</span>
                            <span className="info-value" id="user-age">28</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Position:</span>
                            <span className="info-value" id="user-position">Senior Developer</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Department:</span>
                            <span className="info-value" id="user-department">Engineering</span>
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
                            <span className="info-value" id="user-id">CV-2023-789</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Start Date:</span>
                            <span className="info-value" id="start-date">January 15, 2020</span>
                        </div>
                    </div>
                </div>

                <div className="info-card bio-card">
                    <div className="info-header">
                        <i className="fas fa-file-alt"></i>
                        <h2>Bio</h2>
                    </div>
                    <div className="info-content">
                        <p id="user-bio">Experienced software developer with a passion for creating innovative
                            solutions. Specializes in front-end development and user experience design. Enjoys tackling
                            complex problems and mentoring junior developers. Outside of work, I&apos;m an avid photographer
                            and hiking enthusiast.</p>
                    </div>
                </div>

                <div className="action-buttons">
                    <button className="btn-edit" id="btn-edit">
                        <i className="fas fa-edit"></i> Edit Profile
                    </button>
                    <button className="btn-save" id="btn-save" style={{ display: "none" }}>
                        <i className="fas fa-save"></i> Save Changes
                    </button>
                    <button className="btn-cancel" id="btn-cancel" style={{ display: "none" }}>
                        <i className="fas fa-times"></i> Cancel
                    </button>
                </div>

            </div>
        </div>
    </main>
</>
);
}
