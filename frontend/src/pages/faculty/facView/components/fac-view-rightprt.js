import React, { useState, useEffect } from "react";
import "./fac-view-rightprt.css";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getStudents } from "../../../../actions/terms";
import FacViewLeftprt from "./fac-view-leftprt";
import ViewDashboard from "./fac-student-details";

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
        (student) => student.status?.toLowerCase() === "finished"
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
        const status = student.status?.toLowerCase(); // Normalize status
        console.log("Active tab:", activeTab);
        // eslint-disable-next-line default-case
        switch (activeTab) {
          case "submitted":
            return status === "finished";
          case "not-submitted":
            return status === "not-submitted"; // Ensure this matches the exact status value
        }
      })
    : [];

  const [tabNumbers, setTabNumbers] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    notSubmitted: 0,
  });
  const [dropdownVisible, setDropdownVisible] = useState({
    downloadMenu: false,
    download1Menu: false,
    download2Menu: false,
    download3Menu: false,
  });
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".dropdown-menu") &&
        !event.target.closest(".downloadBtn")
      ) {
        setDropdownVisible({
          downloadMenu: false,
          download1Menu: false,
          download2Menu: false,
          download3Menu: false,
        });
      }
    };
    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleViewButtonClick = (student) => {
    setSelectedStudent(student);
    setOverlayVisible(true);
  };

  const closeOverlay = () => {
    setOverlayVisible(false);
    setSelectedStudent(null);
  };

  const toggleDropdown = (menu) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const downloadTemplate = (template) => {
    console.log("Downloading template:", template);
    setDropdownVisible({
      downloadMenu: false,
      download1Menu: false,
      download2Menu: false,
      download3Menu: false,
    });
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
                key={student.rollNumber}
                student={student}
                handleViewButtonClick={handleViewButtonClick}
              />
            ))}
          </div>

          <div className="download">
            <button
              className="downloadBtn"
              onClick={() => toggleDropdown("downloadMenu")}
            >
              Download <span className="caret">▼</span>
            </button>
            {dropdownVisible.downloadMenu && (
              <ul id="downloadMenu" className="dropdown-menu">
                <li className="dropdown-submenu">
                  <a to="#" onClick={() => toggleDropdown("download1Menu")}>
                    Download 1 <span className="caret">▶</span>
                  </a>
                  {dropdownVisible.download1Menu && (
                    <ul id="download1Menu" className="dropdown-menu nested">
                      <li>
                        <a href="#" onClick={() => downloadTemplate("1.1")}>
                          Download 1.1
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={() => downloadTemplate("1.2")}>
                          Download 1.2
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={() => downloadTemplate("1.3")}>
                          Download 1.3
                        </a>
                      </li>
                    </ul>
                  )}
                </li>
                <li className="dropdown-submenu">
                  <a href="#" onClick={() => toggleDropdown("download2Menu")}>
                    Download 2 <span className="caret">▶</span>
                  </a>
                  {dropdownVisible.download2Menu && (
                    <ul id="download2Menu" className="dropdown-menu nested">
                      <li>
                        <a href="#" onClick={() => downloadTemplate("2.1")}>
                          Download 2.1
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={() => downloadTemplate("2.2")}>
                          Download 2.2
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={() => downloadTemplate("2.3")}>
                          Download 2.3
                        </a>
                      </li>
                    </ul>
                  )}
                </li>
                <li className="dropdown-submenu">
                  <a href="#" onClick={() => toggleDropdown("download3Menu")}>
                    Download 3 <span className="caret">▶</span>
                  </a>
                  {dropdownVisible.download3Menu && (
                    <ul id="download3Menu" className="dropdown-menu nested">
                      <li>
                        <a href="#" onClick={() => downloadTemplate("3.1")}>
                          Download 3.1
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={() => downloadTemplate("3.2")}>
                          Download 3.2
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={() => downloadTemplate("3.3")}>
                          Download 3.3
                        </a>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            )}
          </div>
        </div>

        {overlayVisible && selectedStudent && (
          <div id="student-info-overlay" className="overlay">
            <div className="overlay-content">
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
