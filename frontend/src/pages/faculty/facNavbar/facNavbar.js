import React, { useState } from "react";
import "./facNavbar.css";
import { Link, useLocation, useParams } from "react-router-dom";

const FacNavbar = () => {
  const { termId, branch } = useParams();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  return (
    <div className="add-students-sidebar">
        <Link to={`/faculty/${branch}/${termId}/edit/facAddStudent`}>
          <button
            className={`add-students-button ${
              isActive(`/faculty/${branch}/${termId}/edit/facAddStudent`)
                ? "active"
                : "inactive"
            }`}
          >
            <span className="circle" aria-hidden="true">
              <span className="icon arrow"></span>
            </span>
            <span className="button-text">Add Students</span>
          </button>
        </Link>
        <Link to={`/faculty/${branch}/${termId}/edit/facDrop`}>
          <button
            className={`add-students-button ${
              isActive(`/faculty/${branch}/${termId}/edit/facDrop`)
                ? "active"
                : "inactive"
            }`}
          >
            <span className="circle" aria-hidden="true">
              <span className="icon arrow"></span>
            </span>
            <span className="button-text">Drop Students</span>
          </button>
        </Link>
    </div>
  );
};
export default FacNavbar;
