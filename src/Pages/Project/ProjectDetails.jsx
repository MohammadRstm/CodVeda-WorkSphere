export function ProjectDetails({projectDetails , getBarColor , getProgress ,projectProgress , role , submitTask
    , userId , assignTask , username 
}){
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
                 {role === 'manager' && (
                        <button
                        className="assign-btn"
                        onClick={() => assignTask(userId , projectDetails.id , username , projectDetails.dep_id)}
                        >
                            Assign new tasks
                        </button>
                    )}
                {projectDetails.tasks && projectDetails.tasks.length > 0 ? (
                    <>
                    <table className="users-table">
                    <thead>
                        <tr>
                        <th>ID</th>
                        <th>Task Name</th>
                        <th>Description</th>
                        <th>Days to Finish</th>
                        {role === 'manager' && (
                            <>
                                <th>Assigned To</th>
                                <th>Username</th>
                            </>
                        )}
                        <th>State</th>
                        {role === 'employee' ? <><th>Submit Task</th></> : <></>}
                        </tr>
                    </thead>
                    <tbody>
                        {projectDetails.tasks.map((task, index) => (
                        <tr key={index}>
                            <td>{task._id}</td>
                            <td>{task.name}</td>
                            <td>{task.description || "N/A"}</td>
                            <td>{task.days_to_finish}</td>
                            {role === 'manager' && (
                                <>
                                    <td>{task.assigned_name}</td>
                                    <td>{task.assigned_to}</td>
                                </>
                            )}
                            <td>{task.state}</td>
                            {role === 'employee' ? <><td>
                                <button
                                onClick={() => submitTask(task._id , projectDetails.managerId , projectDetails.id)}
                                className="task-submit-btn"
                                >Submit
                                </button>
                                </td></> : <></>}
                        </tr>
                        ))}
                    </tbody>
                    </table>
                    {role != 'employee' && (
                    <div className="project-progress-section">
                            <h2>Overall Project Progress</h2>
                            <div className="progress-wrapper">
                                <div
                                className="progress-bar-large"
                                style={{
                                    width: `${getProgress(projectProgress)}%`,
                                    backgroundColor: getBarColor(projectProgress), // I’ll explain below
                                }}
                                title={`${getProgress(projectProgress).toFixed(2)}% Complete`}
                                ></div>
                            </div>
                            <p className="progress-label">
                                {getProgress(projectProgress).toFixed(2)}% Complete
                            </p>
                        </div>
                    )}
                    </>
                ) : (
                    <p className="no-tasks-msg">No tasks assigned for you yet!</p>
                )}
                </div>
            </div>

            )
}