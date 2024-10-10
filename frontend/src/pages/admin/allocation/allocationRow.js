import React from 'react';
import { useParams } from "react-router-dom";
import "./allocation.css";
import axios from "axios";

const AllocationRow = ({
  course,
  handleInputChange,
  downloadRowData,
  downloadIcon,
}) => {
  const { termId } = useParams();

  const handleToggleDeactivation = async (e, id) => {
    const isChecked = e.target.checked; // Get checkbox status (checked or unchecked)
    try {
      const response = await axios.patch(`/admin/${termId}/edit/allocation`, {
        courseId: id,
        status: isChecked ? 'inactive' : 'active', // Toggle based on checkbox state
      });

      if (response.status !== 200) {
        console.error("Error toggling course status:", response.data);
      } else {
        console.log(
          `Course ${isChecked ? 'deactivated' : 'activated'}:`,
          response.data
        );
      }
    } catch (error) {
      console.error("Error toggling course status:", error);
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
          placeholder="Count"
          defaultValue={course.maxCount}
          onChange={(e) => handleInputChange(course._id, e)}
          id="maxCount"
        />
      </td>
      <td>
        <input
          type="checkbox"
          onChange={(e) => handleToggleDeactivation(e, course._id)}
          id="notRun"
        />
      </td>
      <td>{course.finalCount}</td>
      <td>
        <button
          onClick={() => downloadRowData(course)}
          className="download-btn"
        >
          <img src={downloadIcon} alt="Download" className="download-icon" />
        </button>
      </td>
    </tr>
  );
};

export default AllocationRow;
