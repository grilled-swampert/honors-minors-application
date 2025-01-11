import React, { useState } from "react";
import viewicon from "../../photos-logos/view.jpeg";
import approveIcon from "../../photos-logos/approve.png";
import rejectIcon from "../../photos-logos/reject.jpeg";
import "./facDrop.css";
import PdfPreviewOverlay from './PDFPreviewOverlay';  // Import PDF preview overlay component

export default function DropStudents({
  student,
  openOverlay,
  branch,
  termId,
  handleShowPreview,  // Receive the function to show the preview
}) {
  const [overlayState, setOverlayState] = useState({
    isVisible: false,
    pdfUrl: null,
  });

  // Function to handle showing the PDF preview
  const handlePreviewClick = () => {
    handleShowPreview(student._id);  // Trigger the function passed from FacDrop
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
          onClick={() => openOverlay(button.type, student._id)}  // Open overlay for view/approve/reject
          className={`action-button ${button.type}`}
          style={{
            cursor: 'pointer',
            background: 'none',
            border: '1px solid #ccc',
            padding: '5px',
          }}
        >
          <img
            src={button.icon}
            alt={button.alt}
            style={{
              width: '24px',
              height: '24px',
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
      <td>{student.dropApplication}</td>
      <td>{student.dropApproval || "Pending"}</td>
      <td className="actions-cell">
        {renderActionButtons()}
        <button
          onClick={handlePreviewClick}  // Use the function to show the PDF preview
          className="action-button preview-button"
          style={{
            cursor: 'pointer',
            background: 'none',
            border: '1px solid #ccc',
            padding: '5px',
            marginTop: '5px',
          }}
        >
          Preview Drop Application
        </button>
      </td>

      {/* PDF Preview Overlay */}
      {overlayState.isVisible && (
        <PdfPreviewOverlay
          show={overlayState.isVisible}
          handleClose={() => setOverlayState({ isVisible: false, pdfUrl: null })}
          pdfUrl={overlayState.pdfUrl}
        />
      )}
    </tr>
  );
}
