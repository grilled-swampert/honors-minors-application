import React, { useEffect, useState } from 'react';
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
  const dispatch = useDispatch();
  const allCourses = useSelector((state) => state.terms);
  const [updatedCourses, setUpdatedCourses] = useState({});

  useEffect(() => {
    dispatch(getCourses(termId));
  }, [dispatch, termId]);

  const handleInputChange = (courseId, event) => {
    const { id, value, checked } = event.target;
    setUpdatedCourses(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [id]: id === 'notRun' ? checked : value
      }
    }));
  };

  const applyChanges = async () => {
    try {
      const promises = Object.entries(updatedCourses).map(([courseId, data]) => {
        if (data.maxCount !== undefined) {
          return axios.put(`/admin/${termId}/edit/allocation`, { courseId, maxCount: data.maxCount });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      console.log('All changes applied successfully');
      // Refresh the courses after applying changes
      dispatch(getCourses(termId));
    } catch (error) {
      console.error('Error applying changes:', error);
    }
  };

  const downloadRowData = (rowData) => {
    const worksheet = XLSX.utils.json_to_sheet([rowData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Course Data");
    XLSX.writeFile(workbook, `${rowData.offeringDepartment}_${rowData.programName}_data.xlsx`);
  };

  const downloadAllData = () => {
    const worksheet = XLSX.utils.json_to_sheet(allCourses);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Courses");
    XLSX.writeFile(workbook, "allocation_data.xlsx");
  };

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