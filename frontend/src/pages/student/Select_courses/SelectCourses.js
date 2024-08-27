import React, { useEffect, useState } from 'react';
import styles from './SelectCourses.module.css';
import Sortable from 'sortablejs';
import { Link } from 'react-router-dom';
import Header from '../../header/header';
import SelectCourseHeader from './student_select_courses_components/selectCourseHeader';
import CourseList from './student_select_courses_components/courseList';
import CourseAdded from './student_select_courses_components/courseAdded';
import CourseAddedHeading from './student_select_courses_components/courseAddedHeading';

function SelectCourses() {
  const [selectedCourses, setSelectedCourses] = useState([]);

  const handleCourseSelection = (event, course) => {
    const checkbox = event.target;
    if (checkbox.checked) {
      if (selectedCourses.length < 4) {
        setSelectedCourses(prevCourses => [...prevCourses, course]);
      } else {
        checkbox.checked = false;
        alert('You can only select up to 4 courses.');
      }
    } else {
      setSelectedCourses(prevCourses => prevCourses.filter(c => c.id !== course.id));
    }
  };

  const handleRemoveCourse = (courseId) => {
    setSelectedCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
  };

  return (
    <div>
      <Header />
      <div className={styles.heroSection}>
        <div className={styles.coursesSelectorList}>
          <SelectCourseHeader />
          <CourseList 
          selectedCourses={selectedCourses} 
          handleCourseSelection={handleCourseSelection} 
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