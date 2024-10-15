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
  const [temporaryStatus, setTemporaryStatus] = useState(course.temporaryStatus);
  const { status } = useState(course.status);

  // Function to handle both temporary and permanent deactivation
  const handleStatusChange = async (courseId, isChecked) => {
    const newStatus = isChecked ? "inactive" : "active";

    console.log(`Course ID: ${courseId}`);
    console.log(`Status: ${newStatus}`);

    try {
      const response = await axios.put(`/admin/${termId}/edit/allocation`, {
        courseId,
        temporaryStatus: newStatus,
        status: newStatus, // Update both temporary and permanent statuses
      });

      console.log("Status update response:", response.data);
      setTemporaryStatus(newStatus);
      handleDeactivationSelection(courseId, isChecked); // Trigger selection for deactivation
      window.location.reload(); // Force window reload
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const isDisabled = status === "inactive";

  return (
    <tr className={isDisabled ? "row-disabled" : ""}>
      <td>{course.offeringDepartment}</td>
      <td>{course.programName}</td>
      <td>{course.category}</td>
      <td>{course.firstPreference}</td>
      <td>{course.secondPreference}</td>
      <td>{course.thirdPreference}</td>
      <td>{course.fourthPreference}</td>
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
          checked={temporaryStatus === "inactive" || status === "inactive"}
          onChange={(e) => handleStatusChange(course._id, e.target.checked)}
          disabled={isDisabled}
        />
      </td>
      <td>{course.finalCount}</td>
      <td>
        <button onClick={() => downloadRowData(course._id)} disabled={isDisabled}>
          <img src={downloadIcon} alt="Download" />
        </button>
      </td>
    </tr>
  );
};

export default AllocationRow;