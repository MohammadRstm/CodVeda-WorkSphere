import { useState , useEffect } from "react";

export function ProjectAdminTable({projectsByDept , getProgress , getBarColor , setSelectedProject , editProject , managers
    , handleChange , updateForm , submitChanges
}) {
    const [managersSameDep , setManagersSameDep] = useState([]);
  
    useEffect(() =>{
        if (editProject)
            setManagersSameDep(managers.filter((manager) => manager.dep_id._id == editProject.dep_id));
    } , [editProject , managers]);


    return (
        <>
        <div className="page-container">
                        <h1>Projects Overview</h1>
                        <table className="users-table">
                            <thead>
                                <tr>
                                <th>Department</th>
                                <th>Project Name</th>
                                <th>Manager</th>
                                <th>Start Date</th>
                                <th>Deadline</th>
                                <th>State</th>
                                {editProject && (
                                    <th>Submit Changes</th>
                                )}
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
                                    
                                                setSelectedProject(proj);
                                                const menu = document.getElementById("context-menu");
                                                if (menu) {
                                                    const menuHeight = menu.offsetHeight;
                                                    const menuWidth = menu.offsetWidth;
                                                    const windowHeight = window.innerHeight;
                                                    const windowWidth = window.innerWidth;

                                                    let top = e.clientY;
                                                    let left = e.clientX;
                                                    if (top + menuHeight > windowHeight) {
                                                        top = windowHeight - menuHeight - 10; 
                                                    }

                                                    
                                                    if (left + menuWidth > windowWidth) {
                                                        left = windowWidth - menuWidth - 10;
                                                    }

                                                    menu.style.top = `${top}px`;
                                                    menu.style.left = `${left}px`;
                                                    menu.classList.remove("hidden");
                                                }
                                            }}
                                            >
                                        {index === 0 && (
                                            <td rowSpan={deptProjects.length}>{dept}</td> // span all rows
                                        )}
                                        <td>
                                            {editProject?.id === proj.id ? (
                                                <input
                                                name="newName"
                                                defaultValue={editProject.name}
                                                value ={updateForm.newName}
                                                onChange={handleChange}
                                                />
                                            ) : (
                                                proj.name
                                            )}
                                        </td>
                                        <td>
                                            {editProject?.id === proj.id ? (
                                                <select
                                                name="newManager"
                                                value={updateForm.newManager}
                                                onChange={handleChange}
                                                >
                                                   {managersSameDep.map((manager) => (
                                                    <option key={manager._id} value={manager._id}>
                                                        {manager.name}
                                                    </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                proj.manager
                                            )}
                                        </td>
                                        <td>{new Date(proj.startDate).toLocaleDateString()}</td>
                                        {editProject?.id == proj.id ? (
                                            <input type = 'date' name ='newDeadLine' value={updateForm.newDeadLine} onChange={handleChange} defaultValue={proj.deadline} />
                                        ) : (
                                            <td>{new Date(proj.deadline).toLocaleDateString()}</td>
                                        )}
                                        <td>
                                            <div className="progress-bar-container">
                                            <div
                                                className="progress-bar"
                                                style={{
                                                width: `${progress.toFixed(2)}%`,
                                                backgroundColor: barColor,
                                                }}
                                                title={`${progress.toFixed(2)}% Complete`}
                                            ></div>
                                            </div>
                                        </td>
                                        {editProject?.id === proj.id && (
                                            <td><button className="submit-edits-btn" onClick = {submitChanges}>Save Changes</button></td>
                                        )}
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