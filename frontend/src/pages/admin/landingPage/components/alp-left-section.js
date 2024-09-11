import React, { useState } from 'react';
import './alp-left-section.css';

const AlpLeftSection = () => {
  const [termYear, setTermYear] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
      e.preventDefault();

      const term = { termYear };

      const response = await fetch('/admin', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(term)
      });

      console.log('Response:', response);

      const data = await response.json();

      console.log('Data:', data);

      if (!data.ok) {
          setError(data.error);
      }

      if (data.ok) {
          setError(null);
          setTermYear('');
          console.log('Term created', data);
      }
      window.location.reload();
  };

  return (
    <div>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Academic Year" 
            id="termInput" 
            value={termYear} 
            onChange={(e) => setTermYear(e.target.value)} 
          />
          <button id="createButton">CREATE</button>
        </form>
      
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default AlpLeftSection;
