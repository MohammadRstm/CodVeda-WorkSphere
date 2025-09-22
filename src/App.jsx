import './App.css'
import { BrowserRouter as Router , Routes, Route } from "react-router-dom";
import { Home } from './Pages/HomePage/Home';
import { AboutUs } from './Pages/AboutUsPage/AboutUs';
import {Profile} from './Pages/ProfilePage/Profile';
import { Manage } from './Pages/ManagePage/Manage';
import { Login } from './Pages/Login';
import { SignUp } from './Pages/SignUp';
import { Project } from './Pages/Project/Project';
import { useEffect , useState} from 'react';
import { CustomAlert } from './Components/CustomAlert';
import { onNotification , offNotification , getSocket} from '../socketClient';
import ChatWidget from './Components/ChatWidget';
import { useLocation } from 'react-router-dom';

/*
whats next?
-- add a websocket to send users notifications -VL - done (add a message collection in the db for saving user messages)
-- migrate the whole mysql database with its data to a MONGO data base -VVL -- DONE
-- go through the whole project again and look for redundant code and eliminate it -L
-- change your restful api system to a graphQL one -VVVL - 
-- prepare files for online access i.e for deployment on AWS- L 
-- create huge testcase runs on every file making sure nothing is broken- L -> VVVVL - 3/4 done
-- go through backend file and also eliminate redundant code- L - done
-- deploy both front and back ends making sure everything works on the internet - L
*/

/*

logic fixes : 
-- Allow managers to submit project (set project_id to null in db for them when done) - done
-- Don't allow promotion to manager unless all tasks are submited and reset the task array in db to null - done
-- Don't allow promotion to admin unless the manager's project is submitted reset project_id to null in db - done
-- Allow for demotion - done
-- profile page looks ass - looks fine now - done
-- Allow managers to be assigned a project when they have one already only when that project is the demo one - done
*/

/*
Phase 1  :
-- testing with new backend:
-- login - works
-- sign up - works
-- profile - works
-- manage - works
-- log out - works 
-- projects - works

-- TEST COMPLETE --

Phase 2 :
-- testing system notifications:
-- task notifications
-- project assigment(manager)
-- project submission (admin)
-- messaging system : 
--- ensure messages are still received even when the user is on the chat box - done
--- create a messages collection in the db to save messages - done 
--- only load the messages that belong to the current chat opened - done
--- display the number of messages received from different chats near the chat box
----Bugs : - on page reload the socket gets disconnected so we need to intialize it again
*/

function App() {

  const [alert, setAlert] = useState(null); // for custom alert 
  const [socketReady , setSocketReady] = useState(false);

  const location = useLocation();

  // Paths where the chat widget should NOT appear
  const hideChatPaths = ["/", "/SignUp","/aboutUs"];
  const showChat = !hideChatPaths.includes(location.pathname);


  const showAlert = (msg, type = "info") => {
    setAlert({ msg, type });
  };

  useEffect(() => {
  let intervalId;

  const handleNotification = (data) => {
    if (!data) return;
    console.log("Notification", data);
    showAlert(data.message);
  };

  const checkSocket = () => {
    const socket = getSocket();
    if (socket) {
      setSocketReady(true);
      onNotification(handleNotification); // attach listener
      clearInterval(intervalId); // stop polling
    }
  };

  intervalId = setInterval(checkSocket, 100); // check every 100ms

  return () => {
    clearInterval(intervalId);
    try {
      offNotification(handleNotification);
    } catch (err) {
      console.log(err.message || "Socket not initialized, cannot remove listener");
    }
  };
}, []);


  return (
    <>
      {alert && (
      <CustomAlert
        message={alert.msg}
        type={alert.type}
        onClose={() => setAlert(null)}
      />
      )}
      <Routes>
        <Route path = "/" element={<Login />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path = "/Home" element={<Home />} />
        <Route path = "/aboutUs" element={<AboutUs />} />
        <Route path = "/profile" element={<Profile />} />
        <Route path = "/manage" element={<Manage />} />
        <Route path ="/project" element ={<Project />} />
      </Routes>
      {showChat && socketReady && <ChatWidget />}
      
    </>
  )
}

export default App
