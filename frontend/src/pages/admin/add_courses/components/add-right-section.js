import React from 'react';
import './add-right-section.css';
import downloadicon from "../../../photos-logos/download.png";
import editicon from '../../../photos-logos/edit.png';
import approveicon from "../../../photos-logos/approve.png";
import rejecticon from '../../../photos-logos/reject.jpeg';

const AddRightSection = ({ term, setTerms }) => {
  // Function to format the date and time for human-readable display
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleEdit = (id) => {
    setTerms((prevTerms) =>
      prevTerms.map((item) =>
        item._id === id ? { ...item, isEditing: true } : item
      )
    );
  };

  const handleConfirm = (id) => {
    const startDate = document.getElementById(`start-date-${id}`).value.replace('T', ' ');
    const endDate = document.getElementById(`end-date-${id}`).value.replace('T', ' ');

    setTerms((prevTerms) =>
      prevTerms.map((item) =>
        item._id === id
          ? { ...item, startDate, endDate, isEditing: false }
          : item
      )
    );
  };

  const handleCancel = (id) => {
    setTerms((prevTerms) =>
      prevTerms.map((item) =>
        item._id === id ? { ...item, isEditing: false } : item
      )
    );
  };

  return (
    <tr key={term._id}>
      <td>
        <button className="download-btn">
          <img src={downloadicon} alt="download" />
        </button>
      </td>
      <td className="start-date">
        {term.isEditing ? (
          <input
            type="datetime-local"
            id={`start-date-${term._id}`}
            defaultValue={term.startDate.replace(' ', 'T').slice(0, 16)} // Keep datetime-local format
          />
        ) : (
          formatDateTime(term.startDate) // Format for human readability
        )}
      </td>
      <td className="end-date">
        {term.isEditing ? (
          <input
            type="datetime-local"
            id={`end-date-${term._id}`}
            defaultValue={term.endDate.replace(' ', 'T').slice(0, 16)} // Keep datetime-local format
          />
        ) : (
          formatDateTime(term.endDate) // Format for human readability
        )}
      </td>
      <td className="ad-tick-cross">
        {term.isEditing ? (
          <>
            <button onClick={() => handleConfirm(term._id)}>
              <img src={approveicon} alt="approve" />
            </button>
            <button onClick={() => handleCancel(term._id)}>
              <img src={rejecticon} alt="reject" />
            </button>
          </>
        ) : (
          <button onClick={() => handleEdit(term._id)}>
            <img src={editicon} alt="edit" />
          </button>
        )}
      </td>
    </tr>
  );
};

export default AddRightSection;
