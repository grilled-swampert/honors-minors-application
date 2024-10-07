import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const AllocationRow = ({
  course,
  handleInputChange,
  handleDeactivationSelection,
  downloadRowData,
  downloadIcon,
}) => {
  const { termId } = useParams();
  const [temporaryStatus, setTemporaryStatus] = useState(
    course.temporaryStatus
  );

  // Function to handle temporary status checkbox changes
  const handleTemporaryStatusChange = async (courseId, isChecked) => {
    const newStatus = isChecked ? "inactive" : "active";

    console.log(`Course ID: ${courseId}`);
    console.log(`Temporary Status: ${newStatus}`);

    try {
      const response = await axios.put(`/admin/${termId}/edit/allocation`, {
        courseId,
        temporaryStatus: newStatus,
      });

      console.log("Status update response:", response.data);
      setTemporaryStatus(newStatus);
    } catch (error) {
      console.error("Error updating temporary status:", error);
    }
  };

  return (
    <tr>
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
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={temporaryStatus === "inactive"}
          onChange={(e) =>
            handleTemporaryStatusChange(course._id, e.target.checked)
          }
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={course.isSelectedForDeactivation}
          onChange={(e) =>
            handleDeactivationSelection(course._id, e.target.checked)
          }
        />
      </td>
      <td>{course.finalCount}</td>
      <td>
        <button onClick={() => downloadRowData(course._id)}>
          <img src={downloadIcon} alt="Download" />
        </button>
      </td>
    </tr>
  );
};

export default AllocationRow;
