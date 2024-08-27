import React from "react";
import styles from './courseAddedHeading.module.css';

export default function CourseAddedHeading() {
    return(
        <div className={styles.coursesAddedHeading}>
            <h1>Courses Added</h1>
            <h4>Select up to 4 courses</h4>
          </div>
    )
}