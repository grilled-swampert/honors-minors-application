import React, { useState } from 'react';
import './facDrop.css';
// import { Link } from 'react-router-dom';
import Header from '../../header/header';
import FacNavbar from '../facNavbar/facNavbar';
import viewicon from '../../photos-logos/view.jpeg';
import approveIcon from '../../photos-logos/approve.png';
import rejectIcon from '../../photos-logos/reject.jpeg';

function FacDrop() {
    // State to handle overlay visibility and content
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [overlayContent, setOverlayContent] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    // Function to open the overlay with content
    const openOverlay = (content) => {
        setOverlayContent(content);
        setOverlayVisible(true);
    };

    // Function to close the overlay
    const closeOverlay = () => {
        setOverlayVisible(false);
        setOverlayContent('');
        setRejectionReason(''); // Reset the input box when closing the overlay
    };

    // Handle the input change for rejection reason
    const handleRejectionReasonChange = (e) => {
        setRejectionReason(e.target.value);
    };

    // Handle form submission for rejection
    const handleRejectionSubmit = () => {
        console.log('Rejection Reason:', rejectionReason);
        // Add any logic here to handle the rejection, such as an API call
        alert(`Rejected with reason: ${rejectionReason}`);
        closeOverlay();
    };

    return (
        <div className='main'>
            <Header />
            <div className='add-content'>
                <FacNavbar />
                <div className="drop-table">
                    <table className='drop-table'>
                        <thead >
                            <tr className='drop-tr'>
                                <th>ROLL NO</th>
                                <th>NAME OF STUDENT</th>
                                <th>HONOURS/MINORS</th>
                                <th>PROGRAM</th>
                                <th>EDIT</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>16014223018</td>
                                <td>Aryan Shinde</td>
                                <td>HONOURS</td>
                                <td>FCS</td>
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
                        </tbody>
                    </table>

                    {/* Overlay */}
                    {overlayVisible && (
                        <div className="overlay">
                            <div className="overlay-content">
                                <button className="close-button" onClick={closeOverlay}>X</button>
                                
                                {overlayContent === 'view' && <p>Viewing details for Aryan Shinde</p>}
                                {overlayContent === 'approve' && <p>Approving the request for Aryan Shinde</p>}
                                
                                {overlayContent === 'reject' && (
                                    <div>
                                        <p>Rejecting the request for Aryan Shinde</p>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={handleRejectionReasonChange}
                                            placeholder="Enter reason for rejection"
                                            rows={4}
                                            style={{ width: '100%', marginBottom: '10px' }}
                                        />
                                        <button onClick={handleRejectionSubmit}>
                                            Submit Rejection
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FacDrop;
