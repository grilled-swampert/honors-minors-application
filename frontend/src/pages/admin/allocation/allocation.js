import React, { useEffect, useState } from 'react';
import './allocation.css';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { getCourses } from '../../../actions/terms';
import AllocationRow from './allocationRow';
import Header from '../../header/header';
import AdminSideBar from '../admin-sidebar/adminSidebar';
import { useParams } from 'react-router-dom';
import downloadIcon from '../../photos-logos/download.png';

const Allocation = () => {
  const { termId } = useParams();
  const dispatch = useDispatch();
  const allCourses = useSelector((state) => state.terms);
  const [updatedCourses, setUpdatedCourses] = useState({});

  // Fetch the courses when the component is mounted or termId changes
  useEffect(() => {
    dispatch(getCourses(termId));
  }, [dispatch, termId]);

  // Handle input changes for maxCount and notRun
  const handleInputChange = (courseId, event) => {
    const { id, value, checked } = event.target;
    setUpdatedCourses((prev) => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [id]: id === 'notRun' ? checked : value,
      },
    }));
  };

  // Apply changes for all updated courses
  const applyChanges = async () => {
    try {
      const promises = Object.entries(updatedCourses).map(([courseId, data]) => {
        // Send only the changed fields (e.g., maxCount or notRun status)
        if (data.maxCount !== undefined || data.notRun !== undefined) {
          return axios.put(`/admin/${termId}/edit/allocation`, {
            courseId,
            maxCount: data.maxCount,
            notRun: data.notRun,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      console.log('All changes applied successfully');
      // Refresh the courses after applying changes
      dispatch(getCourses(termId));
      setUpdatedCourses({}); // Reset the changes after applying
    } catch (error) {
      console.error('Error applying changes:', error);
    }
  };

  // Download a single course's student list
  const downloadRowData = async (courseId) => {
    try {
      const response = await axios.get(`/admin/${termId}/course/${courseId}/students`, {
        responseType: 'blob', // Important for handling file downloads
      });

      // Create a Blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });

      // Create a link element and trigger the download
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `students_course_${courseId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  // Download all courses' allocation information
  const downloadAllData = async () => {
    try {
      const response = await axios.get(`/admin/${termId}/edit/allocation`, {
        responseType: 'blob',
      });

      // Create a Blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });

      // Create a link element and trigger the download
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `allocation_info_${termId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  return (
    <div className="main">
      <Header />
    <div className = 'al-main'>
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
                downloadRowData={() => downloadRowData(course._id)} // Pass function with courseId
                downloadIcon={downloadIcon}
              />
            ))}
          </tbody>
        </table>
      </div>
      
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
