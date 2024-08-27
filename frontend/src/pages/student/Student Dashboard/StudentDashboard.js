import React, { useState, useEffect } from 'react';
import styles from './StudentDashboard.module.css';
import { Link } from "react-router-dom";
import Header from '../../header/header';
import CourseSection from './student_dashboard_components/courseSection';
import ScrollText from './student_dashboard_components/scrollText';
import MainBody from './student_dashboard_components/mainBody';

function StudentDashboard() {
  const courses = {
    Honors: {
      name: "Honors Courses",
      semesters: {
        V: ["Course A", "Course B"],
        VI: ["Course C", "Course D"],
        VII: ["Course E", "Course F"]
      },
      type: "Honors"
    },
    Minors: {
      name: "Minors Courses",
      semesters: {
        V: ["Course G", "Course H"],
        VI: ["Course I", "Course J"]
      },
      type: "Minors"
    }
  };

  const [showOverlay, setShowOverlay] = useState(false);
  const [showDropOverlay, setShowDropOverlay] = useState(false);
  const [currentSemester, setCurrentSemester] = useState('V');


  const toggleDropOverlay = () => {
    setShowDropOverlay(!showDropOverlay);
  };

  const handleSemesterClick = (semester) => {
    setCurrentSemester(semester);
  };

  useEffect(() => {
    // This effect will run whenever currentSemester changes
    // You can add logic here to update course information based on the selected semester
  }, [currentSemester]);

  return (
    <div>
      <Header />
      <CourseSection />
      <hr />
      <ScrollText />
      <MainBody 
      courses={courses}
      currentSemester={currentSemester}
      showDropOverlay={showDropOverlay}
      toggleDropOverlay={toggleDropOverlay}
      />
    </div>
  );
}


export default StudentDashboard;