import React, { useState, useRef } from 'react';
import './fac-add-top.css';
import { useParams } from 'react-router-dom';

function FacAddTop() {
  const { branch, termId } = useParams();
  const [studentsList, setStudentsList] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:9000';

  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentsList) {
      setError('Please upload a file');
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }

    const formData = new FormData();
    formData.append('studentsList', studentsList);

    try {
      setIsUploading(true);
      const response = await fetch(`${API_BASE_URL}/faculty/${branch}/${termId}/edit/facAddStudent`, {
        method: 'PATCH',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Term updated successfully', result);
        setError(null);
        setStudentsList(null);
        setUploadProgress(0);
        window.location.reload();

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Something went wrong!');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit the form');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setStudentsList(file);
      console.log('File selected:', file);
    }
  };

  return (
    <div className='faculty-student-bar'>
      <form className='upload-container' onSubmit={handleSubmit}>
        <label className='file-input-label'>
          Upload Student CSV File:
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload} 
            accept=".csv"
            style={{ 
              opacity: 1, 
              position: 'relative', 
              cursor: 'pointer' 
            }}
          />
        </label>

        <button type="submit" disabled={isUploading} className='submit-button'>
          {isUploading ? 'Uploading...' : 'Submit'}
        </button>

        {error && <p className="fac-error-message">{error}</p>}
      </form>
    </div>
  );
}

export default FacAddTop;
