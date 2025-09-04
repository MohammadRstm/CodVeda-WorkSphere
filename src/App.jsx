import './App.css'
import { BrowserRouter as Router , Routes, Route } from "react-router-dom";
import { Home } from './Pages/Home';
import { AboutUs } from './Pages/AboutUs';
import {Profile} from './Pages/Profile';
import { Manage } from './Pages/Manage';


function App() {
  return (
    <>
      <Routes>
        <Route path = "/" element={<Home />} />
        <Route path = "/aboutUs" element={<AboutUs />} />
        <Route path = "/profile" element={<Profile />} />
        <Route path = "/manage" element={<Manage />} />
      </Routes>
    </>
  )
}

export default App
