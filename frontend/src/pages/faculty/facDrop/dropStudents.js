import viewicon from "../../photos-logos/view.jpeg";
import approveIcon from "../../photos-logos/approve.png";
import rejectIcon from "../../photos-logos/reject.jpeg";
import { putDropApplication } from "../../../api/index";
import "./facDrop.css";

export default function DropStudents({ openOverlay, student, branch, termId }) {
  // Handle approve/reject actions
  const handleDropApplication = async (action) => {
    const dropApproval = action === "approved" ? "approved" : "rejected"; // Assume true for approved and false for rejected
    const data = {
      studentId: student._id, // Assuming student object has '_id' field
      dropApproval, // Send the updated dropApproval status
    };

    try {
      await putDropApplication(branch, termId, data); // Pass data object
      alert(`${action} action successfully sent to the backend.`);
    } catch (error) {
      console.error(`Failed to ${action} drop application: `, error);
      alert(`Failed to ${action} drop application.`);
    }
  };

  return (
    <tr>
      <td>{student.rollNumber}</td>
      <td>{student.name}</td>
      <td>{student.email}</td>
      <td>HONOURS</td>
      <td>{student.finalCourse}</td>
      <td>{student.dropApproval}</td>
      <td>
        <button onClick={() => openOverlay("view", student._id)}>
          <img src={viewicon} alt="view" />
        </button>
        <button onClick={() => openOverlay("approve", student._id)}>
          <img src={approveIcon} alt="approve" />
        </button>
        <button onClick={() => openOverlay("reject", student._id)}>
          <img src={rejectIcon} alt="reject" />
        </button>
      </td>
    </tr>
  );
}
