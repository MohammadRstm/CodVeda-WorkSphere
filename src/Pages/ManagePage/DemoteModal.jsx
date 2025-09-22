export function DemoteModal({demoteUser , setDemoteUser , demote}){
    const figureOutDemotion = (role) => {
    if (role == 'admin') return <stron>Manager</stron>
    if (role === "manager") return <strong>Employee</strong>;
    return <strong>Already An Employee</strong>;
  };

  return (
     <div id="modal-demote" className="modal">
            <div className="modal-content">
              <p>
                Demote <strong>{demoteUser.user_name}</strong>?
              </p>
              <p>
                This will change their role from <strong>{demoteUser.role}</strong> to{" "}
              </p>
              <h4>{figureOutDemotion(demoteUser.role)}</h4>
              <div className="modal-buttons">
                <button
                  className="btn-demote"
                  onClick={() => demote(demoteUser._id, demoteUser.role)}
                >
                  Demote
                </button>
                <button
                  id="btn-demote-cancel"
                  className="btn-cancel"
                  onClick={() => setDemoteUser(null)}
                >
                  Cancel
                </button>
              </div>
        </div>
    </div>
  )
}