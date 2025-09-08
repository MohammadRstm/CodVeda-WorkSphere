export function EditMode({isEditing , setIsEditing , saveChanges , cancleChanges}){

    return (
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
    );
}