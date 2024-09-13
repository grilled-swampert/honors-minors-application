import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "./courseAdded.module.css";
import Sortable from "sortablejs";

export default function CourseAdded({
  selectedCourses,
  handleRemoveCourse,
  setSelectedCourses,
}) {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      console.log("Submitting courses");
      const response = await fetch(`/student/${studentId}/courses`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courses: selectedCourses.map((course) => course._id),
        }),
      });
      console.log("Response");

      if (!response.ok) {
        throw new Error("Failed to update courses");
      }
      console.log("Response is ok");

      const result = await response.json();
      console.log("Courses updated successfully:", result);
      alert("Courses submitted successfully!");
      navigate(`/student/${studentId}/dashboard`);
    } catch (error) {
      console.error("Error updating courses:", error);
      alert("Failed to submit courses.");
    }
  };

  useEffect(() => {
    const container = document.querySelector(`.${styles.coursesAddedContent}`);
    if (container) {
      Sortable.create(container, {
        animation: 150,
        handle: `.${styles.dragHandle}`,
        onEnd: (evt) => {
          const newOrder = Array.from(container.children).map(
            (el) => el.dataset.courseId
          );
          setSelectedCourses((prevCourses) => {
            const courseMap = new Map(
              prevCourses.map((course) => [course.id, course])
            );
            return newOrder.map((id) => courseMap.get(id)).filter(Boolean);
          });
        },
      });
    }
  }, [setSelectedCourses]);

  useEffect(() => {
    console.log("Selected Courses:", selectedCourses);
  }, [selectedCourses]);

  return (
    <div>
      <div className={styles.coursesAddedTable}>
        <div className={styles.coursesAddedContent}>
          {selectedCourses.map((course, index) => (
            <div
              className={styles.coursesAddedRow}
              data-course-id={course.id}
              key={`${course.id}-${index}`}
            >
              <span className={styles.dragHandle}>☰</span>
              <span className={styles.courseRank}>{index + 1}</span>
              <span className={styles.somaiyaCourseName}>
                {course.programName}
              </span>
              <span className={styles.courseType}>{course.category}</span>
              <button
                className={styles.removeCourse}
                onClick={() => handleRemoveCourse(course.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.buttons}>
        <Link to={`/student/${studentId}/courses`}>
          <button className={styles.submitBtn} onClick={handleSubmit}>
            Submit
          </button>
        </Link>
      </div>
    </div>
  );
}
