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
  const [loading, setLoading] = useState(false);
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";

  useEffect(() => {
    const fetchDropStudents = async () => {
      try {
        console.log("Fetching drop students for:", { branch, termId });
        const response = await axios.get(
          `${API_BASE_URL}/faculty/${branch}/${termId}/edit/facDrop`
        );
        setDropStudents(response.data);
      } catch (error) {
        console.error(
          "Error fetching drop students:",
          error.response?.data || error.message
        );
      }
    };
    fetchDropStudents();
  }, [branch, termId]);

  const handleApprove = async (studentId) => {
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:9000/faculty/${branch}/${termId}/edit/facDrop/`,
        {
          studentId,
          isApproved: true,
        }
      );
      setDropStudents((prev) =>
        prev.map((student) =>
          student._id === studentId
            ? { ...student, dropApproval: "approved" }
            : student
        )
      );
      window.location.reload();
    } catch (error) {
      console.error(
        "Error approving drop request:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (studentId) => {
    const rejectionReason = prompt("Enter rejection reason:");
    if (!rejectionReason) return;

    try {
      setLoading(true);
      await axios.patch(
        `http://localhost:9000/faculty/${branch}/${termId}/edit/facDrop/`,
        {
          studentId,
          isApproved: false,
          rejectionReason,
        }
      );
      setDropStudents((prev) =>
        prev.map((student) =>
          student._id === studentId
            ? { ...student, dropApproval: "rejected" }
            : student
        )
      );
      window.location.reload();
    } catch (error) {
      console.error(
        "Error rejecting drop request:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShowPreview = (studentId) => {
    console.log("Student ID:", studentId);

    axios
      .get(
        `http://localhost:9000/faculty/${branch}/${termId}/edit/facDrop/${studentId}`,
        {
          responseType: "blob", // Ensure binary response for the PDF file
        }
      )
      .then((response) => {
        console.log("PDF response received");
        console.log(response.data);

        const pdfUrl = URL.createObjectURL(response.data); // Create URL from blob
        console.log("Generated PDF URL:", pdfUrl);

        setOverlayState({
          isVisible: true,
          pdfUrl: pdfUrl, // Pass the URL to overlay state
        });
      })
      .catch((error) => {
        console.error(
          "Error fetching PDF:",
          error.response?.data || error.message
        );
        alert("Failed to fetch the drop application file. Please try again.");
      });
  };

  return (
    <div className="add-students-main">
      <Header />
      <div className="fac-topside-table">
        <FacNavbar />
        <div className="faculty-title-bar">
          <div className="faculty-edit-page-title">Drop Students</div>
        </div>
      </div>
      {loading && (
        <div className="loader-spinner">
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        </div>
      )}
      <div className="drop-content">
        <div className="drop-fac-message">
          Please open on a desktop device for better visibility.
        </div>
        <table className="drop-table">
          <thead>
            <tr>
              <th>ROLL NO</th>
              <th>NAME OF STUDENT</th>
              <th>EMAIL</th>
              <th>BRANCH</th>
              <th>DIVISION</th>
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
            handleClose={() =>
              setOverlayState({ isVisible: false, pdfUrl: null })
            }
            pdfUrl={overlayState.pdfUrl}
          />
        )}
      </div>
    </div>
  );
}

export default FacDrop;
