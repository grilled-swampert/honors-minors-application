import React from "react";
import "./facDrop.css";

export default function DropStudents({ student, handleApprove, handleReject, handleShowPreview }) {
  return (
    <tr>
      <td>{student.rollNumber}</td>
      <td>{student.name}</td>
      <td>{student.email}</td>
      <td>{student.honours || "N/A"}</td>
      <td>{student.finalCourse}</td>
      <td>
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
      <td>{student.dropApproval || "Pending"}</td>
      <td className="actions-cell">
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
