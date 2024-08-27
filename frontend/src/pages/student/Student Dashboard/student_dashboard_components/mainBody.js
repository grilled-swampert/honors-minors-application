import React from "react";
import styles from './mainBody.module.css';
import CourseRow from "./courseRow";

export default function MainBody({ courses, currentSemester, showDropOverlay, toggleDropOverlay }) {
    return(
        <div>
        <div className={styles.mainBody}>
        <CourseRow 
          title="Honors/Minors Courses" 
          id="HonorsMinors-row"
          deadline="DD-MM-YYYY"
          courseType="Course B"
          availableCourses={[
            (courses.Honors.semesters[currentSemester] || []),
            (courses.Minors.semesters[currentSemester] || [])
          ]}
          currentSemester={currentSemester}
          onDrop={toggleDropOverlay}
        />
      </div>

        {showDropOverlay && (
            <div className={styles.overlay} style={{display: 'flex'}}>
            <div className={`${styles.overlayContent} ${styles.dropOverlay}`}>
                <h2>Drop Application</h2>
                <textarea 
                placeholder="Please provide a reason for dropping the course"
                rows="4"
                ></textarea>
                <div className={styles.fileUpload}>
                <label htmlFor="application-form">Upload Application Form:</label>
                <input type="file" id="application-form" />
                </div>
                <a className={styles.dropApplicationForm} href="https://your-college-website.com/application-form" target="_blank" rel="noopener noreferrer">
                Download Application Form
                </a>
                <div className={styles.overlayButtons}>
                <button className={styles.submitBtn}>Submit</button>
                <button className={styles.cancelBtn} onClick={toggleDropOverlay}>Cancel</button>
                </div>
            </div>
            </div>
        )}
  </div>
    )
    
}