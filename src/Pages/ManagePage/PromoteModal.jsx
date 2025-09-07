export function PromoteModal ({promote , promoteUser , setPromoteUser}){

const figureOutPromotion = (role) => {
    if (role === "manager") return <strong>Admin</strong>;
    if (role === "employee") return <strong>Manager</strong>;
    return <strong>Already Admin</strong>;
  };

    return (
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
    )
}