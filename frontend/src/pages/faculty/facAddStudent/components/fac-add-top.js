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

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        setError(null);
        setStudentsList(null);
        setUploadProgress(0);
        setIsUploading(false);
        console.log('Semester updated successfully', JSON.parse(xhr.response));

        window.location.reload();

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const response = JSON.parse(xhr.response);
        setError(response.error || 'Something went wrong!');
        setIsUploading(false);
      }
    };

    xhr.onerror = () => {
      setError('Failed to submit the form');
      setIsUploading(false);
    };

    xhr.open('PATCH', `${API_BASE_URL}/faculty/${branch}/${termId}/edit/facAddStudent`, true);
    xhr.send(formData);
    setIsUploading(true);
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

        {isUploading && (
          <div className="fac-progress-bar">
            <div className="fac-progress" style={{ width: `${uploadProgress}%` }}>
              {uploadProgress}%
            </div>
          </div>
        )}

        {error && <p className="fac-error-message">{error}</p>}
      </form>
    </div>
  );
}

export default FacAddTop;
