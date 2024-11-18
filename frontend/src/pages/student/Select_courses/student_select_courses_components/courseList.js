import React, { useEffect, useState } from "react";
import styles from "./courseList.module.css";
import CoursesBack from "./CoursesBack";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourses } from "../../../../api/index";

export default function CourseList({ selectedCourses, handleCourseSelection }) {
  const { studentId } = useParams();
  const dispatch = useDispatch();
  const { filteredCourses, loading, error } = useSelector(
    (state) => state.filteredCoursesState
  );
  const [allCourses, setAllCourses] = useState([]);

  useEffect(() => {
    if (studentId) {
      dispatch(fetchCourses(studentId));
    }
  }, [dispatch, studentId]);

  useEffect(() => {
    if (filteredCourses && filteredCourses.length > 0) {
      setAllCourses(filteredCourses);
    }
  }, [filteredCourses]);

  if (loading) return <p>Loading courses...</p>;
  if (error) return <p>Error loading courses: {error}</p>;
  if (!allCourses || allCourses.length === 0) return <p>No courses found</p>;

  return (
    <div className={styles.courseList}>
      <div className={styles.courseHeader}>
        <div className={styles.offeringDept}>Offering Department</div>
        <div className={styles.somaiyaCourseName}>Name of Course</div>
        <div className={styles.courseType}>Honors/Minors</div>
        <div className={styles.syllabus}>Syllabus</div>
        <div className={styles.select}>Select</div>
      </div>
      <div className={styles.courseRowsContainer}>
        {allCourses.map((course) => (
          <CoursesBack
            course={course}
            key={course._id || course.id}
            selectedCourses={selectedCourses}
            handleCourseSelection={handleCourseSelection}
          />
        ))}
      </div>
    </div>
  );
}
