import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getTerm, getTerms } from "../../../actions/terms";
import "./add-courses.css";
import TemplatePage from "./components/template";
import AddLeftSection from "./components/add-left-section";
import AddRightSection from "./components/add-right-section";
import Header from "../../header/header";
import AdminSideBar from "../admin-sidebar/adminSidebar";

const AddCoursesPage = () => {
  const [terms, setTerms] = useState([]);
  const { termId } = useParams();

  const dispatch = useDispatch();
  const allTerms = useSelector((state) => state.terms);

  useEffect(() => {
    if (termId) {
      dispatch(getTerms());
    }
  }, [dispatch, termId]);

  console.log("Terms from store:", allTerms);

  const termNeeded = allTerms.find((allTerms) => allTerms._id === termId);
  console.log("Term needed:", termNeeded);

  const hasValidDates =
    termNeeded && termNeeded.startDate && termNeeded.endDate;

  return (
    <div className="add-courses-main">
      <Header />
      <div className="topside-table">
        <AdminSideBar />
        <TemplatePage />
      </div>
      <div className="add-right-container">
        {/* <AddLeftSection rows={terms} setTerms={setTerms} /> */}
          <table id="ad-table">
            <thead>
              <tr>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Syllabus</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {termNeeded && hasValidDates ? (
                <AddRightSection
                  key={termNeeded._id}
                  term={termNeeded}
                  setTerms={setTerms}
                />
              ) : (
                <tr>
                  <td colSpan="4">No courses added yet.</td>
                </tr>
              )}
            </tbody>
          </table>
      </div>
    </div>
  );
};

export default AddCoursesPage;
