import React, { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./courseAdded.module.css";
import Sortable from "sortablejs";

export default function CourseAdded({
  selectedCourses,
  handleRemoveCourse,
  setSelectedCourses,
}) {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      Sortable.create(containerRef.current, {
        animation: 150,
        handle: `.${styles.dragHandle}`,
        onEnd: (evt) => {
          const newOrder = Array.from(containerRef.current.children).map(
            (el) => el.dataset.courseId
          );
          setSelectedCourses((prevCourses) => {
            const courseMap = new Map(
              prevCourses.map((course) => [course.id || course._id, course])
            );
            return newOrder.map((id) => courseMap.get(id)).filter(Boolean);
          });
        },
      });
    }
  }, [setSelectedCourses]);

  const handleSubmit = async () => {
    if (selectedCourses.length !== 6) {
      alert("Please select exactly 6 courses before submitting.");
      return;
    }

    try {
      const response = await fetch(`/student/${studentId}/courses`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courses: selectedCourses.map((course) => course._id || course.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update courses");
      }

      const result = await response.json();
      console.log("Courses updated successfully:", result);
      alert("Courses submitted successfully!");
      navigate(`/student/${studentId}/dashboard`);
    } catch (error) {
      console.error("Error updating courses:", error);
      alert("Failed to submit courses.");
    }
  };

  return (
    <div>
      <div className={styles.coursesAddedTable}>
        <div className={styles.coursesAddedContent} ref={containerRef}>
          {selectedCourses.map((course, index) => (
            <div
              className={styles.coursesAddedRow}
              data-course-id={course.id || course._id}
              key={`${course.id || course._id}-${index}`}
            >
              <span className={styles.dragHandle}>☰</span>
              <span className={styles.courseRank}>{index + 1}</span>
              <span className={styles.somaiyaCourseName}>
                {course.programName}
              </span>
              <span className={styles.courseType}>{course.category}</span>
              <button
                className={styles.removeCourse}
                onClick={() => handleRemoveCourse(course.id || course._id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.buttons}>
        <button className={styles.submitBtn} onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}