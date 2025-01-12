import React, { useState } from "react";
import styles from "./mainBody.module.css";
import CourseRow from "./courseRow";
import { useParams } from "react-router-dom";

export default function MainBody({
  courses,
  currentSemester,
  showDropOverlay,
  toggleDropOverlay,
}) {
  const { studentId } = useParams();
  const [dropReason, setDropReason] = useState("");
  const [dropFile, setDropFile] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";

  const handleDropApplication = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("dropReason", dropReason);
    formData.append("dropFile", dropFile);

    try {
      const response = await fetch(`${API_BASE_URL}/student/${studentId}/dashboard`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("Error dropping course:", data.error);
      } else {
        console.log("Course dropped successfully!");
        setDropReason("");
        setDropFile(null);
        toggleDropOverlay();
      }
    } catch (err) {
      console.error("Error dropping course:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".pdf")) {
      setDropFile(file);
    } else {
      setDropFile(null);
      console.error("Please upload a valid .pdf file.");
    }
  };

  return (
    <div>
      <div className={styles.mainBody}>
        <CourseRow
          title="Honors/Minors Courses"
          id="HonorsMinors-row"
          deadline="DD-MM-YYYY"
          courseType="Course B"
          availableCourses={[
            courses.Honors.semesters[currentSemester] || [],
            courses.Minors.semesters[currentSemester] || [],
          ]}
          currentSemester={currentSemester}
          onDrop={toggleDropOverlay}
        />
      </div>

      {showDropOverlay && (
        <div className={styles.overlay} style={{ display: "flex" }}>
          <div className={`${styles.overlayContent} ${styles.dropOverlay}`}>
            <h2>Drop Application</h2>
            <input
              type="text"
              placeholder="Please provide a reason for dropping the course"
              style={{ width: "100%" }}
              value={dropReason}
              onChange={(e) => setDropReason(e.target.value)}
            />
            <div className={styles.fileUpload}>
              <label htmlFor="application-form">Upload Application Form:</label>
              <input
                type="file"
                id="application-form"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </div>
            <a
              className={styles.dropApplicationForm}
              href="https://your-college-website.com/application-form"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Application Form
            </a>
            <div className={styles.overlayButtons}>
              <button
                className={styles.submitBtn}
                onClick={handleDropApplication}
              >
                Submit
              </button>
              <button className={styles.cancelBtn} onClick={toggleDropOverlay}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
