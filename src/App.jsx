import './App.css'
import { BrowserRouter as Router , Routes, Route } from "react-router-dom";
import { Home } from './Pages/HomePage/Home';
import { AboutUs } from './Pages/AboutUsPage/AboutUs';
import {Profile} from './Pages/ProfilePage/Profile';
import { Manage } from './Pages/ManagePage/Manage';
import { Login } from './Pages/Login';
import { SignUp } from './Pages/SignUp';
import { Project } from './Pages/Project/Project';


/*
whats next?
-- add a websocket to send managers notifications about project's deadline -VL
-- migrate the whole mysql database with its data to a MONGO data base -VVL
-- go through the whole project again and look for redundant code and eliminate it -L
-- change your restful api system to a graphQL one -VVVL
-- prepare files for online access i.e for deployment on AWS- L
-- create huge testcase runs on every file making sure nothing is broken- L -> VVVVL
-- go through backend file and also eliminate redundant code- L
-- deploy both front and back ends making sure everything works on the internet - L
*/

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
      </Routes>
    </>
  )
}

export default App
