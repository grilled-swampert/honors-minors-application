import React from 'react';
import styles from './selectCourseHeader.module.css';

export default function SelectCourseHeader({ searchText, setSearchText }) {
  return (
    <div>
      <h1>Select Somaiya Courses</h1>
      <hr />
      <h3>What course are you looking for?</h3>
      <input
        className={styles.searchInput}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search by course name..."
      />
    </div>
  );
}
