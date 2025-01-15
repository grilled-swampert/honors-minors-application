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
import { setMaxCount } from "../../../actions/terms";

const Allocation = () => {
  const { termId } = useParams();
  const dispatch = useDispatch();
  const allCourses = useSelector((state) => state.terms);
  const [updatedCourses, setUpdatedCourses] = useState({});
  const [localCourses, setLocalCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";

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
      setLoading(true);
      console.log("Updated Courses:", updatedCourses);
      const promises = Object.entries(updatedCourses).map(
        ([courseId, data]) => {
          console.log(
            "Dispatching action for Course ID:",
            courseId,
            "Payload:",
            data
          );
          if (data.maxCount !== undefined) {
            return dispatch(setMaxCount(termId, courseId, data.maxCount));
          }
          return Promise.resolve();
        }
      );

      await Promise.all(promises);
      console.log("All changes applied successfully");
      dispatch(getCourses(termId));
      setUpdatedCourses({});
      window.location.reload();
    } catch (error) {
      console.error("Error applying changes:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitDeactivations = async () => {
    try {
      setLoading(true);
      const deactivationPromises = localCourses
        .filter((course) => course.temporaryStatus !== "active")
        .map((course) =>
          axios.patch(
            `${API_BASE_URL}/admin/${termId}/edit/allocation/deactivate`,
            {
              courseId: course._id,
              status: "inactive",
              temporaryStatus: "inactive",
            }
          )
        );

      console.log("Deactivation promises for courses:", deactivationPromises);

      await Promise.all(deactivationPromises);
      console.log("All deactivations submitted successfully");

      // Refresh the data after successful deactivations
      dispatch(getCourses(termId));
    } catch (error) {
      console.error("Error submitting deactivations:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadRowData = async (courseId) => {
    try {
      setLoading(true);
      console.log("Downloading data for course:", courseId);
      const response = await axios.get(
        `${API_BASE_URL}/admin/${termId}/courses/${courseId}/students`,
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
    } finally {
      setLoading(false);
    }
  };

  const downloadAllData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/${termId}/allocation-info`,
        {
          responseType: "blob",
        }
      );

      // Create a Blob from the response data
      const blob = new Blob([response.data], { type: "text/csv" });

      // Create a link element and trigger the download
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `allocation_info_${termId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main">
      <Header />
      <div className="topside-table">
        <AdminSideBar />
        <div className="admin-title-bar">
          <div className="adminedit-page-title">Allocation</div>
        </div>
      </div>
      <div className="allocation-container">
        <div className="allocation-message">
          Please open on a desktop device for better visibility.
        </div>
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
                <th>
                  5<sup>th</sup> CHOICE
                </th>
                <th>MAX COUNT</th>
                <th>TEMPORARY STATUS</th>
                <th>FINAL COUNT</th>
                <th>DOWNLOAD</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <div className="loader-spinner">
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                </div>
              )}
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
      </div>

      <div className="action-buttons-container">
        <button className="apply-btn" onClick={applyChanges}>
          APPLY MAX COUNT
        </button>
        <button className="submit-btn" onClick={submitDeactivations}>
          LOCK DEACTIVATIONS
        </button>
        <button className="download-all-btn" onClick={downloadAllData}>
          DOWNLOAD ALLOCATION INFORMATION
        </button>
      </div>
    </div>
  );
};

export default Allocation;
