export function ProjectDeletePrompt({removeProject , setDeleteProject}){

return (
<div className="delete-prompt-overlay">
    <div className="delete-prompt">
        <h3>Are you sure you want to remove this project?</h3>
        <p>(Any tasks related to this project will be deleted as well)</p>
        <button onClick={removeProject}>Confirm</button>
        <button onClick={()=> setDeleteProject(null)}>Cancel</button>
    </div>
</div>
)
}
