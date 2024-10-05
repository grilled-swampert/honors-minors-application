import React from "react";
import styles from './courseList.module.css';
import { Link } from 'react-router-dom';

export default function CoursesBack({ course, selectedCourses, handleCourseSelection }) {
  const isSelected = selectedCourses.some(c => (c.id === (course._id || course.id)) || (c._id === (course._id || course.id)));

  return (
    <div className={styles.courseRow} data-course-id={course._id || course.id}>
      <div className={styles.offeringDept}>{course.offeringDepartment}</div>
      <div className={styles.somaiyaCourseName}>{course.programName}</div>
      <div className={styles.courseType}>{course.category}</div>
      <div className={styles.syllabus}>
        <Link to="#" className={styles.syllabusLink}>
          View
        </Link>
      </div>
      <div className={styles.select}>
        <input
          type="checkbox"
          className={styles.courseSelect}
          onChange={(e) => handleCourseSelection(e, course)}
          checked={isSelected}
          data-course-id={course._id || course.id}
        />
      </div>
    </div>
  );
}