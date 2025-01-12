import React, { useState, useEffect } from "react";
import "./fac-view-rightprt.css";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getStudents, deleteStudents } from "../../../../actions/terms";
import FacViewLeftprt from "./fac-view-leftprt";
import ViewDashboard from "./fac-student-details";
import { utils, writeFile } from "xlsx"; // Library for Excel export

function FacViewRightprt() {
  const [activeTab, setActiveTab] = useState("total");

  const { branch, termId } = useParams();
  const dispatch = useDispatch();

  const termStudents = useSelector((state) => state.students);

  useEffect(() => {
    if (termId) {
      dispatch(getStudents(branch, termId));
    } else {
      console.warn("Term ID is undefined or invalid");
    }
  }, [dispatch, branch, termId]);

  useEffect(() => {
    if (Array.isArray(termStudents)) {
      const total = termStudents.length;
      const submitted = termStudents.filter(
        (student) => student.status?.toLowerCase() === "submitted"
      ).length;
      const notSubmitted = termStudents.filter(
        (student) => student.status?.toLowerCase() === "not-submitted"
      ).length;

      setTabNumbers({ total, submitted, notSubmitted });
    } else {
      console.warn("termStudents is undefined when calculating tab numbers");
    }
  }, [termStudents]);

  const filteredStudentData = Array.isArray(termStudents)
    ? termStudents.filter((student) => {
        const status = student.status?.toLowerCase();
        switch (activeTab) {
          case "total":
            return true;
          case "submitted":
            return status === "submitted";
          case "not-submitted":
            return status === "not-submitted";
          default:
            return false;
        }
      })
    : [];

  const [tabNumbers, setTabNumbers] = useState({
    total: 0,
    submitted: 0,
    notSubmitted: 0,
  });
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleViewButtonClick = (student) => {
    setSelectedStudent(student);
    setOverlayVisible(true);
  };

  const handleDeleteButtonClick = (studentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (confirmDelete) {
      dispatch(deleteStudents(studentId, branch, termId));
    }
  };

  const closeOverlay = () => {
    setOverlayVisible(false);
    setSelectedStudent(null);
  };

  const downloadExcel = (students, fileName) => {
    const sheetData = students.map((student) => ({
      Name: student.name,
      RollNumber: student.rollNumber,
      Branch: student.branch,
      Division: student.division,
      Email: student.email,
      FinalCourse: student.finalCourse[0],
      Status: student.status,
    }));
    const worksheet = utils.json_to_sheet(sheetData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Students");
    writeFile(workbook, fileName);
  };

  return (
    <div className="App">
      <div className="view-dashboard">
        <FacViewLeftprt
          tabNumbers={tabNumbers}
          activeTab={activeTab}
          handleTabClick={handleTabClick}
        />
        <div className="rightside">
          <div className="student-info-grid-container">
            {filteredStudentData.map((student) => (
              <ViewDashboard
                key={student._id}
                student={student}
                handleDeleteButtonClick={handleDeleteButtonClick}
                handleViewButtonClick={handleViewButtonClick}
              />
            ))}
          </div>

          <div className="download-buttons">
            <button
              className="download-btn"
              onClick={() => downloadExcel(termStudents, "All_Students.xlsx")}
            >
              Download All Students
            </button>
            <button
              className="download-btn"
              onClick={() => {
                const submittedStudents = termStudents.filter(
                  (student) => student.status?.toLowerCase() === "submitted"
                );
                downloadExcel(submittedStudents, "Submitted_Students.xlsx");
              }}
            >
              Download Submitted Students
            </button>
            <button
              className="download-btn"
              onClick={() => {
                const notSubmittedStudents = termStudents.filter(
                  (student) => student.status?.toLowerCase() === "not-submitted"
                );
                downloadExcel(notSubmittedStudents, "Not_Submitted_Students.xlsx");
              }}
            >
              Download Not Submitted Students
            </button>
          </div>
        </div>

        {overlayVisible && selectedStudent && (
          <div
            id="student-info-overlay"
            className="overlay"
            onClick={closeOverlay}
          >
            <div
              className="overlay-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Student Information</h2>
              <strong>Name of the student:</strong>
              <p className="student-overlay-name">{selectedStudent.name}</p>
              <strong>Roll No.:</strong>
              <p>{selectedStudent.rollNumber}</p>
              <strong>Status:</strong>
              <p>{selectedStudent.status}</p>
              <button className="closeBtn" onClick={closeOverlay}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FacViewRightprt;
