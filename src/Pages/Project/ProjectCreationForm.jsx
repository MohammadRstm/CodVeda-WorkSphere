import { useState  , useEffect} from "react";
import axios from 'axios';
import { CustomAlert } from "../../Components/CustomAlert";
import { ProjectTaskCreationForm } from "./ProjectTaskCreationForm";

export function ProjectCreationForm({ departments, managers , employees , graphqlRequest}) {
  const [alert , setAlert] = useState(null);// for custom alert 
  const [step, setStep] = useState(1);// tracking which step of the form the user is in
  const [managerSameDep , setManagerSameDep] = useState(managers);// get managers in the project's department
  const [employeesSameDep , setEmployeesSameDep] = useState(employees);// get employees from the same dep as the project
  const [formData, setFormData] = useState({// form data
    name: "",
    deadline: "",
    department: "",
    manager: "",
  });
  const [tasks, setTasks] = useState([
    { name: "", description: "", project: "", username: "" , days_to_finish : ""}
  ]);// tasks form data 
  const [project , setProject] = useState(null);// used for task submission

  // Used to track manager's data if a manager accessed this page
  const [managerId, setManagerId] = useState(null);
  const [managerUsername, setManagerUsername] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [depId , setDepId] = useState(null);
  // for min deadline date 
  const today = new Date().toISOString().split("T")[0];
  const BASE_URL = import.meta.env.VITE_API_URL;// import base url from env file
  const user = JSON.parse(localStorage.getItem('user'));



  useEffect(() => {
  const searchParams = new URLSearchParams(window.location.search);
  const mid = searchParams.get('managerid');
  const pid = searchParams.get('project_id');
  const uname = searchParams.get('username');
  const depId = searchParams.get('depid');

  if (mid) setManagerId(mid);
  if (pid) setProjectId(pid);
  if (uname) setManagerUsername(uname);
  if (depId) setDepId(depId);

  if (mid) {
    setStep(2);
    setProject(pid);
    setFormData(prev => ({
      ...prev,
      manager: mid , 
      department : depId
    }));
    
  }
  }, []);

  const handleTasksChange = (index, e) => {
    const updatedTasks = [...tasks];
    updatedTasks[index][e.target.name] = e.target.value;
    setTasks(updatedTasks);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {// still need to chose a manager
      setStep(2);
      getSameDepManagers();// get managers for drop down list
    } else if (step === 2) {// submit form or add tasks
        if (!managerId){// only submit if an admin is in the page
          const newProject = await submitForm();
          if (!newProject){
            setTimeout(() => {
              window.location.href = "/project"; 
            }, 2000);
          }
          else
          setProject(newProject);// submit function returns the project created from the db
        }
        getUsersSameDep();// get employees for drop down list 
        setStep(3);
    }else{// add tasks to the project (submits the project automatically)
    submitTasksForm();
    }
  };

  const submitTasksForm = async () =>{
    try{
        const mutation = `
        mutation AddTasks($tasks : [TaskInput!]!){
          addTask(tasks : $tasks){
            name
            description
          }
        }
        `;
        await graphqlRequest(mutation , {tasks});
        showAlert("Task(s) added successfully!" , 'success');
        setInterval(() =>{
          if (user.role === 'admin')
            window.location.href = '/project'
          else
          window.location.href = `/project?userId=${user.id}`;
        } , 2000)
    }catch(err){
        showAlert(err.message || 'Server error, please try again later');
    }
  }

  const showAlert = (msg, type = "info") => {
    setAlert({ msg, type });
  };

  const submitForm = async () =>{
      // const formdata
    const mutation = `
        mutation AddProject($formData : ProjectInput!){
          addProject(formData : $formData){
            _id
            name
          }
        }
      `;
        try{
          const data = await graphqlRequest(mutation ,{formData});
          showAlert('Project added and assigned successfully' , 'success');
          return data.addProject;
        } catch (err) {
          showAlert(err.message || "Something went wrong, please try again later", "error");
        }
  }
  const getSameDepManagers = () =>{
     if (formData.department != ""){
        let sameDep = [];
        for (let i = 0 ; i < managers.length; i++){
            if (managers[i].dep_id._id === formData.department && !managers[i].project_id)
                sameDep.push(managers[i])
        }
        setManagerSameDep(sameDep);
    }
  }

  const getUsersSameDep = () =>{
    if (formData.department != ""){
      let sameDep = [];
      for (let i = 0; i < employees.length; i++){
        if (employees[i].dep_id._id === formData.department)
          sameDep.push(employees[i])
      }
      
      setEmployeesSameDep(sameDep);
    }
  }

  const addAnotherTask = () => {
    setTasks([
      ...tasks,
      { name: "", description: "", project: "", username: "" }
    ]);
  };

  const removePrevoiusTask = () =>{
    if (tasks.length === 1){
        return;
    }else if (tasks.length > 1){
        const tmpTasks =tasks.slice(0, -1);
        setTasks(tmpTasks);
    }
  }

  return (
    <>
     {alert && (
        <CustomAlert
        message={alert.msg}
        type={alert.type}
        onClose={() => setAlert(null)}
        />
    )}
    <div className="form-wrapper">
      <div className="form-card">
        <h2 className="form-title">
          {step === 1 ? "Add New Project" : "Assign Manager"}
        </h2>

        <form onSubmit={handleSubmit} className="form-content">
          {step === 1 && (
            <>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={today}
                  required
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((dep) => (
                    <option key={dep._id} value={dep._id}>
                      {dep.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="form-group">
              <label>Manager</label>
              <select
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                required
              >
                <option value="">Select manager</option>
                {managerUsername ? (
                  <>
                    <option value = {managerId}>{managerUsername}</option>
                  </>
                ) : (
                managerSameDep.map((mgr) => (
                  <option key={mgr._id} value={mgr._id}>
                    {mgr.name}
                  </option>
                ))
                )}
              </select>
            </div>
          )}
          {step === 3 && project &&(
            <ProjectTaskCreationForm
                addAnotherTask={addAnotherTask}
                handleTasksChange={handleTasksChange}
                project={project}
                removePrevoiusTask={removePrevoiusTask}
                handleSubmit={handleSubmit}
                tasks={tasks}
                employeesSameDep = {employeesSameDep}
             />
          )}

          <button type="submit" className="form-button">
            {step === 1 ? "Next →" : "Submit"}
            {step === 3 && "Add Task(s)"}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
