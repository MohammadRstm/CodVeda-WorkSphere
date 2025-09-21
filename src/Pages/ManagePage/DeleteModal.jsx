export function DeleteModal ({fireUser , deleteUser , setDeleteUser}){
    return (
          <div id="modal-confirm" className="modal">
            <div className="modal-content">
              <p>
                Are you sure you want to fire <strong>{deleteUser.username}</strong>?
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
    );
}