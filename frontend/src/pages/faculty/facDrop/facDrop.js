import React, { useEffect, useState } from "react";
import "./facDrop.css";
// import { Link } from 'react-router-dom';
import Header from "../../header/header";
import FacNavbar from "../facNavbar/facNavbar";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DropStudents from "./dropStudents";
const { getDropStudents } = require("../../../actions/terms");

function FacDrop() {
  // State to handle overlay visibility and content
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayContent, setOverlayContent] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const { branch, termId } = useParams();
  const dispatch = useDispatch();

  const dropStudents = useSelector((state) => state.students);

  useEffect(() => {
    if (termId) {
      dispatch(getDropStudents(branch, termId));
      console.log("Branch:", branch, "Term ID:", termId); // Check if branch and termId are valid
    } else {
      console.warn("Term ID is undefined or invalid");
    }
  }, [dispatch, branch, termId]);
  console.log("Drop Students:", dropStudents);

  // Function to open the overlay with content
  const openOverlay = (content) => {
    setOverlayContent(content);
    setOverlayVisible(true);
  };

  // Function to close the overlay
  const closeOverlay = () => {
    setOverlayVisible(false);
    setOverlayContent("");
    setRejectionReason(""); // Reset the input box when closing the overlay
  };

  // Handle the input change for rejection reason
  const handleRejectionReasonChange = (e) => {
    setRejectionReason(e.target.value);
  };

  // Handle form submission for rejection
  const handleRejectionSubmit = () => {
    console.log("Rejection Reason:", rejectionReason);
    // Add any logic here to handle the rejection, such as an API call
    alert(`Rejected with reason: ${rejectionReason}`);
    closeOverlay();
  };

  return (
    <div className="main">
      <Header />
      <div className="add-content">
        <FacNavbar />
        <div className="drop-table">
          <table className="drop-table">
            <thead>
              <tr className="drop-tr">
                <th>ROLL NO</th>
                <th>NAME OF STUDENT</th>
                <th>HONOURS/MINORS</th>
                <th>PROGRAM</th>
                <th>EDIT</th>
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
          {overlayVisible && (
            <div className="overlay">
              <div className="overlay-content">
                <button className="close-button" onClick={closeOverlay}>
                  X
                </button>

                {overlayContent === "view" && (
                  <p>Viewing details for Aryan Shinde</p>
                )}
                {overlayContent === "approve" && (
                  <p>Approving the request for Aryan Shinde</p>
                )}

                {overlayContent === "reject" && (
                  <div>
                    <p>Rejecting the request for Aryan Shinde</p>
                    <textarea
                      value={rejectionReason}
                      onChange={handleRejectionReasonChange}
                      placeholder="Enter reason for rejection"
                      rows={4}
                      style={{ width: "100%", marginBottom: "10px" }}
                    />
                    <button onClick={handleRejectionSubmit}>
                      Submit Rejection
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
