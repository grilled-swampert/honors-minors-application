import React, { useEffect, useState } from "react";
import "./facAddStudent.css";
import Header from "../../header/header";
import FacTemplate from "./components/fac-template";
import FacAddTop from "./components/fac-add-top";
import FacAddBottom from "./components/fac-add-bottom";
import FacNavbar from "../facNavbar/facNavbar";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTerms } from "../../../actions/terms";
import axios from "axios";

function FacAddStudent() {
  const { branch, termId } = useParams();
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [emailStatus, setEmailStatus] = useState("");

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";

  const dispatch = useDispatch();
  const terms = useSelector((state) => state.terms);

  useEffect(() => {
    if (termId) {
      dispatch(getTerms());
    }
  }, [dispatch, termId]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadStatus("Uploading and processing file...");
      const response = await axios.post(
        `${API_BASE_URL}/faculty/${branch}/${termId}/addStudents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUploadStatus("Students added successfully!");
      setEmailStatus("Emails sent successfully!");

      // Refresh the student list or term data here
      dispatch(getTerms());
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("Error uploading file. Please try again.");
      setEmailStatus("Error sending emails. Please check the server logs.");
    }
  };

  const termNeeded = terms.find((term) => term._id === termId);

  return (
    <div className="add-students-main">
      <Header />
      <div className="fac-topside-table">
        <FacNavbar />
        <FacTemplate />
      </div>
      <div>
        <div className="add-students-container">
          <FacAddTop />
          <div className="fac-add-bottom">
            {uploadStatus && <p>{uploadStatus}</p>}
            {emailStatus && <p>{emailStatus}</p>}
            {termNeeded ? (
              <FacAddBottom term={termNeeded} key={termNeeded._id} />
            ) : (
              <p>No students added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacAddStudent;
