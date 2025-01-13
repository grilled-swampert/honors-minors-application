import React, { useEffect, useState } from 'react';
import './add-right-section.css';
import downloadicon from "../../../photos-logos/download.png";
import editicon from '../../../photos-logos/edit.svg';
import approveicon from "../../../photos-logos/approve.png";
import rejecticon from '../../../photos-logos/reject.jpeg';

const AddRightSection = ({ term, setTerms }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localStartDate, setLocalStartDate] = useState('');
  const [localEndDate, setLocalEndDate] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";

  useEffect(() => {
    if (term) {
      // Convert term.startDate and term.endDate to local time for input fields
      const startDate = new Date(term.startDate);
      const endDate = new Date(term.endDate);
  
      const localStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
  
      const localEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
  
      setLocalStartDate(localStartDate);
      setLocalEndDate(localEndDate);
    }
  }, [term]);  

  const handleConfirm = async (e) => {
    e.preventDefault();
    
    // Check if dates are valid before sending the request
    if (!localStartDate || !localEndDate) {
      console.error("Please provide valid start and end dates.");
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/admin/${term._id}/edit/addCourses`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          termId: term._id,
          startDate: localStartDate,
          endDate: localEndDate,
        }),
      });
  
      if (!response.ok) {
        const data = await response.json();
        console.error('Error:', data.error);
      } else {
        const updatedTerm = await response.json();
        console.log('Term updated successfully:', updatedTerm);
  
        // Update the state to reflect the changes
        setTerms((prevTerms) =>
          prevTerms.map((t) => (t._id === term._id ? updatedTerm : t))
        );
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating term:', error);
    }
  
    setIsEditing(false); // Exit editing mode
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLocalStartDate(new Date(term.startDate).toISOString().slice(0, 16));
    setLocalEndDate(new Date(term.endDate).toISOString().slice(0, 16));
  };

  return (
    <tr key={term._id} className='course-table-rows'>
      <td className="table-start-date">
        {isEditing ? (
          <input
            type="datetime-local"
            id={localStartDate}
            onChange={(e) => setLocalStartDate(e.target.value)}
          />
        ) : (
          formatDateTime(term.startDate)
        )}
      </td>
      <td className="table-end-date">
        {isEditing ? (
          <input
            type="datetime-local"
            id={localEndDate}
            onChange={(e) => setLocalEndDate(e.target.value)}
          />
        ) : (
          formatDateTime(term.endDate)
        )}
      </td>
      <td>
        {term.syllabusFile ? (
          <div
          className="status-uploaded"
        >
          <svg
            fill="#000000"
            height="35px"
            width="35px"
            version="1.1"
            id="Capa_1"
            viewBox="-166.6 -166.6 823.20 823.20"
          >
            <g
              id="SVGRepo_bgCarrier"
              stroke-width="0"
              transform="translate(0,0), scale(1)"
            >
              <rect
                x="-166.6"
                y="-166.6"
                width="823.20"
                height="823.20"
                rx="411.6"
                fill="#9ff9d2"
                strokewidth="0"
              ></rect>
            </g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <polygon points="452.253,28.326 197.831,394.674 29.044,256.875 0,292.469 207.253,461.674 490,54.528 "></polygon>{" "}
            </g>
          </svg>
        </div>
        ) : (
          <div className="status-uploaded">
              <svg
                fill="#000000"
                height="35px"
                width="35px"
                version="1.1"
                id="Capa_1"
                viewBox="-186.2 -186.2 862.40 862.40"
                transform="rotate(0)"
              >
                <g
                  id="SVGRepo_bgCarrier"
                  stroke-width="0"
                  transform="translate(0,0), scale(1)"
                >
                  <rect
                    x="-186.2"
                    y="-186.2"
                    width="862.40"
                    height="862.40"
                    rx="431.2"
                    fill="#bee6f4"
                    strokewidth="0"
                  ></rect>
                </g>
                <g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke="#CCCCCC"
                  stroke-width="0.9800000000000001"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337 "></polygon>{" "}
                </g>
              </svg>
            </div>
        )}
      </td>
      <td className="ad-tick-cross">
        {isEditing ? (
          <>
            <button onClick={handleConfirm}>
              <img src={approveicon} alt="approve" />
            </button>
            <button onClick={handleCancel}>
              <img src={rejecticon} alt="reject" />
            </button>
          </>
        ) : (
          <button onClick={handleEdit}>
            <img src={editicon} alt="edit" />
          </button>
        )}
      </td>
    </tr>
  );
};

export default AddRightSection;