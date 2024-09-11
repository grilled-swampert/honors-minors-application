import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./login.css";

function LoginPage() {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");

  const handleStudentChange = (e) => {
    setSelectedStudent(e.target.value);
  };

  const handleFacultyChange = (e) => {
    setSelectedFaculty(e.target.value);
  };

  return (
    <div className="login-page">
      <Link to="/admin">
        <button className="login-button"> Admin </button>
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
            <button className="login-button"> Go to Student Dashboard </button>
          </Link>
        )}
      </div>

      <div className="dropdown-container">
        <select
          className="faculty-dropdown"
          value={selectedFaculty}
          onChange={handleFacultyChange}
        >
          <option value="" disabled>
            Select Faculty
          </option>
          <option value="aids">AIDS</option>
          <option value="it">IT</option>
          <option value="excp">EXCP</option>
          <option value="comp">COMP</option>
          <option value="mech">MECH</option>
        </select>

        {selectedFaculty && (
          <Link to={`/faculty/${selectedFaculty}/dashboard`}>
            <button className="login-button"> Go to Faculty Dashboard </button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
