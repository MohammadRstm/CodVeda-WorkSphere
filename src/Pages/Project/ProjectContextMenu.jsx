export function ProjectContextMenu({setDeleteProject , setEditProject , selectedProject , setUpdateForm}){
    return (
           <div id="context-menu" className="hidden">
                        <button
                            id="edit-action"
                            onClick={() => {
                                setEditProject(selectedProject);
                                setUpdateForm({
                                    newDeadLine: selectedProject.deadline.split('T')[0],
                                    newManager: selectedProject.managerId,
                                    newName: selectedProject.name
                                });
                            }}
                        >
                            edit
                        </button>
                        <button
                            id='delete-button'
                            onClick={() => { setDeleteProject(selectedProject) }}
                        >
                            delete
                        </button>
                    </div>
    )
}