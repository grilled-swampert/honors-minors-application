import React, { useEffect, useState } from "react";
import "./allocation.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getCourses } from "../../../actions/terms";
import AllocationRow from "./allocationRow";
import Header from "../../header/header";
import AdminSideBar from "../admin-sidebar/adminSidebar";
import { useParams } from "react-router-dom";
import downloadIcon from "../../photos-logos/download.png";

const Allocation = () => {
  const { termId } = useParams();
  const dispatch = useDispatch();
  const allCourses = useSelector((state) => state.terms);
  const [updatedCourses, setUpdatedCourses] = useState({});
  const [localCourses, setLocalCourses] = useState([]);

  useEffect(() => {
    dispatch(getCourses(termId));
  }, [dispatch, termId]);

  useEffect(() => {
    setLocalCourses(allCourses);
  }, [allCourses]);

  const handleInputChange = (courseId, event) => {
    const { id, value } = event.target;
    setUpdatedCourses((prev) => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [id]: value,
      },
    }));
  };
  
  const handleDeactivationSelection = (courseId, isSelected) => {
    setLocalCourses((prevCourses) =>
      prevCourses.map((course) =>
        course._id === courseId
          ? { ...course, isSelectedForDeactivation: isSelected }
          : course
      )
    );
  };  

  const applyChanges = async () => {
    try {
      const promises = Object.entries(updatedCourses).map(([courseId, data]) => {
        if (data.maxCount !== undefined) {
          return axios.patch(`/admin/${termId}/edit/allocation`, {
            courseId,
            maxCount: data.maxCount,
          });
        }
        return Promise.resolve();
      });
  
      await Promise.all(promises);
      console.log("All changes applied successfully");
      dispatch(getCourses(termId));
      setUpdatedCourses({});
    } catch (error) {
      console.error("Error applying changes:", error);
    }
  };
  
  const submitDeactivations = async () => {
    try {
      const deactivationPromises = localCourses
        .filter(course => course.isSelectedForDeactivation)
        .map(course => 
          axios.put(`/admin/${termId}/edit/allocation`, {
            courseId: course._id,
            status: 'inactive'
          })
        );

      console.log(deactivationPromises);

      await Promise.all(deactivationPromises);
      console.log("All deactivations submitted successfully");
    } catch (error) {
      console.error("Error submitting deactivations:", error);
    }
  };

  const downloadRowData = async (courseId) => {
    try {
      const response = await axios.get(
        `/admin/${termId}/edit/allocation`,
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `students_course_${courseId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading CSV:", error);
    }
  };
  
  const downloadAllData = async () => {
    try {
      const response = await axios.get(`/admin/${termId}/edit/allocation`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `allocation_info_${termId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading CSV:", error);
    }
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
              <th>TEMPORARY STATUS</th>
              <th>SELECT FOR DEACTIVATION</th>
              <th>FINAL COUNT</th>
              <th>DOWNLOAD</th>
            </tr>
          </thead>
          <tbody>
            {localCourses.map((course) => (
              <AllocationRow
                key={course._id}
                course={course}
                handleInputChange={handleInputChange}
                handleDeactivationSelection={handleDeactivationSelection}
                downloadRowData={downloadRowData}
                downloadIcon={downloadIcon}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="action-buttons-container">
        <button className="apply-btn" onClick={applyChanges}>
          APPLY
        </button>
        <button className="submit-btn" onClick={submitDeactivations}>
          SUBMIT DEACTIVATIONS
        </button>
        <button className="download-all-btn" onClick={downloadAllData}>
          DOWNLOAD ALLOCATION INFORMATION
        </button>
      </div>
    </div>
  );
};

export default Allocation;