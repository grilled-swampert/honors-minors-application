
import "./allocation.css";

const AllocationRow = ({ course, handleInputChange, downloadRowData, downloadIcon  }) => {
  return (
    <tbody>
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
            value={course.maxCount}
            onChange={(e) => handleInputChange(course._id, e)}
            id="maxCount"
          />
        </td>
        <td>
          <input
            type="checkbox"
            checked={course.notRun}
            onChange={(e) => handleInputChange(course._id, e)}
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
    </tbody>
  );
};

export default AllocationRow;