export function ProjectTaskCreationForm({project , handleSubmit , tasks ,removePrevoiusTask , handleTasksChange , addAnotherTask , employeesSameDep}) {
  const user = JSON.parse(localStorage.getItem('user'));
  return (
    <div className="task-form-wrapper">
      <div className="task-form-card">
        <h2 className="task-form-title">Create New Task</h2>

        <form onSubmit={handleSubmit} className="task-form-content">
          {tasks.map((task, index) => (
            <div key={index} className="task-form-block">
              <h3 className="task-form-subtitle">Task {index + 1}</h3>

              <div className="task-form-group">
                <label className="task-form-label">Task Name</label>
                <input
                  type="text"
                  name="name"
                  value={task.name}
                  onChange={(e) => handleTasksChange(index, e)}
                  required
                  className="task-form-input"
                  placeholder="Enter task name"
                />
              </div>

              <div className="task-form-group">
                <label className="task-form-label">
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  value={task.description}
                  onChange={(e) => handleTasksChange(index, e)}
                  className="task-form-textarea"
                  placeholder="Enter description..."
                />
              </div>
              <div className="task-form-group">
                <label className="task-form-label">Project</label>
                <select
                  name="project"
                  value={task.project}
                  onChange={(e) => handleTasksChange(index, e)}
                  required
                  className="task-form-select"
                >
                  <option value="">Select project</option>
                  {user.role === 'manager' ? (
                     <option key={project} value={project}>
                      Manager&apos;s Project
                    </option>
                  ) : (
                      <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  )}
                  
                </select>
              </div>
              <div className="task-form-group">
                <label className="task-form-label">Assign to</label>
                <select
                  name="username"
                  value={task.username}
                  onChange={(e) => handleTasksChange(index, e)}
                  required
                  className="task-form-select"
                >
                  <option value="">Select User</option>
                  {employeesSameDep.map( (employee , index) => (
                    <option key={index} value={employee.username}>
                      {employee.username}
                    </option>
                  ))}
                </select>
              </div>
            <div className="task-form-group">
                <label className="task-form-label">Days to finish</label>
                <input
                  type="number"
                  name="days_to_finish"
                  value={task.days_to_finish}
                  onChange={(e) => handleTasksChange(index, e)}
                  required
                  className="task-form-input"
                  placeholder="Enter days"
                />
            </div>

            </div>
          ))}

          <button
            type="button"
            onClick={addAnotherTask}
            className="task-form-btn secondary"
          >
            + Add Another Task
          </button>
          <button
          type ='button'
          onClick={removePrevoiusTask}
          className ="task-form-btn secondary"
          >
            Remove Previous Task
          </button>
        </form>
    </div>
</div>
);
}
