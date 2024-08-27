import React from 'react';
import './alp-right-section.css';
import { Link } from 'react-router-dom';
import viewicon from '../../../photos-logos/view.jpeg';
import editicon from '../../../photos-logos/edit.png';
import deleteicon from '../../../photos-logos/delete.png';

const AlpRightSection = ({ term }) => {
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this term?')) {
      try {
        const response = await fetch(`/admin/${ term._id }`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete term');
        }

        window.location.reload();
        console.log('Term deleted successfully');
        
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
        <tbody>
            <tr>
              <td>{term.termYear}</td>
              <td id="view-box">
                <Link to={`/admin/${term._id}/view`}><button className="view-button">
                  <img src={viewicon} alt="view-logo" /> 
                </button></Link>
                <Link to={`/admin/${term._id}/edit/addCourses`}><button className="edit-button">
                  <img src={editicon} alt="edit-logo" />
                </button></Link>
                <button className="delete-button" onClick={handleDelete}>
                  <img src={deleteicon} alt="delete-logo" />
                </button>
              </td>
            </tr>
        </tbody>
  );
}

export default AlpRightSection;
