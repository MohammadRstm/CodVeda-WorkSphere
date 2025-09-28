import "../styles/Project.css";
import { useEffect, useState } from "react";
import { Header } from "../../Components/Header";
import { CustomAlert } from "../../Components/CustomAlert";
import { ProjectAdminTable } from "./ProjectAdminTable";
import { ProjectDetails } from "./ProjectDetails";
import { ProjectCreationForm } from "./ProjectCreationForm";
import { ProjectContextMenu } from "./ProjectContextMenu";
import { ProjectDeletePrompt } from "./ProjectDeletePrompt";

export function Project() {
  const [alert, setAlert] = useState(null);
  const [projectsByDept, setProjectsByDept] = useState({});
  const [projectDetails, setProjectDetails] = useState(null);
  const [showForAdmin, setShowForAdmin] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectProgress, setProjectProgress] = useState(0);
  const [projectForm, setProjectForm] = useState("");
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editProject, setEditProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);

  const [updateForm, setUpdateForm] = useState({
    newName: "",
    newDeadLine: "",
    newManager: ""
  });

  const role = JSON.parse(localStorage.getItem("user")).role;
  const userId = JSON.parse(localStorage.getItem("user")).id;
  const username = JSON.parse(localStorage.getItem("user")).userName;
  const BASE_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const graphqlRequest = async (query, variables = {}) => {
    try {
      const token = localStorage.getItem("token"); 
      const res = await fetch(`${BASE_URL}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query, variables }),
      });

      const result = await res.json();
      if (result.errors) throw new Error(result.errors[0].message);
      return result.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  const showAlert = (msg, type = "info") => {
    setAlert({ msg, type });
  };

  const fetchProjects = async () => {
    const query = `
      query {
         allProjects {
            _id
            name
            dep_id {
            _id
            name
            }
            managerName
            managerId
            start_date
            deadline
        }
      }
    `;

    try {
      const data = await graphqlRequest(query);
      const projects = data.allProjects;
      setProjects(projects);

      const grouped = {};
      for (const proj of projects) {
        if (!proj.managerId) continue;
        const completionPercent = await getCompletionPercentage(proj._id);
        const dep = proj.dep_id.name;
        if (!grouped[dep]) grouped[dep] = [];
        grouped[dep].push({
          id: proj._id,
          name: proj.name,
          manager: proj.managerName,
          startDate: proj.start_date,
          deadline: proj.deadline,
          completionPercent,
          dep_id: proj.dep_id._id,
          managerId: proj.managerId,
        });
      }
      setProjectsByDept(grouped);
    } catch (err) {
      showAlert(err.message || "Failed to load projects", "error");
    }
  };

  const getCompletionPercentage = async (projectId) => {
    const query = `
      query ProjectProgress($projectId: ID!) {
        projectProgress(projectId: $projectId)
      }
    `;
    try {
      const data = await graphqlRequest(query, { projectId });
      return (data.projectProgress || 0) * 100;
    } catch (err) {
      showAlert(err.message || "Failed to load project progress", "error");
      return 0;
    }
  };

  const getProjectForUser = async (userQueryId) => {
        const query = `
          query ProjectDetailsByUser($id: ID!) {
            projectDetails(id: $id) {
              id
              projectName
              depName
              dep_id
              start_date
              deadline
              managerName
              managerId
              tasks {
                _id 
                name
                state
                days_to_finish
                username
              }
            }
          }
        `;
        try {
          const data = await graphqlRequest(query, { id: userQueryId });
          if (!data.projectDetails){
            console.log('here')
            return;
          } 
          setProjectDetails(data.projectDetails);
        } catch (err) {
          showAlert(err.message || "Failed to load project", "error");
        }
  };

  const submitChanges = async () => {
    const mutation = `
      mutation UpdateProject($id: ID!, $newName: String!, $newManager: ID, $oldManager: ID , $newDeadline : String) {
        updateProject(id: $id, newName: $newName, newManager: $newManager, oldManager: $oldManager , newDeadline : $newDeadline) {
          _id
          name
        }
      }
    `;
    try {
      await graphqlRequest(mutation, {
        id: editProject.id,
        newName: updateForm.newName,
        newManager: updateForm.newManager,
        newDeadline : updateForm.newDeadLine.toString(),
        oldManager: editProject.managerId,
      });

      setEditProject(null);
      await fetchProjects();
      showAlert("Project updated successfully", "success");
    } catch (err) {
      showAlert(err.message || "Failed to update project", "error");
    }
  };

  const removeProject = async () => {
    const mutation = `
      mutation DeleteProject($id: ID!) {
        deleteProject(id: $id) {
          _id
        }
      }
    `;
    try {
      await graphqlRequest(mutation, { id: deleteProject.id });
      setDeleteProject(null);
      showAlert("Project deleted successfully", "success");
      await fetchProjects();
    } catch (err) {
      showAlert(err.message || "Failed to delete project", "error");
    }
  };

  // ------------------------- Form Data -------------------------
  const loadDepartments = async () => {
    const query = `
      query {
        allDepartments {
          _id
          name
        }
      }
    `;
    try {
      const data = await graphqlRequest(query);
      setDepartments(data.allDepartments);
    } catch (err) {
      showAlert(err.message || "Failed to load departments", "error");
    }
  };

  const loadManagers = async () => {
    const query = `
      query {
        allManagers {
          _id
          name
          dep_id{
            _id
          }
          project_id{
          _id
          }
        }
      }
    `;
    try {
      const data = await graphqlRequest(query);
      setManagers(data.allManagers);
    } catch (err) {
      showAlert(err.message || "Failed to load managers", "error");
    }
  };

  const loadEmployees = async () => {
    const query = `
      query {
        allEmployees {
          _id
          username
          dep_id{
          _id
          }
        }
      }
    `;
    try {
      const data = await graphqlRequest(query);
      setEmployees(data.allEmployees);
    } catch (err) {
      showAlert(err.message || "Failed to load employees", "error");
    }
  };

  // ------------------------- Task & Project Actions -------------------------
  const submitTask = async (taskId) => {
    const userId = JSON.parse(localStorage.getItem('user')).id;
    const mutation = `
      mutation UpdateTask($userId: ID!, $taskId: ID!) {
        updateTask(userId: $userId, taskId: $taskId) {
          _id
          state
        }
      }
    `;
    try {
      await graphqlRequest(mutation, {
        userId,
        taskId,
      });

      setProjectDetails((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((task) => task._id !== taskId),
      }));
    } catch (err) {
      showAlert(err.message || "Failed to submit task", "error");
    }
  };

  const submitProject = async () => {
    if (!projectDetails) return;
    const hasIncomplete = projectDetails.tasks.some((task) => task.state !== "done");
    if (hasIncomplete) return showAlert("Some task(s) are not done!", "error");

    const mutation = `
      mutation SubmitProject($managerId: ID! , $projectId: ID!) {
        submitProject(manager: $managerId , projectId: $projectId) {
          _id
        }
      }
    `;
    try {
      await graphqlRequest(mutation, { managerId: userId , projectId : projectDetails.id});
      showAlert("Project submitted successfully", "success");
      setTimeout(async () =>{
        await getProjectForUser(userId);
      } , 2000);
    } catch (err) {
      showAlert(err.message || "Failed to submit project", "error");
    }
  };

  const assignTask = (managerId, projId, username, depId) => {
    window.location.href = `/project?nature=create&managerid=${managerId}&project_id=${projId}&username=${username}&depid=${depId}`;
  };

  // ------------------------- Effects -------------------------
  useEffect(() => {
    if (projectDetails?.id) {
      (async () => {
        const progress = await getCompletionPercentage(projectDetails.id);
        setProjectProgress(progress);
      })();
    }
  }, [projectDetails]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const nature = queryParams.get("nature");
    // const projectId = queryParams.get("projectId");
    const userQueryId = queryParams.get("userId");
    
    const fetchManagers = async() =>{
      await loadManagers();
    }

    if (nature) {
      const fetchFormData = async () => {
        await loadDepartments();
        await loadEmployees();
        await fetchManagers();
      };
      fetchFormData();
      if (nature === "create") setProjectForm("creation");
      return;
    }
    fetchManagers();

    if (userQueryId) {
      setShowForAdmin(false);
      getProjectForUser(userQueryId);
    } else {
      setShowForAdmin(true);
      fetchProjects();
    }

    const handleClick = (e) => {
      const menu = document.getElementById("context-menu");
      const editBtn = document.getElementById("edit-action");
      const deletBtn = document.getElementById("delete-button");

      if (menu) menu.classList.add("hidden");
      if (deleteProject && deletBtn && !deletBtn.contains(e.target)) setDeleteProject(null);
      if (editBtn && editBtn.contains(e.target)) return;
      const table = document.querySelector(".users-table");
      if (table && !table.contains(e.target)) setEditProject(null);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // ------------------------- Progress Bar -------------------------
  const getBarColor = (completionPercent) => {
    const progress = completionPercent ?? 0;
    const red = Math.min(255, 255 - progress * 2.55);
    const green = Math.min(255, progress * 2.55);
    return `rgb(${red}, ${green}, 0)`;
  };

  const getProgress = (completionPercent) => completionPercent ?? 0;

  // ------------------------- JSX -------------------------
  return (
    <>
      <Header />
      <div className="glowing-orbs orb-1"></div>
      <div className="glowing-orbs orb-2"></div>
      <div className="glowing-orbs orb-3"></div>

      {alert && (
        <CustomAlert
          message={alert.msg}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      {projectForm ? (
        <>
          {projectForm === "creation" &&
            departments.length > 0 &&
            managers.length > 0 && (
              <ProjectCreationForm
                departments={departments}
                managers={managers}
                employees={employees}
                graphqlRequest = {graphqlRequest}
              />
            )}
          {projectForm === "creation" &&
            (!departments || !managers) && (
              <p className="text-center mt-6">Loading form data...</p>
            )}
        </>
      ) : (
        <>
          {showForAdmin && (
            <>
              <div className="admin-actions-container">
                <h2>Project Management</h2>
                <ul className="admin-actions-list">
                  <li>
                    <a href="/project?nature=create">➕ Create a New Project</a>
                  </li>
                </ul>
              </div>
              <ProjectAdminTable
                setSelectedProject={setSelectedProject}
                getBarColor={getBarColor}
                getProgress={getProgress}
                projectsByDept={projectsByDept}
                managers={managers}
                editProject={editProject}
                submitChanges={submitChanges}
                handleChange={handleChange}
                updateForm={updateForm}
              />
            </>
          )}

          {!showForAdmin && (
            <ProjectDetails
              projectDetails={projectDetails}
              projectProgress={projectProgress}
              getBarColor={getBarColor}
              getProgress={getProgress}
              role={role}
              submitTask={submitTask}
              username={username}
              assignTask={assignTask}
              userId={userId}
              submitProject={submitProject}
            />
          )}

          <ProjectContextMenu
            selectedProject={selectedProject}
            setDeleteProject={setDeleteProject}
            setEditProject={setEditProject}
            setUpdateForm={setUpdateForm}
          />
          {deleteProject && (
            <ProjectDeletePrompt
            setDeleteProject={setDeleteProject}
            removeProject={removeProject}
            />
          )}
        </>
      )}
    </>
  );
}
