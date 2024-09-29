import React, { useState } from "react";
import styles from './mainBody.module.css';
import CourseRow from "./courseRow";
import { applyForDrop } from "../../../../actions/terms"; // Import the action for drop application
import { useDispatch } from "react-redux";

export default function MainBody({ courses, currentSemester }) {
    const [showDropOverlay, setShowDropOverlay] = useState(false);
    const [dropReason, setDropReason] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const dispatch = useDispatch();

    const toggleDropOverlay = () => {
        setShowDropOverlay(!showDropOverlay);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleDropSubmit = () => {
        if (!dropReason) {
            alert("Please provide a reason for dropping the course.");
            return;
        }

        const formData = new FormData();
        formData.append('dropReason', dropReason);

        if (selectedFile) {
            formData.append('file', selectedFile);
        }

        // Dispatch the drop action (assuming studentId is available)
        const studentId = "someStudentId"; // Replace with actual studentId when available
        dispatch(applyForDrop(studentId, formData));

        // Close the overlay after submission
        toggleDropOverlay();
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
                        (courses.Honors.semesters[currentSemester] || []),
                        (courses.Minors.semesters[currentSemester] || [])
                    ]}
                    currentSemester={currentSemester}
                    onDrop={toggleDropOverlay} // Trigger drop overlay
                />
            </div>

            {showDropOverlay && (
                <div className={styles.overlay} style={{ display: 'flex' }}>
                    <div className={`${styles.overlayContent} ${styles.dropOverlay}`}>
                        <h2>Drop Application</h2>
                        <textarea
                            placeholder="Please provide a reason for dropping the course"
                            rows="4"
                            value={dropReason}
                            onChange={(e) => setDropReason(e.target.value)}
                        ></textarea>
                        <div className={styles.fileUpload}>
                            <label htmlFor="application-form">Upload Application Form:</label>
                            <input type="file" id="application-form" onChange={handleFileChange} />
                        </div>
                        <a className={styles.dropApplicationForm} href="https://your-college-website.com/application-form" target="_blank" rel="noopener noreferrer">
                            Download Application Form
                        </a>
                        <div className={styles.overlayButtons}>
                            <button className={styles.submitBtn} onClick={handleDropSubmit}>Submit</button>
                            <button className={styles.cancelBtn} onClick={toggleDropOverlay}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
