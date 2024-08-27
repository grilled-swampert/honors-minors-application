import React from "react";
import styles from './courseList.module.css';
import { Link } from 'react-router-dom';

export default function CoursesBack({ course, handleCourseSelection}) {
  return (
    <div>
        <div className={styles.courseRow} data-course-id={course.id} key={course.id}>
        <div className={styles.offeringDept}>{course.offeringDepartment}</div>
        <div className={styles.somaiyaCourseName}>{course.programName}</div>
        <div className={styles.courseType}>{course.category}</div>
        <div className={styles.syllabus}>
            <Link to="#" className={styles.syllabusLink}>
                View
            </Link>
        </div>
        <div className={styles.select}>
            <input type="checkbox" className={styles.courseSelect} onChange={(e) => handleCourseSelection(e, course)} />
        </div>
        </div>
    </div>
  );
}