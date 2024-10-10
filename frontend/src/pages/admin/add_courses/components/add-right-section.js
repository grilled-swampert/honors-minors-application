import React from 'react';
import './add-right-section.css';
import downloadicon from "../../../photos-logos/download.png";
import editicon from '../../../photos-logos/edit.png';
import approveicon from "../../../photos-logos/approve.png";
import rejecticon from '../../../photos-logos/reject.jpeg';

const AddRightSection = ({ term, setTerms }) => {
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
      <td className="table-start-date">
        {term.isEditing ? (
          <input
            type="datetime-local"
            id={`start-date-${term._id}`}
            defaultValue={term.startDate.replace(' ', 'T')}
          />
        ) : (
          term.startDate
        )}
      </td>
      <td className="table-end-date">
        {term.isEditing ? (
          <input
            type="datetime-local"
            id={`end-date-${term._id}`}
            defaultValue={term.endDate.replace(' ', 'T')}
          />
        ) : (
          term.endDate
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