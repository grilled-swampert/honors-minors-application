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
    const { id, value, checked } = event.target;
    setUpdatedCourses((prev) => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [id]: id === "notRun" ? checked : value,
      },
    }));
  };

  const handleTemporaryStatusChange = async (courseId, isChecked) => {
    try {
      const response = await axios.patch(`/admin/${termId}/edit/allocation`, {
        courseId,
        temporaryStatus: isChecked ? "inactive" : "active",
      });

      if (response.status === 200) {
        console.log(`Course temporary status changed:`, response.data);
        setLocalCourses((prevCourses) =>
          prevCourses.map((course) =>
            course._id === courseId
              ? {
                  ...course,
                  temporaryStatus: isChecked ? "inactive" : "active",
                }
              : course
          )
        );
      } else {
        console.error("Error toggling temporary course status:", response.data);
      }
    } catch (error) {
      console.error("Error toggling temporary course status:", error);
    }
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
      const promises = Object.entries(updatedCourses).map(
        ([courseId, data]) => {
          if (data.maxCount !== undefined || data.notRun !== undefined) {
            return axios.put(`/admin/${termId}/edit/allocation`, {
              courseId,
              maxCount: data.maxCount,
              notRun: data.notRun,
            });
          }
          return Promise.resolve();
        }
      );

      await Promise.all(promises);
      console.log("All changes applied successfully");
      dispatch(getCourses(termId));
      setUpdatedCourses({});
    } catch (error) {
      console.error("Error applying changes:", error);
    }
  };

  const submitDeactivations = async (courseId, isChecked) => {
    console.log("Function called: submitDeactivations");
    console.log("Course ID:", courseId);
    
    // Create an array to hold the courses to deactivate
    const coursesToDeactivate = localCourses
      .filter(course => course.isSelectedForDeactivation)
      .map(course => course._id);
  
    console.log("Initial courses to deactivate:", coursesToDeactivate);
  
    // If the courseId is not in the array and isChecked is true, add it
    if (isChecked && !coursesToDeactivate.includes(courseId)) {
      coursesToDeactivate.push(courseId);
      console.log(`Added courseId ${courseId} for deactivation`);
    }
  
    // If isChecked is false, remove the courseId if it exists
    if (!isChecked) {
      const index = coursesToDeactivate.indexOf(courseId);
      if (index > -1) {
        coursesToDeactivate.splice(index, 1);
        console.log(`Removed courseId ${courseId} from deactivation list`);
      } else {
        console.log(`courseId ${courseId} was not found in the deactivation list`);
      }
    }
  
    // Proceed only if there are courses to deactivate
    if (coursesToDeactivate.length === 0) {
      console.log("No courses selected for deactivation.");
      return;
    }
  
    console.log("Final courses to deactivate:", coursesToDeactivate);
  
    try {
      console.log("Sending request to backend...");
      const response = await axios.put(`/admin/${termId}/edit/allocation`, {
        courseIds: coursesToDeactivate, // Pass the array of course IDs
        status: isChecked ? 'inactive' : 'active', // Use isChecked to determine status
        temporaryStatus: isChecked ? 'inactive' : 'active' // Set temporary status based on isChecked
      });
  
      console.log("Response received from backend:", response);
  
      if (response.status === 200) {
        console.log("Courses deactivated successfully:", response.data);
        dispatch(getCourses(termId));
        setLocalCourses(prevCourses => 
          prevCourses.map(course => ({ ...course, isSelectedForDeactivation: false }))
        );
      } else {
        console.error("Error deactivating courses:", response.data);
      }
    } catch (error) {
      console.error("Error in batch deactivation:", error);
      // Additional error debugging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else {
        console.error("Error message:", error.message);
      }
    }
  };
  
  const downloadRowData = async (courseId) => {
    try {
      const response = await axios.get(
        `/admin/${termId}/course/${courseId}/students`,
        {
          responseType: "blob",
        }
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
              <th>
                1<sup>st</sup> CHOICE
              </th>
              <th>
                2<sup>nd</sup> CHOICE
              </th>
              <th>
                3<sup>rd</sup> CHOICE
              </th>
              <th>
                4<sup>th</sup> CHOICE
              </th>
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
                handleTemporaryStatusChange={(isChecked) =>
                  handleTemporaryStatusChange(course._id, isChecked)
                }
                handleDeactivationSelection={(isSelected) =>
                  handleDeactivationSelection(course._id, isSelected)
                }
                downloadRowData={() => downloadRowData(course._id)}
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
