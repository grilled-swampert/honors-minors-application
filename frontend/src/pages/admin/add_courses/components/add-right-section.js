import React, { useState, useEffect } from "react";
import "./add-right-section.css";
import editicon from "../../../photos-logos/edit.png";
import approveicon from "../../../photos-logos/approve.png";
import rejecticon from "../../../photos-logos/reject.jpeg";

const AddRightSection = ({ term, setTerms }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localStartDate, setLocalStartDate] = useState('');
  const [localEndDate, setLocalEndDate] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (term) {
      setLocalStartDate(new Date(term.startDate).toISOString().slice(0, 16));
      setLocalEndDate(new Date(term.endDate).toISOString().slice(0, 16));
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
      const response = await fetch(`/admin/${term._id}/edit/addCourses`, {
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
    <tr key={term._id}>
      <td className="start-date">
        {isEditing ? (
          <input
            type="datetime-local"
            value={localStartDate}
            onChange={(e) => setLocalStartDate(e.target.value)}
          />
        ) : (
          formatDateTime(term.startDate)
        )}
      </td>
      <td className="end-date">
        {isEditing ? (
          <input
            type="datetime-local"
            value={localEndDate}
            onChange={(e) => setLocalEndDate(e.target.value)}
          />
        ) : (
          formatDateTime(term.endDate)
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
