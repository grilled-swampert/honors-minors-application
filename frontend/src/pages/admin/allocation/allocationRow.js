import React from 'react';

const AllocationRow = ({
  course,
  handleInputChange,
  handleTemporaryStatusChange,
  handleDeactivationSelection,
  downloadRowData,
  downloadIcon,
  isSelectedForDeactivation
}) => {
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
          checked={course.temporaryStatus === 'inactive'}
          onChange={(e) => handleTemporaryStatusChange(e.target.checked)}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={isSelectedForDeactivation}
          onChange={(e) => handleDeactivationSelection(e.target.checked)}
        />
      </td>
      <td>{course.finalCount}</td>
      <td>
        <button onClick={downloadRowData} className="download-btn">
          <img src={downloadIcon} alt="Download" className="download-icon" />
        </button>
      </td>
    </tr>
  );
};

export default AllocationRow;