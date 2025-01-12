import React, { useState } from "react";
import styles from "./SelectCourses.module.css";
import Header from "../../header/header";
import SelectCourseHeader from "./student_select_courses_components/selectCourseHeader";
import CourseList from "./student_select_courses_components/courseList";
import CourseAdded from "./student_select_courses_components/courseAdded";
import CourseAddedHeading from "./student_select_courses_components/courseAddedHeading";

function SelectCourses() {
  const [searchText, setSearchText] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);

  const handleCourseSelection = (event, course) => {
    const checkbox = event.target;
    const courseId = course._id || course.id;

    if (checkbox.checked) {
      if (selectedCourses.length < 6) {
        console.log(selectedCourses);
        setSelectedCourses((prevCourses) => {
          if (!prevCourses.some((c) => c.id === courseId)) {
            return [...prevCourses, { ...course, id: courseId }];
          }
          console.log(prevCourses);
          return prevCourses;
        });
      } else {
        checkbox.checked = false;
        alert("You can only select up to 6 courses.");
      }
    } else {
      setSelectedCourses((prevCourses) =>
        prevCourses.filter((c) => c.id !== courseId)
      );
    }
  };

  const handleRemoveCourse = (courseId) => {
    setSelectedCourses((prevCourses) =>
      prevCourses.filter((course) => course.id !== courseId)
    );
    // Uncheck the corresponding checkbox in the CourseList
    const checkbox = document.querySelector(
      `input[type="checkbox"][data-course-id="${courseId}"]`
    );
    if (checkbox) {
      checkbox.checked = false;
    }
  };

  return (
    <div>
      <Header />
      <div className={styles.heroSection}>
        <div className={styles.coursesSelectorList}>
          <SelectCourseHeader 
            searchText={searchText}  
            setSearchText={setSearchText}
          />
          <CourseList
            selectedCourses={selectedCourses}
            handleCourseSelection={handleCourseSelection}
            searchText={searchText} 
          />
        </div>
        <div className={styles.coursesAdded}>
          <CourseAddedHeading />
          <CourseAdded
            selectedCourses={selectedCourses}
            handleRemoveCourse={handleRemoveCourse}
            setSelectedCourses={setSelectedCourses}
          />
        </div>
      </div>
    </div>
  );  
}

export default SelectCourses;
