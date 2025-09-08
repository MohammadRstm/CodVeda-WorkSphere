import "./styles/Project.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { Header } from "../Components/Header";
import { CustomAlert } from "../Components/CustomAlert";

export function Project(){

    const [projects , setProjects] = useState(null);

    const [alert , setAlert] = useState(null);


    useEffect(() =>{
        loadProjects();
    },[])

    const token = localStorage.getItem("token");
    const role = localStorage.getItem('user').role;


    const showAlert = (msg, type = "info") => {
        setAlert({ msg, type });
    };

    const loadProjects = async () =>{
        try{
        const loadedProjects = await axios.get('http://localhost:3000/projects/extended/departments' , 
            {},
            {
                headers :{
                    Authorization : `Bearer ${token}`
                } 
            }
        );
        setProjects(loadedProjects);
    }catch(err){
        if (err.response)
            showAlert(err.response.data.message , "error");
        else
            showAlert("Network error , please try again" , 'error');
    }
    }

    return (
        <>
            <Header />
            {alert && (
                <CustomAlert
                    message={alert.msg}
                    type={alert.type}
                    onClose={() => setAlert(null)}
                />
            )}
            {(role === 'admin') ? (
                <>

                </>
            ) : (
                <>

                </>
            )}

        </>
    );
}