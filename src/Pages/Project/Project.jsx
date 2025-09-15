import "../styles/Project.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { Header } from "../../Components/Header";
import { CustomAlert } from "../../Components/CustomAlert";
import { ProjectAdminTable } from "./ProjectAdminTable";
import { ProjectDetails } from "./ProjectDetails";
import { ProjectCreationForm } from "./ProjectCreationForm";
import { ProjectContextMenu } from "./ProjectContextMenu";
import { ProjectDeletePrompt } from "./ProjectDeletePrompt";

export function Project() {
    const [alert, setAlert] = useState(null); // for custom alert 
    const [projectsByDept, setProjectsByDept] = useState({}); // for project' data
    const [projectDetails, setProjectDetails] = useState(null); // details of a single project
    const [selectedProject, setSelectedProject] = useState(null); // selected project for a detailed review
    const [projectProgress, setProjectProgress] = useState(0); // progress detail
    const [projectForm, setProjectForm] = useState(""); // create project form 
    const [departments, setDepartments] = useState([]); // for creation form
    const [managers, setManagers] = useState([]); // for creation form 
    const [employees, setEmployees] = useState([]); // for task creation form
    const [projects, setProjects] = useState([]); // gets all the projects
    const [editProject, setEditProject] = useState(null); // track which project to edit 
    const [deleteProject, setDeleteProject] = useState(null); // track which project to delete

    const [updateForm, setUpdateForm] = useState({ // update form for projects
        newName: "",
        newDeadLine: "",
        newManager: ""
    });

    const token = localStorage.getItem("token");
    const role = JSON.parse(localStorage.getItem("user")).role;
    const userId = JSON.parse(localStorage.getItem("user")).id;
    const username = JSON.parse(localStorage.getItem("user")).userName;

    const BASE_URL = import.meta.env.VITE_API_URL;// import base url from env file

    const handleChange = (e) => {
        setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
    };

    const submitChanges = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.put(
                `${BASE_URL}/projects/update/${editProject.id}/${editProject.managerId}`,
                {
                    newName: updateForm.newName,
                    newManager: updateForm.newManager,
                    newDeadline: updateForm.newDeadLine
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setEditProject(null);

            // ✅ Re-fetch all projects to reflect the swap immediately
            const res = await axios.get(`${BASE_URL}/projects/extend/departments`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = res.data;
            setProjects(data);

            const grouped = {};
            await Promise.all(
                data.map(async (proj) => {
                    const completionPercent = await getCompletionPercentage(proj.projId);
                    const dep = proj.depName;
                    if (!grouped[dep]) grouped[dep] = [];
                    grouped[dep].push({
                        id: proj.projId,
                        name: proj.projName,
                        manager: proj.name,
                        startDate: proj.start_date,
                        deadline: proj.deadline,
                        completionPercent,
                        dep_id: proj.dep_id,
                        managerId: proj.managerId
                    });
                })
            );

            setProjectsByDept(grouped);
            showAlert(response.data.message, 'success');

        } catch (err) {
            if (err.response)
                showAlert(err.response.data.message || 'Server error, please try again');
            else
                showAlert("Network error, please try again later");
        }
    };

    const removeProject = async () => {
        try {
            await axios.delete(`${BASE_URL}/projects/delete`, {
                data: { projectId: deleteProject.id },
                headers: { Authorization: `Bearer ${token}` }
            });

            showAlert('Project successfully deleted with all its related tasks', 'success');
            setDeleteProject(null);

            // we need to update projects again
            const res = await axios.get(`${BASE_URL}/projects/extend/departments`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = res.data;
            setProjects(data);

            const grouped = {};
            await Promise.all(
                data.map(async (proj) => {
                    const completionPercent = await getCompletionPercentage(proj.projId);
                    const dep = proj.depName;
                    if (!grouped[dep]) grouped[dep] = [];
                    grouped[dep].push({
                        id: proj.projId,
                        name: proj.projName,
                        manager: proj.name,
                        startDate: proj.start_date,
                        deadline: proj.deadline,
                        completionPercent,
                        dep_id: proj.dep_id,
                        managerId: proj.managerId
                    });
                })
            );

            setProjectsByDept(grouped);

        } catch (err) {
            if (err.response)
                showAlert(err.response.data.message || 'Server error, please try again');
            else
                showAlert("Network error, please try again later");
        }
    };

    const loadDepartmenst = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/departments/allDepartments`);
            setDepartments(response.data);
        } catch (err) {
            if (err.response)
                showAlert(err.response.data.message || 'Server error, please try again');
            else
                showAlert("Network error, please try again later");
        }
    };

    const loadManagers = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/users/managers`);
            setManagers(response.data);
        } catch (err) {
            if (err.response)
                showAlert(err.response.data.message || 'Server error, please try again');
            else
                showAlert("Network error, please try again later");
        }
    };

    const loadEmployees = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/users/all/employees`);
            setEmployees(response.data);
        } catch (err) {
            if (err.response)
                showAlert(err.response.data.message || 'Server error, please try again');
            else
                showAlert("Network error, please try again later");
        }
    };

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
        const nature = queryParams.get('nature'); // nature is for the admin's action bar (create / update / delete)
        const projectId = queryParams.get('projectId'); // for admins when they want to view a specific project
        const userId = queryParams.get('userId'); // for employees and managers

        if (nature) { // admin's project Management dashboard
            // load some data for the forms
            const fetchFormData = async () => {
                await loadDepartmenst();
                await loadEmployees();
                await loadManagers();
            };
            fetchFormData();

            if (nature === 'create') {
                setProjectForm('creation');
            }
            return;
        }

        const fetchManager = async () => {
            await loadManagers();
        };
        fetchManager();

        const fetchProjects = async () => {
            if (!projectId) { // normal admin page (overview of all projects)
                try {
                    const res = await axios.get(`${BASE_URL}/projects/extend/departments`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = res.data;
                    setProjects(data);

                    const grouped = {};
                    await Promise.all(
                        data.map(async (proj) => {
                            const completionPercent = await getCompletionPercentage(proj.projId);
                            const dep = proj.depName;
                            if (!grouped[dep]) grouped[dep] = [];
                            grouped[dep].push({
                                id: proj.projId,
                                name: proj.projName,
                                manager: proj.name,
                                startDate: proj.start_date,
                                deadline: proj.deadline,
                                completionPercent,
                                dep_id: proj.dep_id,
                                managerId: proj.managerId
                            });
                        })
                    );

                    setProjectsByDept(grouped);

                } catch (err) {
                    if (err.response)
                        showAlert(err.response.data.message || "Server error , please try again", "error");
                    else
                        showAlert("Network error, please try again later");
                }

            } else { // show project details for admin 
                try {
                    const response = await axios.get(`${BASE_URL}/projects/details/${projectId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = response.data;
                    setProjectDetails(data);
                } catch (err) {
                    if (err.response)
                        showAlert(err.response.data.message || 'Server error, please try again');
                    else
                        showAlert("Network error, please try again later");
                }
            }
        };

        if (userId) { // show page for managers and employees (project details straight away)
            const getProjectForUser = async () => {
                try {
                    const response = await axios.get(`${BASE_URL}/projects/details/user/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = response.data;
                    setProjectDetails(data);
                } catch (err) {
                    if (err.response)
                        showAlert(err.response.data.message || 'Server error, please try again');
                    else
                        showAlert("Network error, please try again later");
                }
            };
            getProjectForUser();
        } else { // show normal page for admins
            fetchProjects();
        }

        // FOR HIDING CONTEXT MENU WHENEVER THE PAGE IS CLICKED 
        const handleClick = (e) => {
            const menu = document.getElementById("context-menu");
            const editBtn = document.getElementById("edit-action");
            const deletBtn = document.getElementById('delete-button');

            // Always hide the context menu
            if (menu) menu.classList.add("hidden");

            if (deleteProject && !deletBtn.contains(e.target)) {
                setDeleteProject(null);
            }

            // If user clicked the edit button → don't clear edit mode
            if (editBtn && editBtn.contains(e.target)) return;

            // Otherwise → only clear edit mode if clicked outside the table
            const table = document.querySelector(".users-table");
            if (table && !table.contains(e.target)) {
                setEditProject(null);
            }
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);

    }, []);

    const assignTask = (managerId, projId, username, depId) => {
        window.location.href = `/project?nature=create&managerid=${managerId}&project_id=${projId}&username=${username}&depid=${depId}`;
    };

    const removeTask = (tasks, taskId) => {
        return tasks.filter(task => task.id !== taskId);
    };

    const submitTask = async (taskId) => {
        try {
            await axios.put(`${BASE_URL}/tasks/update`, { taskId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProjectDetails(prev => ({
                ...prev,
                tasks: removeTask(prev.tasks, taskId)
            }));

        } catch (err) {
            if (err.response)
                showAlert(err.response.data.message || 'Server error, please try again');
            else
                showAlert("Network error, please try again later");
        }
    };

    const getProjectDetails = async () => {
        window.location.href = `/project?projectId=${selectedProject.id}`;
    };

    const getCompletionPercentage = async (projectId) => {
        try {
            const res = await axios.get(`${BASE_URL}/projects/progress/${projectId}`);
            return res?.data?.ratio ? res.data.ratio * 100 : 0;
        } catch (err) {
            if (!err.response) showAlert("Network error, please try again later");
        }
    };

    const showAlert = (msg, type = "info") => {
        setAlert({ msg, type });
    };

    const getBarColor = (completionPercent) => {
        const progress = getProgress(completionPercent);
        const red = Math.min(255, 255 - progress * 2.55);
        const green = Math.min(255, progress * 2.55);
        return `rgb(${red}, ${green}, 0)`;
    };

    const getProgress = (completionPercent) => {
        return completionPercent ?? 0;
    };

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

            {projectForm != "" ? (
                <>
                    {projectForm === 'creation' && (
                        <>
                            {departments.length > 0 && managers.length > 0 ? (
                                <ProjectCreationForm
                                    departments={departments}
                                    managers={managers}
                                    employees={employees}
                                />
                            ) : (
                                <p className="text-center mt-6">Loading form data...</p>
                            )}
                        </>
                    )}
                </>
            ) : (
                <>
                    {/* FOR ADMINS ONLY */}
                    {!projectDetails && (
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

                    {/* FOR MANAGERS AND EMPLOYEES (ADMINS CAN ACCESS THROUGH CONTEXT MENU) */}
                    {projectDetails && (
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
                        />
                    )}

                    {/* Context Menu */}
                    <ProjectContextMenu
                    selectedProject={selectedProject}
                    setDeleteProject={setDeleteProject}
                    setEditProject={setEditProject}
                    getProjectDetails={getProjectDetails}
                    setUpdateForm={setUpdateForm}
                    />
                    {/* Delete Prompt */}
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
