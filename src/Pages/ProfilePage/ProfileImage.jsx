export function ProfileImage({user , showEditButton , handlePhotoUpload}){
    

    return (
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
    );
}