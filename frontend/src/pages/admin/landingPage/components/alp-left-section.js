import React, { useState } from "react";
import "./alp-left-section.css";

const AlpLeftSection = () => {
  const [termYear, setTermYear] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const term = { termYear };
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";

    const response = await fetch(`${API_BASE_URL}/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(term),
    });

    const data = await response.json();

    if (!data.ok) {
      setError(data.error);
    }

    if (data.ok) {
      setError(null);
      setTermYear("");
    }
    window.location.reload();
  };

  return (
    <div>
      <form className="new_term_form" onSubmit={handleSubmit}>
        <div className="admin_term_formtitle">ADD A NEW TERM</div>
        <div className="academic-year-input">
          <input
            type="text"
            placeholder="Academic Year"
            id="termInput"
            value={termYear}
            onChange={(e) => setTermYear(e.target.value)}
          />
        </div>
        <button id="createButton" type="submit">
          CREATE
        </button>
      </form>

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default AlpLeftSection;
