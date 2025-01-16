import React, { useState } from "react";
import styles from "./courseSection.module.css";

export default function CourseSection() {
  const [showOverlay, setShowOverlay] = useState(false);

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };
  return (
    <div className={styles.coursesSection}>
      {showOverlay && (
        <div
          id="learn-more-overlay"
          className={styles.overlay}
          style={{ display: "flex" }}
        >
          <div className={styles.overlayContent}>
            <h2>Course Information</h2>
            <div className={styles.courseDetails}>
              <h3>Honors and Minors Courses</h3>
              <p>
                Honors and Minors courses available in Semesters V, VI, and VII.
              </p>
              <h4>Sample Courses:</h4>
              <ul>
                <li>Advanced Database Management</li>
                <li>Machine Learning Applications</li>
                <li>Internet of Things</li>
              </ul>
            </div>
            <button id="close-overlay" onClick={toggleOverlay}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
