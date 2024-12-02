import React, { useState, useEffect } from "react";
import "./facDrop.css";
import Header from "../../header/header";
import FacNavbar from "../facNavbar/facNavbar";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import DropStudents from "./dropStudents";
const { getDropStudents } = require("../../../actions/terms");

function FacDrop() {
  // State to handle overlay visibility and content
  const [overlayState, setOverlayState] = useState({
    isVisible: false,
    type: null,
    studentId: null,
    studentDetails: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const { branch, termId } = useParams();
  const dispatch = useDispatch();

  // Fetch students from the Redux state
  const dropStudents = useSelector((state) => state.students);
  const [students, setStudents] = useState([]);

  // Fetch data on component mount or termId change
  useEffect(() => {
    console.log("useEffect triggered: termId", termId);
    if (termId) {
      dispatch(getDropStudents(branch, termId));
      fetchStudents();
    } else {
      console.warn("Term ID is undefined or invalid");
    }
  }, [dispatch, branch, termId]);

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      console.log("Fetching students for branch:", branch, "termId:", termId);
      const response = await axios.get(`/faculty/${branch}/${termId}/facView`);
      setStudents(response.data);
      console.log("Students fetched:", response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Function to open the overlay
  const openOverlay = (type, studentId = null) => {
    
    console.log("openOverlay called with type:", type, "studentId:", studentId);
    // Find student details if studentId is provided
    const studentDetails = studentId
      ? dropStudents.find((student) => student._id === studentId)
      : null;

    console.log("Student details found:", studentDetails);

    setOverlayState({
      isVisible: true,
      type,
      studentId,
      studentDetails,
    });
  };

  // Function to close the overlay
  const closeOverlay = () => {
    console.log("Closing overlay");
    setOverlayState({
      isVisible: false,
      type: null,
      studentId: null,
      studentDetails: null,
    });
    setRejectionReason(""); // Reset the rejection reason
  };

  // Handle the input change for rejection reason
  const handleRejectionReasonChange = (e) => {
    console.log("Rejection reason changed:", e.target.value);
    setRejectionReason(e.target.value);
  };

  // Handle course drop request for approval/rejection
  const handleCourseDropRequest = async (isApproved) => {
    console.log(
      "Handling course drop request. Is Approved:",
      isApproved,
      "Student ID:",
      overlayState.studentId,
      "Rejection Reason:",
      rejectionReason
    );
    try {
      const response = await axios.put(
        `/faculty/${branch}/${termId}/edit/facDrop`,
        {
          studentId: overlayState.studentId,
          isApproved,
          rejectionReason: isApproved ? "" : rejectionReason,
        }
      );

      alert(
        isApproved
          ? "Course drop request approved and email sent"
          : "Course drop request rejected and email sent"
      );

      closeOverlay();
      fetchStudents(); // Refresh the student list
    } catch (error) {
      console.error("Error handling course drop request:", error);
      alert(
        "Failed to process course drop request: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  // Render overlay content based on type
  const renderOverlayContent = () => {
    const { type, studentId, studentDetails } = overlayState;
    console.log("Rendering overlay content. Type:", type);

    switch (type) {
      case "view":
        return (
          <div>
            <h2>Student Details</h2>
            {studentDetails && (
              <div>
                <p>
                  <strong>Name:</strong> {studentDetails.name}
                </p>
                <p>
                  <strong>Roll No:</strong> {studentDetails.rollNo}
                </p>
                <p>
                  <strong>Email:</strong> {studentDetails.email}
                </p>
                <p>
                  <strong>Program:</strong> {studentDetails.program}
                </p>
              </div>
            )}
          </div>
        );

      case "approve":
        return (
          <div>
            <p>Are you sure you want to approve the course drop request?</p>
            <button onClick={() => handleCourseDropRequest(true)}>
              Confirm Approval
            </button>
          </div>
        );

      case "reject":
        return (
          <div>
            <p>
              Please provide a reason for rejecting the course drop request:
            </p>
            <textarea
              value={rejectionReason}
              onChange={handleRejectionReasonChange}
              placeholder="Enter reason for rejection"
              rows={4}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <button
              onClick={() => handleCourseDropRequest(false)}
              disabled={!rejectionReason.trim()} // Disable if no reason provided
            >
              Confirm Rejection
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="drop-main">
      <Header />
      <FacNavbar />
      <div className="drop-content">
        <div>
          <table className="drop-table">
            <thead>
              <tr className="drop-tr">
                <th>ROLL NO</th>
                <th>NAME OF STUDENT</th>
                <th>EMAIL</th>
                <th>HONOURS/MINORS</th>
                <th>PROGRAM</th>
                <th>DROP APPROVAL</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {dropStudents &&
                dropStudents.map((student) => (
                  <DropStudents
                    student={student}
                    openOverlay={openOverlay}
                    branch={branch}
                    termId={termId}
                  />
                ))}
            </tbody>
          </table>

          {/* Overlay */}
          {overlayState.isVisible && (
            <div className="overlay">
              <div className="overlay-content">
                <button className="close-button" onClick={closeOverlay}>
                  X
                </button>
                {renderOverlayContent()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FacDrop;
