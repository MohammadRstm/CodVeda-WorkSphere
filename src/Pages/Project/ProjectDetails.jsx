export function ProjectDetails({projectDetails , getBarColor , getProgress ,projectProgress}){

    return (
     <div className="page-container project-details-container">
                <h1>Project Details</h1>
                <div className="project-info">
                <div className="info-item"><span>Project:</span> {projectDetails.projectName}</div>
                <div className="info-item"><span>Department:</span> {projectDetails.depName}</div>
                <div className="info-item"><span>Manager:</span> {projectDetails.managerName}</div>
                <div className="info-item"><span>Start Date:</span> {new Date(projectDetails.start_date).toLocaleDateString()}</div>
                <div className="info-item"><span>Deadline:</span> {new Date(projectDetails.deadline).toLocaleDateString()}</div>
            </div>

                <div className="tasks-section">
                <h2>Tasks</h2>
                {projectDetails.tasks && projectDetails.tasks.length > 0 ? (
                    <>
                    <table className="users-table">
                    <thead>
                        <tr>
                        <th>ID</th>
                        <th>Task Name</th>
                        <th>Description</th>
                        <th>Days to Finish</th>
                        <th>Assigned To</th>
                        <th>Username</th>
                        <th>State</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projectDetails.tasks.map((task, index) => (
                        <tr key={index}>
                            <td>{task.id}</td>
                            <td>{task.taskName}</td>
                            <td>{task.description || "N/A"}</td>
                            <td>{task.days_to_finish}</td>
                            <td>{task.assignedTo}</td>
                            <td>{task.username}</td>
                            <td>{task.state}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                    
                   <div className="project-progress-section">
                        <h2>Overall Project Progress</h2>
                        <div className="progress-wrapper">
                            <div
                            className="progress-bar-large"
                            style={{
                                width: `${getProgress(projectProgress)}%`,
                                backgroundColor: getBarColor(projectProgress), // I’ll explain below
                            }}
                            title={`${getProgress(projectProgress)}% Complete`}
                            ></div>
                        </div>
                        <p className="progress-label">
                            {getProgress(projectProgress)}% Complete
                        </p>
                    </div>

                    </>
                ) : (
                    <p className="no-tasks-msg">No tasks for this project yet!</p>
                )}
                </div>
            </div>

            )
}