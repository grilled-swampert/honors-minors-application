import React, { useState } from "react";
import "./adminSidebar.css";
import { Link, useLocation, useParams } from "react-router-dom";

const AdminSideBar = () => {
  const { termId } = useParams();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="add-courses-sidebar">
      <Link to={`/admin/${termId}/edit/addCourses`}>
        <button
          className={`add-courses-button ${
            isActive(`/admin/${termId}/edit/addCourses`) ? "active" : "inactive"
          }`}
        >
          <span className="circle" aria-hidden="true">
            <span className="icon arrow"></span>
          </span>
          <span className="button-text">Add Syllabus</span>
        </button>
      </Link>
      <Link to={`/admin/${termId}/edit/allocation`}>
        <button
          className={`add-courses-button ${
            isActive(`/admin/${termId}/edit/allocation`) ? "active" : "inactive"
          }`}
        >
          <span className="circle" aria-hidden="true">
            <span className="icon arrow"></span>
          </span>
          <span className="button-text">Allocation</span>
        </button>
      </Link>
      <Link to={`/admin/${termId}/edit/broadcast`}>
        <button
          className={`add-courses-button ${
            isActive(`/admin/${termId}/edit/broadcast`) ? "active" : "inactive"
          }`}
        >
          <span className="circle" aria-hidden="true">
            <span className="icon arrow"></span>
          </span>
          <span className="button-text">Broadcast</span>
        </button>
      </Link>
    </div>
  );
};
export default AdminSideBar;