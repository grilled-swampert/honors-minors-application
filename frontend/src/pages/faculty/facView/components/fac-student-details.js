import React from 'react';
import './fac-student-details.css';

export default function ViewDashboard({ handleViewButtonClick, student }) {
    return (
        <div>
            <div className="student-info-grid-item" key={student.id}>
                <h4 className="student-info-heading">Name of Student:</h4>
                <p className="student-info">{student.name}</p>
                <h4 className="student-info-heading">Roll No.:</h4>
                <p className="student-info">{student.rollNumber}</p>
                <h4 className="student-info-heading">Status:</h4>
                <p className="student-info">{student.status}</p>
                <div className="view">
                <button className="viewBtn" onClick={() => handleViewButtonClick(student)}>
                    <i className="fa-regular fa-eye"></i>
                </button>
                </div>
            </div>
        </div>
    );
}

