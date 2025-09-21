export function UsersTable({ role, title, users, visibleRows, setVisibleRows, setSelectedUserId, setPromoteUser, setDeleteUser }) {

  const populateTable = (userRole) => {
    const filtered = users.filter((user) => user.role === userRole);
    const visible = visibleRows[userRole];
    const sliced = filtered.slice(0, visible);

    return (
      <>
        {sliced.map((user) => (
          <tr
            key={user._id}
            data-id={user._id}
            onContextMenu={(e) => {
              e.preventDefault();
              setSelectedUserId(user._id);
              // const container = document.querySelector(".page-container");
              // const rect = container.getBoundingClientRect();
              const menu = document.getElementById("context-menu");
              const menuWidth = menu.offsetWidth;
              const menuHeight = menu.offsetHeight;
              const winWidth = window.innerWidth;
              const winHeight = window.innerHeight;

              let posX = e.clientX;
              let posY = e.clientY;

              if (posX + menuWidth > winWidth) {
                posX = winWidth - menuWidth - 10; // padding from edge
              }
              if (posY + menuHeight > winHeight) {
                posY = winHeight - menuHeight - 10;
              }
              if (menu) {
                menu.style.top = `${posY}px`;
                menu.style.left = `${posX}px`;
                menu.classList.remove("hidden");
              }
            }}
          >
            <td>{user.name}</td>
            <td>{user.username}</td>
            <td>
              <span className={`role-badge role-${user.role}`}>
                {user.role}
              </span>
            </td>
            <td>{user.dep_id?.name || ""}</td>
            <td>{user.project_id?.name || ""}</td>
            <td>
              <button
                className="btn-promote-row"
                data-id={user._id}
                onClick={() => setPromoteUser(user)}
              >
                Promote
              </button>
            </td>
            <td>
              <button
                className="btn-delete-row"
                data-id={user._id}
                onClick={() => setDeleteUser(user)}
              >
                Fire
              </button>
            </td>
          </tr>
        ))}

        {/* Extra row for show more/less */}
        <tr className="show-row">
          <td colSpan="8">
            <div className="show-controls">
              {visible < filtered.length && (
                <button
                  className="arrow-btn"
                  onClick={() =>
                    setVisibleRows({
                      ...visibleRows,
                      [userRole]: visible + 5,
                    })
                  }
                >
                  ▼ Show More
                </button>
              )}
              {visible > 5 && (
                <button
                  className="arrow-btn"
                  onClick={() =>
                    setVisibleRows({
                      ...visibleRows,
                      [userRole]: Math.max(5, visible - 5),
                    })
                  }
                >
                  ▲ Show Less
                </button>
              )}
            </div>
          </td>
        </tr>
      </>
    );
  };

  return (
    <>
      <h2 className="section-title">{title}</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">User Name</th>
            <th scope="col">Role</th>
            <th scope="col">Dept. Name</th>
            <th scope="col">Project</th>
            <th scope="col">Promote</th>
            <th scope="col">Fire</th>
          </tr>
        </thead>
        <tbody>{populateTable(role)}</tbody>
      </table>
    </>
  );
}
