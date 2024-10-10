import React, { useState } from "react";
import "./adminSidebar.css";
import { Link, useParams } from "react-router-dom";

const AdminSideBar = () => {
  const { termId } = useParams();

  return (
    <div className="adminSidebar-body">
      <div id="adminSidebar">
        <Link to={`/admin/${termId}/edit/addCourses`}>
          <button className="nav-btn">Add Syllabus</button>
        </Link>
        <Link to={`/admin/${termId}/edit/allocation`}>
          <button className="nav-btn">Allocation</button>
        </Link>
        <Link to={`/admin/${termId}/edit/broadcast`}>
          <button className="nav-btn">Broadcast Message</button>
        </Link>
      </div>
    </div>
  );
};
export default AdminSideBar;