import React, { useState }  from 'react';
import './fac-add-top.css';
import { useParams } from 'react-router-dom';

function FacAddTop(){
    const { branch, termId } = useParams();
    const [studentsList, setStudentsList] = useState(null);
    const [error, setError] = useState(null);
    
    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!studentsList) {
        setError('Please upload a file');
        return;
      }

      const formData = new FormData();
      formData.append('studentsList', studentsList);

      try {
        const response = await fetch(`/faculty/${branch}/${termId}/edit/facAddStudent`, {
          method: 'PATCH',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Something went wrong!');
        } else {
          setError(null);
          setStudentsList(null);
          console.log('Semester created', data);
        }
      } catch (err) {
        setError('Failed to submit the form');
      }
    };

    const handleFileUpload = (event) => {
      setStudentsList(event.target.files[0]);
      console.log('File selected:', event.target.files[0]);
    };

    return(
        <div className="fac-add-top">
          <form onSubmit={handleSubmit} id='course-submit'>
            <div className="add-top">
              <div id="add-upload-btn">
                <input type="file" name="UPLOAD" accept=".csv" onChange={handleFileUpload} />
              </div>
              <button id="submit">SUBMIT</button>
              {error && <div className="error">{error}</div>}
            </div>
          </form>
        </div>
    );
}
export default FacAddTop;