import React from "react";
import "./facDrop.css";

export default function DropStudents({ student, handleApprove, handleReject, handleShowPreview }) {
  return (
    <tr>
      <td data-label="Roll No">{student.rollNumber}</td>
      <td data-label="Name">{student.name}</td>
      <td data-label="Email">{student.email}</td>
      <td data-label="Honours/Minors">{student.honours || "N/A"}</td>
      <td data-label="Program">{student.finalCourse}</td>
      <td data-label="Drop Application">
        {student.dropFile ? (
          <button
            className="action-button preview-button"
            onClick={() => handleShowPreview(student._id)}
          >
            Preview
          </button>
        ) : (
          "No File"
        )}
      </td>
      <td data-label="Drop Approval">{student.dropApproval || "Pending"}</td>
      <td data-label="Actions" className="actions-cell">
        <button
          className="action-button approve-button"
          onClick={() => handleApprove(student._id)}
        >
          Approve
        </button>
        <button
          className="action-button reject-button"
          onClick={() => handleReject(student._id)}
        >
          Reject
        </button>
      </td>
    </tr>
  );
}
