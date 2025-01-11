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
  const { branch, termId } = useParams();
  const dispatch = useDispatch();

  // Fetch students from the Redux state
  const dropStudents = useSelector((state) => state.students);

  // Fetch data on component mount or termId change
  useEffect(() => {
    if (termId) {
      dispatch(getDropStudents(branch, termId));
    } else {
      console.warn("Term ID is undefined or invalid");
    }
  }, [dispatch, branch, termId]);

  // Function to handle showing the PDF preview (this is now passed to DropStudents)
  const handleShowPreview = (studentId) => {
    fetch(`/api/getDropApplicationPdf/${studentId}`)
      .then(response => response.blob())
      .then(blob => {
        const pdfUrl = URL.createObjectURL(blob);
        // Now the PDF preview will be handled by DropStudents
        alert('PDF is fetched: ' + pdfUrl);  // Just for testing
      })
      .catch(error => console.error('Error fetching PDF:', error));
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
                <th>DROP APPLICATION</th>
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
                    branch={branch}
                    termId={termId}
                    handleShowPreview={handleShowPreview} // Pass function to show preview
                  />
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FacDrop;
