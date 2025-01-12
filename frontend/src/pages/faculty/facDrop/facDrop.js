import React, { useEffect, useState } from "react";
import "./facDrop.css";
import Header from "../../header/header";
import FacNavbar from "../facNavbar/facNavbar";
import DropStudents from "./dropStudents";
import axios from "axios";
import PDFPreviewOverlay from "./PDFPreviewOverlay";
import { useParams } from "react-router-dom";

function FacDrop() {
  const [dropStudents, setDropStudents] = useState([]);
  const [overlayState, setOverlayState] = useState({
    isVisible: false,
    pdfUrl: null,
  });
  const { branch, termId } = useParams();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";

  useEffect(() => {
    const fetchDropStudents = async () => {
      try {
        console.log("Fetching drop students for:", { branch, termId });
        const response = await axios.get(`${API_BASE_URL}/faculty/${branch}/${termId}/edit/facDrop`);
        setDropStudents(response.data);
      } catch (error) {
        console.error("Error fetching drop students:", error.response?.data || error.message);
      }
    };
    fetchDropStudents();
  }, [branch, termId]);

  const handleApprove = async (studentId) => {
    try {
      await axios.put(`${API_BASE_URL}/faculty/${branch}/${termId}/edit/facDrop/approve`, {
        studentId,
      });
      setDropStudents((prev) =>
        prev.map((student) =>
          student._id === studentId ? { ...student, dropApproval: "approved" } : student
        )
      );
    } catch (error) {
      console.error("Error approving drop request:", error.response?.data || error.message);
    }
  };

  const handleReject = async (studentId) => {
    const rejectionReason = prompt("Enter rejection reason:");
    if (!rejectionReason) return;

    try {
      await axios.put(`/faculty/${branch}/${termId}/edit/facDrop/reject`, {
        studentId,
        rejectionReason,
      });
      setDropStudents((prev) =>
        prev.map((student) =>
          student._id === studentId ? { ...student, dropApproval: "rejected" } : student
        )
      );
    } catch (error) {
      console.error("Error rejecting drop request:", error.response?.data || error.message);
    }
  };

  const handleShowPreview = (studentId) => {
    axios
      .get(`${API_BASE_URL}/faculty/${branch}/${termId}/edit/facDrop`, { responseType: "blob" })
      .then((response) => {
        const pdfUrl = URL.createObjectURL(response.data);
        setOverlayState({
          isVisible: true,
          pdfUrl: pdfUrl,
        });
      })
      .catch((error) => {
        console.error("Error fetching PDF:", error.response?.data || error.message);
        alert("Failed to fetch the drop application file. Please try again.");
      });
  };
   

  return (
    <div className="drop-main">
      <Header />
      <FacNavbar />
      <div className="drop-content">
        <table className="drop-table">
          <thead>
            <tr>
              <th>ROLL NO</th>
              <th>NAME OF STUDENT</th>
              <th>EMAIL</th>
              <th>HONOURS/MINORS</th>
              <th>PROGRAM</th>
              <th>VIEW APPLICATION</th>
              <th>DROP APPROVAL</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {dropStudents.map((student) => (
              <DropStudents
                key={student._id}
                student={student}
                handleApprove={handleApprove}
                handleReject={handleReject}
                handleShowPreview={handleShowPreview}
              />
            ))}
          </tbody>
        </table>
        {overlayState.isVisible && (
          <PDFPreviewOverlay
            show={overlayState.isVisible}
            handleClose={() => setOverlayState({ isVisible: false, pdfUrl: null })}
            pdfUrl={overlayState.pdfUrl}
          />
        )}
      </div>
    </div>
  );
}

export default FacDrop;
