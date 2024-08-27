import React, { useState } from 'react';
import './facNavbar.css'; 
import { Link } from 'react-router-dom';

const FacNavbar = ()=>{
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
      };
    return(
        <div className="adminSidebar">
        <div id="sidebar" style={{ width: isSidebarOpen ? "250px" : "0" }}>
        <Link to="/facAddStudent"><button className="nav-btn">Add Student</button></Link>
        <Link to="/facDrop"><button className="nav-btn">Drop Student</button></Link> 
         </div>

      <div id="side-nav">
        <span onClick={toggleSidebar}>&#9776;</span>
      </div>
      </div>
    );
}
export default FacNavbar;