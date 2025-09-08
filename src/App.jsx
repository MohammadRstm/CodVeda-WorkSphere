import './App.css'
import { BrowserRouter as Router , Routes, Route } from "react-router-dom";
import { Home } from './Pages/HomePage/Home';
import { AboutUs } from './Pages/AboutUsPage/AboutUs';
import {Profile} from './Pages/ProfilePage/Profile';
import { Manage } from './Pages/ManagePage/Manage';
import { Login } from './Pages/Login';
import { SignUp } from './Pages/SignUp';
import { Task } from './Pages/Task';
import { Project } from './Pages/Project';


function App() {
  return (
    <>
      <Routes>
        <Route path = "/" element={<Login />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path = "/Home" element={<Home />} />
        <Route path = "/aboutUs" element={<AboutUs />} />
        <Route path = "/profile" element={<Profile />} />
        <Route path = "/manage" element={<Manage />} />
        <Route path ="/project" element ={<Project />} />
        <Route path = "/task" element = {<Task />} />
      </Routes>
    </>
  )
}

export default App
