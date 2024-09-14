import React, { useEffect } from 'react';
import './allocation.css';
import * as XLSX from 'xlsx';
import Header from '../../header/header';
import AdminSideBar from '../admin-sidebar/adminSidebar';
import downloadIcon from '../../photos-logos/download.png';
import { useDispatch, useSelector } from 'react-redux';
import { getCourses } from '../../../actions/terms';
import AllocationRow from './allocationRow';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Allocation = () => {
  const { termId } = useParams();

  const handleInputChange = (courseId, event) => {
    const { id, value, checked } = event.target;
    // Update the course in your state or dispatch an action to update in Redux
    console.log(`Updating course ${courseId}:`, { [id]: id === 'notRun' ? checked : value });
  };

  const applyChanges = () => {
    // Implement the logic to apply changes
    console.log('Applying changes');
  };

  const downloadRowData = async (courseId) => {
    try {
      const response = await axios.get(`/admin/${termId}/course/${courseId}/students`, {
        responseType: 'blob', // Important for handling file downloads
      });
  
      // Create a Blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });
  
      // Create a link element, set the download attribute, and click it
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `students_course_${courseId}.csv`;
      link.click();
  
      // Remove the link from the document
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const downloadAllData = () => {
    const worksheet = XLSX.utils.json_to_sheet(allCourses);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Courses");
    XLSX.writeFile(workbook, "allocation_data.xlsx");
  };

  console.log("Termid: ", termId);

  const dispatch = useDispatch();
  const allCourses = useSelector((state) => state.terms);
  console.log(allCourses);

  useEffect(() => {
    console.log("Inside useEffect with termId:", termId);

    // Log before dispatching the action
    console.log("Dispatching getCourses...");

    // Dispatch action to fetch courses
    dispatch(getCourses(termId));

    // Log after dispatching action to see if `allCourses` is updated right after
    console.log("After dispatch: ", allCourses);

  }, [dispatch, termId, allCourses]);

  // Log the state outside the useEffect to see when it updates
  console.log("allCourses after render: ", allCourses);

  return (
    <div className="main">
      <Header />
      <AdminSideBar />
      <div className="ad-content">
        <table id="myTable">
          <thead>
            <tr>
              <th>OFFERING DEPARTMENT</th>
              <th>PROGRAM NAME</th>
              <th>CATEGORY</th>
              <th>1<sup>st</sup> CHOICE</th>
              <th>2<sup>nd</sup> CHOICE</th>
              <th>3<sup>rd</sup> CHOICE</th>
              <th>4<sup>th</sup> CHOICE</th>
              <th>MAX COUNT</th>
              <th>NOT RUN</th>
              <th>FINAL COUNT</th>
              <th>DOWNLOAD</th>
            </tr>
          </thead>
          <tbody>
            {allCourses && allCourses.map((course) => (
              <AllocationRow
                key={course._id}
                course={course}
                handleInputChange={handleInputChange}
                downloadRowData={downloadRowData}
                downloadIcon={downloadIcon}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="action-buttons-container">
        <button className="apply-btn" onClick={applyChanges}>APPLY</button>
        <button className="submit-btn">SUBMIT</button>
        <button className="download-all-btn" onClick={downloadAllData}>DOWNLOAD ALLOCATION INFORMATION</button>
      </div>
    </div>
  );
};

export default Allocation;