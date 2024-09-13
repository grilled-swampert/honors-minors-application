import React, { useState } from "react";
import "./adminSidebar.css";
import { Link, useParams } from "react-router-dom";

const AdminSideBar = () => {
  const { termId } = useParams();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  return (
    <div className="adminSidebar">
      <div id="sidebar" style={{ width: isSidebarOpen ? "250px" : "0" }}>
        <Link to={`/admin/${termId}/edit/addCoursesPage`}>
          <button className="nav-btn">Add Syllabus</button>
        </Link>
        <Link to={`/admin/${termId}/edit/allocation`}>
          <button className="nav-btn">Allocation</button>
        </Link>
        <Link to={`/admin/${termId}/edit/broadcast`}>
          <button className="nav-btn">Broadcast Message</button>
        </Link>
      </div>

      <div id="side-nav">
        <span onClick={toggleSidebar}>&#9776;</span>
      </div>
    </div>
  );
};
export default AdminSideBar;
