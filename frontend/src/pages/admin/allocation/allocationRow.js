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

  const handleDeactivation = async (id) => {
    try {
      const response = await axios.patch(`/admin/${termId}/edit/allocation`, {
        courseId: id,
      });

      if (response.status !== 200) {
        console.error("Error deactivating course:", response.data);
      } else {
        console.log("Course deactivated:", response.data);
      }
    } catch (error) {
      console.error("Error deactivating course:", error);
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
          onChange={(e) => handleDeactivation(course._id)}
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