import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LoginPage.css"; 

function LoginPage() {
  const [selectedStudent, setSelectedStudent] = useState("");

  const handleStudentChange = (e) => {
    setSelectedStudent(e.target.value);
  };

  return (
    <div className="login-page">
      <Link to="/admin">
        <button className="login-button"> Admin </button>
      </Link>
      <Link to="/faculty/branch">
        <button className="login-button"> Faculty </button>
      </Link>

      <div className="dropdown-container">
        <select
          className="student-dropdown"
          value={selectedStudent}
          onChange={handleStudentChange}
        >
          <option value="" disabled>
            Select Student
          </option>
          <option value="66d65afee38b183fd00f7c11">AIDS</option>
          <option value="66d65afee38b183fd00f7c1f">EXCP</option>
          <option value="66d65afee38b183fd00f7c23">MECH</option>
          <option value="66d65afee38b183fd00f7c15">IT</option>
          <option value="66d65afee38b183fd00f7c0f">COMP</option>
        </select>

        {selectedStudent && (
          <Link to={`/student/${selectedStudent}/dashboard`}>
            <button className="login-button"> Go to Dashboard </button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
