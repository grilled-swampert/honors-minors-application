import React, { useState, useEffect } from "react";
import "./facDrop.css";
import Header from "../../header/header";
import FacNavbar from "../facNavbar/facNavbar";
import viewicon from "../../photos-logos/view.jpeg";
import approveIcon from "../../photos-logos/approve.png";
import rejectIcon from "../../photos-logos/reject.jpeg";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import DropStudents from "./dropStudents";
import { FETCH_ALL_COURSES } from "../../../constants/actonsTypes";
const { getDropStudents } = require("../../../actions/terms");

function FacDrop() {
  // State to handle overlay visibility and content
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayContent, setOverlayContent] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const { branch, termId } = useParams();
  const dispatch = useDispatch();
  
  // Fetch students from the Redux state or API
  const dropStudents = useSelector((state) => state.students);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (termId) {
      dispatch(getDropStudents(branch, termId));
      fetchStudents();
      console.log("Branch:", branch, "Term ID:", termId); // Check if branch and termId are valid
    } else {
      console.warn("Term ID is undefined or invalid");
    }
  }, [dispatch, branch, termId]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`/faculty/${branch}/${termId}/facView`);
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  console.log("Drop Students:", dropStudents);

  // Function to open the overlay with content
  const openOverlay = (content, studentId = null) => {
    setOverlayContent(content);
    setOverlayVisible(true);
    setCurrentStudentId(studentId);
  };

  // Function to close the overlay
  const closeOverlay = () => {
    setOverlayVisible(false);
    setOverlayContent("");
    setRejectionReason(""); // Reset the input box when closing the overlay
    setCurrentStudentId(null);
  };

  // Handle the input change for rejection reason
  const handleRejectionReasonChange = (e) => {
    setRejectionReason(e.target.value);
  };

  // Handle course drop request for approval/rejection
  const handleCourseDropRequest = async (isApproved) => {
    try {
        const response = await axios.put(`/faculty/${branch}/${termId}/edit/facDrop`, {
            studentId: currentStudentId,
            isApproved,
            rejectionReason: isApproved ? '' : rejectionReason
        });
        console.log(response.data);

        // Email is now sent from the backend
        alert(isApproved ? 'Course drop request approved and email sent' : 'Course drop request rejected and email sent');
        closeOverlay();
        fetchStudents(); // Refresh the student list
    } catch (error) {
        console.error('Error handling course drop request:', error);
        alert('Failed to process course drop request: ' + (error.response?.data?.error || error.message));
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
                    key={student._id}
                    student={student}
                    openOverlay={openOverlay}
                    branch={branch}
                    termId={termId}
                  />
                ))}
            </tbody>
          </table>

          {/* Overlay */}
          {overlayVisible && (
            <div className="overlay">
              <div className="overlay-content">
                <button className="close-button" onClick={closeOverlay}>
                  X
                </button>

                {overlayContent === "view" && (
                  <p>Viewing details for student ID: {currentStudentId}</p>
                )}
                {overlayContent === "approve" && (
                  <div>
                    <p>
                      Approving the course drop request for student ID:{" "}
                      {currentStudentId}
                    </p>
                    <button onClick={() => handleCourseDropRequest(true)}>
                      Confirm Approval
                    </button>
                  </div>
                )}

                {overlayContent === "reject" && (
                  <div>
                    <p>
                      Rejecting the course drop request for student ID:{" "}
                      {currentStudentId}
                    </p>
                    <textarea
                      value={rejectionReason}
                      onChange={handleRejectionReasonChange}
                      placeholder="Enter reason for rejection"
                      rows={4}
                      style={{ width: "100%", marginBottom: "10px" }}
                    />
                    <button onClick={() => handleCourseDropRequest(false)}>
                      Confirm Rejection
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FacDrop;