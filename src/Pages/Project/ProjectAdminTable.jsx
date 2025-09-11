export function ProjectAdminTable({projectsByDept , getProgress , getBarColor , setSelectedProject}) {
    
    return (
        <>
        <div className="page-container">
                        <h1>Projects Overview</h1>
                        <table className="users-table">
                            <thead>
                                <tr>
                                <th>Department</th>
                                <th>Project ID</th>
                                <th>Project Name</th>
                                <th>Manager</th>
                                <th>Start Date</th>
                                <th>Deadline</th>
                                <th>State</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(projectsByDept).map((dept) => {
                                    const deptProjects = projectsByDept[dept];
                                    return deptProjects.map((proj, index) => {
                                    const progress = getProgress(proj.completionPercent);
                                    const barColor = getBarColor(proj.completionPercent);
                                    return (
                                            <tr
                                            key={index}
                                            onContextMenu={(e) =>{
                                                e.preventDefault();
                                                setSelectedProject(proj.id);
                                                const menu = document.getElementById("context-menu");
                                                if (menu) {
                                                    menu.style.top = `${e.clientY}px`;
                                                    menu.style.left = `${e.clientX}px`;
                                                    menu.classList.remove("hidden");
                                                }
                                            }}
                                            >
                                        {index === 0 && (
                                            <td rowSpan={deptProjects.length}>{dept}</td> // span all rows
                                        )}
                                        <td>{proj.id}</td>
                                        <td>{proj.name}</td>
                                        <td>{proj.manager}</td>
                                        <td>{new Date(proj.startDate).toLocaleDateString()}</td>
                                        <td>{new Date(proj.deadline).toLocaleDateString()}</td>
                                        <td>
                                            <div className="progress-bar-container">
                                            <div
                                                className="progress-bar"
                                                style={{
                                                width: `${progress}%`,
                                                backgroundColor: barColor,
                                                }}
                                                title={`${progress}% Complete`}
                                            ></div>
                                            </div>
                                        </td>
                                        </tr>
                                    );
                                    });
                                })}
                        </tbody>
                        </table>
                    </div>
        </>
    )
}