import React from "react";
import "./fac-student-details.css";
import view from "../../../photos-logos/view (1).png";

export default function ViewDashboard({
  handleViewButtonClick,
  handleDeleteButtonClick,
  student,
}) {
  return (
    <div>
      <div className="student-info-grid-item" key={student._id}>
        <h4 className="student-info-heading">Name of Student:</h4>
        <p className="student-info">{student.name}</p>
        <h4 className="student-info-heading">Roll No.:</h4>
        <p className="student-info">{student.rollNumber}</p>
        <h4 className="student-info-heading">Status:</h4>
        <p className="student-info">{student.status}</p>
        <div className="view1">
          <button
            className="view-Btn"
            onClick={() => handleViewButtonClick(student)}
          >
            <img className="viewImage" src={view} alt="View" />
          </button>
          <button
            onClick={() => handleDeleteButtonClick(student._id)}
            className="deleteBtn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="delete-svgIcon"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 4h16l-1 2H5L4 4z"
                fill="white"
              />
              <path
                d="M5 8h14v12H5V8zm3 2h2v8H8v-8zm6 0h-2v8h2v-8z"
                fill="white"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
