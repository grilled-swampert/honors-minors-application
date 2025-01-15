import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const AllocationRow = ({
  course,
  handleInputChange,
  handleDeactivationSelection,
  downloadRowData,
  downloadIcon,
  onStatusChange,
}) => {
  const { termId } = useParams();
  const [temporaryStatus, setTemporaryStatus] = useState(
    course.temporaryStatus
  );
  const { status } = useState(course.status);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";

  // Function to handle both temporary and permanent deactivation
  const handleStatusChange = async (courseId, isChecked) => {
    const newStatus = isChecked ? "inactive" : "active";

    console.log(`Course ID: ${courseId}`);
    console.log(`Status: ${newStatus}`);

    try {
      setLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/admin/${termId}/edit/allocation`,
        {
          courseId,
          temporaryStatus: newStatus,
          status: newStatus, // Update both temporary and permanent statuses
        }
      );

      console.log("Status update response:", response.data);
      setTemporaryStatus(newStatus);
      handleDeactivationSelection(courseId, isChecked);
      window.location.reload();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = status === "inactive" || course.permanent;

  return (
    <>
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
      <tr className={isDisabled ? "row-disabled" : ""}>
        <td>{course.offeringDepartment}</td>
        <td>{course.programName}</td>
        <td>{course.category}</td>
        <td>{course.firstPreference}</td>
        <td>{course.secondPreference}</td>
        <td>{course.thirdPreference}</td>
        <td>{course.fourthPreference}</td>
        <td>{course.firstPreference}</td>
        <td>
          <input
            type="number"
            value={course.maxCount}
            onChange={(e) => handleInputChange(course._id, e)}
            id="maxCount"
            disabled={isDisabled}
          />
        </td>
        <td>
          <input
            type="checkbox"
            checked={
              course.permanent ||
              temporaryStatus === "inactive" ||
              status === "inactive"
            }
            onChange={(e) => handleStatusChange(course._id, e.target.checked)}
            disabled={isDisabled}
          />
        </td>
        <td>{course.finalCount}</td>
        <td>
          <button
            onClick={() => downloadRowData(course._id)}
            disabled={isDisabled}
            className="downBtn"
          >
            <img src={downloadIcon} alt="Download" className="downImg" />
          </button>
        </td>
      </tr>
    </>
  );
};

export default AllocationRow;
