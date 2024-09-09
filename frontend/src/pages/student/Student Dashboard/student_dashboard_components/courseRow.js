import styles from './courseRow.module.css';
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getTermDetails, getStudentDetails } from '../../../../actions/terms';
import { useDispatch, useSelector } from 'react-redux';

export default function CourseRow({ title, id, deadline, courseType, availableCourses, currentSemester, onDrop }) {
    const { studentId } = useParams();
    console.log("Student ID:", studentId);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            console.log('File selected:', file.name);
        }
    };

    const dispatch = useDispatch();

    // Adding a fallback for useSelector
    const terms = useSelector((state) => state.terms || {});

    console.log("Terms Data:", terms);

    useEffect(() => {
        dispatch(getTermDetails(studentId));
    }, [dispatch, studentId]);

    const student = useSelector((state) => state.student || {});
    console.log("Student Data:", student);

    useEffect(() => {
        dispatch(getStudentDetails(studentId));
    }, [dispatch, studentId]);

    return (
        <div className={`${styles.coursesRow} ${isCollapsed ? styles.collapsed : ''}`} id={id}>
            <div className={styles.rowHeading}>
                <h3 className={styles.courseHeading}>{title}</h3>
                <div className={`${styles.iconContainer} ${styles.iconSpacing}`}>
                    <div className={styles.deadlineWrapper}>
                        <strong id="deadline-text">{terms.endDate}</strong><br />
                        <span>Deadline</span>
                    </div>
                    <div className={`${styles.iconWrapper} ${styles.courseSelection}`}>
                        <span>Course Selection</span>
                        <i className="fas fa-clock" id="course-selection-icon"></i>
                        <span id="course-selection-status">Pending</span>
                    </div>
                </div>
                <button className={styles.tabCollapse} onClick={toggleCollapse}>
                    <i className={`fa-solid fa-angle-${isCollapsed ? 'down' : 'up'}`}></i>
                </button>
            </div>
            <div className={styles.collapsibleContent} style={{ display: isCollapsed ? 'none' : 'flex' }}>
                <hr />
                <div className={styles.collapsibleContentInfo}>
                    <div className={styles.courseInfo}>
                        <strong className={styles.courseType}>FINAL ALLOTMENT: </strong>
                        <p className={styles.selectedCourseType}>{courseType}</p>
                        <br />
                        <strong className={styles.courseChosen}>COURSE CHOICES: </strong>
                        <ul className={styles.selectedCourseName}>
                            <add here></add>
                        </ul>
                    </div>
                </div>
                <div className={styles.completeApplication}>
                    <Link to={`/student/${studentId}/courses`}>
                        <button className={styles.completeApplicationBtn}>COMPLETE APPLICATION</button>
                    </Link>
                    <button className={styles.dropApplicationBtn} onClick={onDrop}>DROP</button>
                </div>
            </div>
        </div>
    );
}
