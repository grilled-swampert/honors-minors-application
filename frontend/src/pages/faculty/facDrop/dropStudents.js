import React from "react";
import viewicon from "../../photos-logos/view.jpeg";
import approveIcon from "../../photos-logos/approve.png";
import rejectIcon from "../../photos-logos/reject.jpeg";
import "./facDrop.css";

export default function DropStudents({ student, openOverlay, branch, termId }) {
  // Extensive logging to understand what's happening
  console.log("DropStudents Component Render - Full Student Object:", student);
  console.log("DropStudents Props:", { 
    openOverlay: typeof openOverlay, 
    student, 
    branch, 
    termId 
  });

  // Wrapper function with extra logging
  const handleButtonClick = (type) => {
    console.error(`BUTTON CLICKED - Type: ${type}, Student ID: ${student._id}`);
    
    // Additional checks to ensure everything is defined
    if (!openOverlay) {
      console.error('openOverlay function is NOT DEFINED');
      return;
    }

    if (!student._id) {
      console.error('Student ID is UNDEFINED');
      return;
    }

    // Call openOverlay with extensive logging
    try {
      openOverlay(type, student._id);
    } catch (error) {
      console.error('Error in openOverlay:', error);
    }
  };

  // Action buttons render helper
  const renderActionButtons = () => {
    const actionButtons = [
      {
        type: "view",
        icon: viewicon,
        alt: "view",
        visible: true,
      },
      {
        type: "approve",
        icon: approveIcon,
        alt: "approve",
        visible: student.dropApproval !== "approved",
      },
      {
        type: "reject",
        icon: rejectIcon,
        alt: "reject",
        visible: student.dropApproval !== "rejected",
      },
    ];

    return actionButtons
      .filter((button) => button.visible)
      .map((button) => (
        <button
          key={button.type}
          // Change to use the wrapper function
          onClick={() => handleButtonClick(button.type)}
          className={`action-button ${button.type}`}
          style={{ 
            cursor: 'pointer', 
            background: 'none', 
            border: '1px solid #ccc', 
            padding: '5px' 
          }}
        >
          <img 
            src={button.icon} 
            alt={button.alt} 
            style={{ 
              width: '24px', 
              height: '24px' 
            }} 
          />
        </button>
      ));
  };

  return (
    <tr>
      <td>{student.rollNumber}</td>
      <td>{student.name}</td>
      <td>{student.email}</td>
      <td>{student.honours || "N/A"}</td>
      <td>{student.finalCourse}</td>
      <td>{student.dropApproval || "Pending"}</td>
      <td className="actions-cell">{renderActionButtons()}</td>
    </tr>
  );
}