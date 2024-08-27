import React, { useState } from 'react';
import './admin-view.css';
import deleteicon from '../../photos-logos/delete.png';
import downloadicon from "../../photos-logos/download.png";
import Header from '../../header/header';

const AdminViewPage = () => {
    // Initial table data
    const [rows, setRows] = useState([
      {  startDate: '1 Feb 12:00', endDate: '30 Feb 12:00' },
      {   startDate: '1 Feb 12:00', endDate: '30 Feb 12:00' },
      {   startDate: '1 Feb 12:00', endDate: '30 Feb 12:00' }
    ]);
  
    // Handle row deletion
    const handleDeleteRow = (index) => {
      setRows(rows.filter((_, i) => i !== index));
    };
  
    return (
      <div className="main">
        <Header />
        <div className="content">
          <table>
            <thead>
              <tr>
                <th>Download</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody className='view-tbody'>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <button className='download-btn'>
                     <img  src={downloadicon} alt="download" />
                    </button>
                  </td>
                  <td>{row.startDate}</td>
                  <td>{row.endDate}</td>
                  <td>
                    <button className="delete-button" onClick={() => handleDeleteRow(index)}>
                      <img id="delete-img" src ={deleteicon} alt="delete" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  export default AdminViewPage;
  