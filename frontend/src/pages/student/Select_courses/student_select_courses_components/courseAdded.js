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
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update courses");
      }

      const result = await response.json();
      console.log("Courses updated successfully:", result);
      alert("Courses submitted successfully! A confirmation email has been sent to your registered email address.");
      navigate(`/student/${studentId}/dashboard`);
    } catch (error) {
      console.error("Error updating courses:", error);
      alert(`Failed to submit courses: ${error.message}`);
    }
  };

  return (
    <div className={styles.coursesAddedContainer}>
      <div className={styles.coursesAddedTable} ref={containerRef}>
        {selectedCourses.map((course, index) => (
          <div
            className={styles.coursesAddedRow}
            data-course-id={course.id || course._id}
            key={`${course.id || course._id}-${index}`}
          >
            <span className={styles.dragHandle}>☰</span>
            <span className={styles.preference}>Preference {index + 1}</span>
            <span className={styles.courseCode}>{course.programCode}</span>
            <span className={styles.courseName}>{course.programName}</span>
            <button
              className={styles.removeBtn}
              onClick={() => handleRemoveCourse(course.id || course._id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className={styles.buttons}>
        <button 
          className={styles.submitBtn} 
          onClick={handleSubmit}
          disabled={selectedCourses.length !== 6}
        >
          Submit
        </button>
      </div>
    </div>
  );
}