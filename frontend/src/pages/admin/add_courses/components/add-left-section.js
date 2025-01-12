import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./add-left-section.css";
import filelogo from "../../../photos-logos/file-logo.svg";

const AddLeftSection = () => {
  const { termId } = useParams();
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    const formData = new FormData();
    formData.append("syllabusFile", syllabusFile);
    formData.append("startDate", startDateTime.toISOString());
    formData.append("endDate", endDateTime.toISOString());

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setError(null);
          setSuccess("File uploaded successfully!");
          setUploadProgress(0);
          setSyllabusFile(null);
          setStartDate("");
          setStartTime("");
          setEndDate("");
          setEndTime("");
        } else {
          setError("File upload failed. Please try again.");
          setSuccess(null);
        }
      };

      xhr.onerror = () => {
        setError("An error occurred during file upload.");
        setSuccess(null);
      };

      xhr.open("PATCH", `${API_BASE_URL}/admin/${termId}/edit/addCourses`);
      xhr.send(formData);
    } catch (err) {
      setError("Failed to submit the form");
      setUploadProgress(0);
      console.error("Error during form submission:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".csv")) {
      const fileName = document.getElementById("file-name");
      const fileSize = document.getElementById("file-size");

      fileName.textContent = file.name;
      fileSize.textContent = `Size: ${(file.size / 1024).toFixed(2)} KB`;
      setSyllabusFile(file);
      setError(null);
      setSuccess(null);
    } else {
      setSyllabusFile(null);
      setError("Please upload a valid .csv file.");
      setSuccess(null);
    }
  };

  return (
    <div className="left-section">
      <div className="date-selection">
        <form onSubmit={handleSubmit} className="termForm">
          <div className="form-group">
            <div className="startDate">
              <label className="start-date">Start Date:</label>
              <div>
                <input
                  type="date"
                  id="start-date"
                  className="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="time"
                  id="start-time"
                  className="date"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>

            <div className="endDate">
              <label className="end-date">End Date:</label>
              <div>
                <input
                  type="date"
                  id="end-date"
                  className="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <input
                  type="time"
                  id="end-time"
                  className="date"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="add-upload-sec">
            <div id="upload-btn">
              <label className="syllabus-label">Syllabus File:</label>
              <div className="upload-file-data">
                <label for="file-upload" class="upload-label">
                  <img src={filelogo} alt="File" class="upload-icon" />
                  <span class="upload-text">Choose File</span>
                </label>

                <input
                  id="file-upload"
                  type="file"
                  name="UPLOAD"
                  accept=".csv"
                  onChange={handleFileChange}
                />
                <div id="file-info">
                  <span id="file-name">No file chosen</span>
                  <span id="file-size"></span>
                </div>
              </div>
            </div>

            <button id="add-btn" type="submit" disabled={!syllabusFile}>
              ADD
            </button>
          </div>

          {uploadProgress > 0 && (
            <div className="progress-bar">
              <div className="progress" style={{ width: `${uploadProgress}%` }}>
                {uploadProgress}%
              </div>
            </div>
          )}

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default AddLeftSection;
