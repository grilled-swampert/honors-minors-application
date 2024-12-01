import React, { useState } from 'react';
import './fac-add-top.css';
import { useParams } from 'react-router-dom';

function FacAddTop() {
  const { branch, termId } = useParams();
  const [studentsList, setStudentsList] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentsList) {
      setError('Please upload a file');
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
        
        // Force refresh the page to get updated data
        window.location.reload();
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

    xhr.open('PATCH', `/faculty/${branch}/${termId}/edit/facAddStudent`, true);
    xhr.send(formData);
    setIsUploading(true);
  };

  const handleFileUpload = (event) => {
    setStudentsList(event.target.files[0]);
    console.log('File selected:', event.target.files[0]);
  };

  return (
    <div className='upload-container'>
      <form onSubmit={handleSubmit} >
        <label className='file-input-label'>
          Upload CSV File:
          <input type="file" onChange={handleFileUpload} />
        </label>

        <button type="submit" disabled={isUploading} className='submit-button'>
          {isUploading ? 'Uploading...' : 'Submit'}
        </button>

        {isUploading && (
          <div className="progress-bar">
            <div className="progress" style={{ width: `${uploadProgress}%` }}>
              {uploadProgress}%
            </div>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default FacAddTop;
