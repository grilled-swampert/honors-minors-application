import React, { useState } from 'react';
import './add-left-section.css'; 
import { useParams } from 'react-router-dom';

const AddLeftSection = () => {
  const { termId } = useParams();
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    const formData = new FormData();
    formData.append('syllabusFile', syllabusFile);
    formData.append('startDate', startDateTime.toISOString());  // Save as ISO string
    formData.append('endDate', endDateTime.toISOString());


    try {
      const response = await fetch(`/admin/${termId}/edit/addCourses`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Something went wrong!');
        setSuccess(null);
      } else {
        setError(null);
        setSuccess('Semester details updated successfully!');
        setSyllabusFile(null);
        setStartDate('');
        setStartTime('');
        setEndDate('');
        setEndTime('');
        window.location.reload();
      }
    } catch (err) {
      setError('Failed to submit the form');
      console.error('Error during form submission:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setSyllabusFile(file);
      setError(null);
    } else {
      setSyllabusFile(null);
      setError('Please upload a valid .csv file.');
    }
  };

  return (
    <div className="left-section">
      <div className="date-selection">
        <form onSubmit={handleSubmit} className='termForm'>
          <div className="form-group">
          <div className="startDate">
            <label className="start-date">Start Date:</label>
            <input
              type="date"
              id="start-date"
              className="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="time"
              id="start-time"
              className="date"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div className="endDate">
            <label className="end-date">End Date &nbsp; :</label>
            <input
              type="date"
              id="end-date"
              className="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <input
              type="time"
              id="end-time"
              className="date"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          </div>
        <div className = 'add-upload-sec'>
          <div id="upload-btn">
            <input
              type="file"
              name="UPLOAD"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>

          <button id="add-btn" type="submit">
            ADD
          </button>
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default AddLeftSection;