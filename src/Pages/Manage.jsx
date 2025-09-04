import './styles/Manage.css'
import { Header } from '../Components/Header'
import { useEffect, useState } from 'react'
import axios from "axios";


export function Manage(){
const [users , setUsers] = useState([]);// used for users information
const [departments , setDepartments] = useState([]);// used to get all departments currently in the company
const [projects , setProjects] = useState([]);// used to get all the projects currently in the company

const loadUsers = async() =>{
let response = await axios.get('http://localhost:3000/users/allUsers/allInfo');
setUsers(response.data);
}
const loadDepartments = async() =>{
    let response = await axios.get('http://localhost:3000/departments');
    setDepartments(response.data);
}
const loadProjects = async() =>{
    let response = await axios.get('http://localhost:3000/projects');
    setDepartments(response.data);
}

const loadData = () =>{
    loadUsers();
    loadDepartments();
    loadProjects();
}

useEffect( () =>{
loadData();
} , []);

const getDepartments = () =>{
    return departments.map((dep) => (
            <option key={dep.id} value={dep.id}>
                {dep.name}
            </option>
    ));
}

const getProjects = () =>{
    return projects.map((project) => (
                <option key={project.id} value={project.id}>
                    {project.name}
                </option>
        ));
}


const populateTable = (userRole) =>{
let tableHTML = `
<thead>
    <td>Id</td>
    <td>Name</td>
    <td>User Name</td>
    <td>Role</td>
    <td>Dept. Name</td>
    <td>Project</td>
    <td>Promote</td>
    <td>Fire</td>
</thead>
`;
let content = "";
users.forEach(user => {
if (user.role === userRole)
content += `
<tr data-id="${user.id}">
    <td>${user.id}</td>
    <td>${user.user_name}</td>
    <td>${user.username}</td>
    <td>${user.role}</td>
    <td>${user.dept_name}</td>
    <td>${user.project_name}</td>
    <td><button data-id="${user.id}" class="btn-delete-row">Promote</button></td>
    <td><button data-id="${user.id}" class="btn-update-row">Fire</button></td>
</tr>
`;
});
return tableHTML + content;
}

return (
<>
    <Header />
    <div className="grid-background"></div>
    <div className="glowing-orbs orb-1"></div>
    <div className="glowing-orbs orb-2"></div>
    <div className="glowing-orbs orb-3"></div>
    <div className="glowing-orbs orb-4"></div>

    <h1>Welcome Mohammad Rostom</h1>

    <h3>List of users</h3>
    <div className="add-user-container">
        <button id="btn-add-user" className="btn-add-user"><i className="fas fa-plus"></i></button>
    </div>

    <div className="search-container">
        <input type="text" id="search-input" placeholder="Search by name..." />
    </div>

    <table id="employees-table" className="users-table">{populateTable('employee')}</table>
    <table id="Managers-table" className="users-table">{populateTable('manager')}</table>
    <table id="Admins-table" className="users-table">{populateTable('admin')}</table>

    <div id="modal-confirm" className="modal">
        <div className="modal-content">
            <p>Are you sure you want to fire this user?</p>
            <div className="modal-buttons">
                <button id="btn-confirm-yes" className="btn-delete">Yes</button>
                <button id="btn-confirm-no" className="btn-cancel">No</button>
            </div>
        </div>
    </div>

    <div id="modal-add" className="modal">
        <div className="modal-content">
            <p>Add a new user</p>

            <label htmlFor="input-add-name">Name</label>
            <input type="text" id="input-add-name" className="input-text" placeholder="Enter name" />

            <label htmlFor="input-add-age">Age</label>
            <input type="text" id="input-add-age" className="input-text" placeholder="Enter age" />

            <label htmlFor="input-add-username">User Name</label>
            <input type="text" id="input-add-username" className="input-text" placeholder="Enter User Name" />

            <label>Role</label>
            <div className="role-options">
                <label>
                    <input type="radio" name="role" value="admin" /> Admin
                </label>
                <label>
                    <input type="radio" name="role" value="manager" /> Manager
                </label>
                <label>
                    <input type="radio" name="role" value="employee" /> Employee
                </label>
            </div>
            
            <div className="department-option">
                <label htmlFor='select-dep-option'>Departments</label>
                <select
                id ='select-dep-option'
                className='input-select'
                >
                    <option value="">-- Select Department --</option>
                        {getDepartments()}
                </select>
            </div>
            <div className="department-option">
                <label htmlFor='select-project-option'>Project</label>
                <select
                id ='select-project-option'
                className='input-select'
                >
                    <option value="">-- Select Project --</option>
                        {getProjects()}
                </select>
            </div>

            <div className="modal-buttons">
                <button id="btn-add-confirm" className="btn-update">
                    Add User
                </button>
                <button id="btn-add-cancel" className="btn-cancel">
                    Cancel
                </button>
            </div>
        </div>
    </div>


    <div id="modal-update" className="modal">
        <div className="modal-content">
            <p>Update User&apos;s Info</p>
            <label htmlFor="input-update-name">Name</label>
            <input id="input-update-name" className="input-text" type="text" placeholder="Enter New Name" />
            <label htmlFor="input-update-age">Age</label>
            <input id="input-update-age" className="input-text" type="text" placeholder="Enter New Age" />
            <div className="modal-buttons">
                <button id="btn-update-confirm" className="btn-update">Update</button>
                <button id="btn-update-cancel" className="btn-cancel">Cancel</button>
            </div>
        </div>
    </div>

    <div id="context-menu" className="hidden">
        <button id="show-profile">Show Profile</button>
    </div>

</>
)
}
