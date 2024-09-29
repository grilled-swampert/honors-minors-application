import viewicon from '../../photos-logos/view.jpeg';
import approveIcon from '../../photos-logos/approve.png';
import rejectIcon from '../../photos-logos/reject.jpeg';
import './facDrop.css';

export default function DropStudents({ openOverlay, student }) {
    return (
        <tr>
            <td>{student.rollNumber}</td>
            <td>{student.name}</td>
            <td>HONOURS</td>
            <td>{student.finalCourse}</td>
            <td>
                <button onClick={() => openOverlay('view')}>
                    <img src={viewicon} alt="view-logo" />
                </button>
                <button onClick={() => openOverlay('approve')}>
                    <img src={approveIcon} alt="approve-logo" />
                </button>
                <button onClick={() => openOverlay('reject')}>
                    <img src={rejectIcon} alt="reject-logo" />
                </button>
            </td>
        </tr>
    );
}

