import "../styles/Project.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { Header } from "../../Components/Header";
import { CustomAlert } from "../../Components/CustomAlert";
import { ProjectAdminTable } from "./ProjectAdminTable";
import { ProjectDetails } from "./ProjectDetails";

export function Project(){
    
    const [alert , setAlert] = useState(null);// for custom alert 
    const [projectsByDept, setProjectsByDept] = useState({});// for project' data
    const [projectDetails , setProjectDetails] = useState(null);// details of a single project
    const [selectedProject , setSelectedProject] = useState(null);// selected project for a detailed review
    const [projectProgress, setProjectProgress] = useState(0);// progress detail


    const token = localStorage.getItem("token");
    const role = JSON.parse(localStorage.getItem('user')).role;

useEffect(() => {
  if (projectDetails?.id) {
    (async () => {
      const progress = await getCompletionPercentage(projectDetails.id);
      setProjectProgress(progress);
    })();
  }
}, [projectDetails]);

useEffect(() => {
    const hideMenu = (e) => {
      if (e.button === 0) {
        const el = document.getElementById("context-menu");
        if (el) el.classList.add("hidden");
      }
    };
    document.addEventListener("click", hideMenu);
    return () => document.removeEventListener("click", hideMenu);
}, []);

useEffect(() => {
  const fetchProjects = async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const projectId = queryParams.get('id');

    if (!projectId){
        try {
        const res = await axios.get("http://localhost:3000/projects/extend/departments",{
            headers :{
                Authorization : `Bearer ${token}`
            }
        });
        const data = res.data; 
        

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
            completionPercent
            });
        })
        );

setProjectsByDept(grouped);
        } catch (err) {
        if(err.response)
            showAlert(err.response.data.message || "Server error , please try again" , "error");
        else
            showAlert("Network error, please try again later");
        }
    }else{// show project details
        try{
            console.log('here')
            const response = await axios.get(`http://localhost:3000/projects/details/${projectId}`,
                {
                    headers :{
                        Authorization : `Bearer ${token}`
                    }
                }
            );
            const data = response.data;
            setProjectDetails(data);
        }catch(err){
            if(err.response)
                showAlert(err.response.data.message || 'Server error, please try again');
            else
                showAlert("Network error, please try again later");
        }
    }
  };
  fetchProjects();
}, []);


const getProjectDetails = async () =>{
    window.location.href = `/project?id=${selectedProject}`;
}

const getCompletionPercentage = async (projectId) => {
    try{
        const res = await axios.get(`http://localhost:3000/projects/progress/${projectId}`);
        return res?.data?.ratio ? res.data.ratio * 100 : 0;
    }catch(err){
         if(err.response)
            showAlert(err.response.data.message || 'Server error, please try again');
        else
            showAlert("Network error, please try again later");
    }
}

const showAlert = (msg, type = "info") => {
    setAlert({ msg, type });
};

const getBarColor = (completionPercent) =>{
    const progress = getProgress(completionPercent);
    const red = Math.min(255, 255 - progress * 2.55);
    const green = Math.min(255, progress * 2.55);
    return `rgb(${red}, ${green}, 0)`;
};

const getProgress = (completionPercent) =>{
    return completionPercent ?? 0;
}

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
            {!projectDetails && (
                role === 'admin' ? (
                    <>  
                        <div className="admin-actions-container">
                            <h2>Project Management</h2>
                            <ul className="admin-actions-list">
                                <li>
                                <a href="/project?nature=create">➕ Create a New Project</a>
                                </li>
                                <li>
                                <a href="/project?nature=delete">🗑️ Delete an Existing Project</a>
                                </li>
                                <li>
                                <a href="/project?nature=update">✏️ Update Project Information</a>
                                </li>
                            </ul>
                        </div>

                        <ProjectAdminTable
                        setSelectedProject={setSelectedProject}
                        getBarColor={getBarColor}
                        getProgress={getProgress}
                        projectsByDept={projectsByDept}
                       />
                    </>
                ) : (
                    <>

                    </>
                )
            
            )}
            {projectDetails && (
                <ProjectDetails
                projectDetails={projectDetails}
                projectProgress={projectProgress}
                getBarColor={getBarColor}
                getProgress={getProgress}
                />
            )}

            {/*Context Menu */}
            <div id="context-menu" className="hidden">
                <button id="show-profile" onClick={getProjectDetails}>
                    details
                </button>
            </div>
            
        </>
    );
}