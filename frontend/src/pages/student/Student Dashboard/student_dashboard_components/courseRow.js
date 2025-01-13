import styles from "./courseRow.module.css";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getTermDetails } from "../../../../actions/terms";
import { useDispatch, useSelector } from "react-redux";

export default function CourseRow({
  title,
  id,
  deadline,
  courseType,
  availableCourses,
  currentSemester,
  onDrop,
}) {
  const { studentId } = useParams();
  console.log("Student ID:", studentId);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log("File selected:", file.name);
    }
  };

  const dispatch = useDispatch();

  // Adding a fallback for useSelector
  const { term, student, finalCourse, courses } = useSelector(
    (state) => state.terms || {}
  );

  console.log("Term Data:", term);
  console.log("Student Data:", student);

  useEffect(() => {
    // Dispatch the action to fetch both term and student details
    dispatch(getTermDetails(studentId));
  }, [dispatch, studentId]);

  const isApplicationDisabled = () => {
    const currentTime = Date.now();

    // Safely check if term and endDate exist
    if (term && term.endDate) {
      const deadlineTime = new Date(term.endDate).getTime();
      const isPastDeadline = currentTime > deadlineTime;

      // Safely check if student exists and has a status
      const isSubmitted = student && student.status === "submitted";

      return isPastDeadline || isSubmitted;
    }

    // If term or endDate is undefined, disable by default
    return true;
  };

  return (
    <div
      className={`${styles.coursesRow} ${isCollapsed ? styles.collapsed : ""}`}
      id={id}
    >
      <div className={styles.rowHeading}>
        <h1 className={styles.courseHeading}>{title}</h1>
        <div className={`${styles.iconContainer} ${styles.iconSpacing}`}>
          <div className={styles.deadlineWrapper}>
            <span>Deadline</span>
            <strong id="deadline-text">
              {term && term.endDate
                ? formatDateTime(term.endDate)
                : "No deadline"}
            </strong>
            <br />
          </div>
          <div className={`${styles.iconWrapper} ${styles.courseSelection}`}>
            <span>Course Selection</span>
            {/* <i className="fas fa-clock" id="course-selection-icon"></i> */}
            <strong id="course-selection-status">
              {student && student.status ? student.status : "No status"}
            </strong>
          </div>
        </div>
      </div>
      <div
        className={styles.collapsibleContent}
        style={{ display: isCollapsed ? "none" : "flex" }}
      >
        <hr />
        <div className={styles.collapsibleContentInfo}>
          <div className={styles.courseInfo}>
            <strong className={styles.courseType}>FINAL ALLOTMENT: </strong>
            <p className={styles.selectedCourseType}>
              {student &&
              student.finalCourse &&
              finalCourse &&
              finalCourse.programName
                ? finalCourse.programName
                : "No final course"}
            </p>
            <br />
            <strong className={styles.courseChosen}>COURSE CHOICES: </strong>
            <ul className={styles.selectedCourseName}>
              {student && student.courses && student.courses.length > 0 ? (
                student.courses.map((courseId) => {
                  const course = courses.find((course) =>
                    course._id === courseId
                  );
                  return (
                    <li key={courseId}>
                      {course ? course.programName : "Course not found"}
                    </li>
                  );
                })
              ) : (
                <li>No courses chosen</li>
              )}
            </ul>
          </div>
        </div>
        <div className={styles.completeApplication}>
          <Link to={`/student/${studentId}/courses`}>
            <button
              className={`${styles.completeApplicationBtn} ${
                isApplicationDisabled() ? styles.disabledButton : ""
              }`}
              disabled={isApplicationDisabled()}
            >
              COMPLETE APPLICATION
            </button>
          </Link>
          <button className={styles.dropApplicationBtn} onClick={onDrop}>
            DROP
          </button>
        </div>
      </div>
    </div>
  );
}
