import React, { useEffect, useState } from "react";
import "./template.css";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTerms } from "../../../../actions/terms";
import AddLeftSection from "./add-left-section";

const TemplatePage = () => {
  const { termId } = useParams();
  const dispatch = useDispatch();
  const termDetail = useSelector((state) => state.terms);

  const [terms, setTerms] = useState([]);

  const [showFormPopup, setShowFormPopup] = useState(false);
  const toggleFormPopup = () => setShowFormPopup(!showFormPopup);

  useEffect(() => {
    if (termId) {
      dispatch(getTerms());
    }
  }, [dispatch, termId]);
  return (
    <div className="admin-title-bar">
      <div className="adminedit-page-title">
        {termDetail ? `${termDetail[0].termYear}` : "Loading..."}
      </div>
      <div>
        <button
          className="admin-template-download"
          onClick={() =>
            window.open(
              "https://docs.google.com/spreadsheets/d/1zs6OSq_LOxy2I_X1LZiTje1aTze-c-pXs7j8_U-3Das/edit?gid=0#gid=0"
            )
          }
        >
          <span>TEMPLATE</span>
        </button>
        <button className="cssbuttons-io-button" onClick={toggleFormPopup}>
          <svg
            height="24"
            width="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 0h24v24H0z" fill="none"></path>
            <path
              d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"
              fill="currentColor"
            ></path>
          </svg>
          <span>ADD COURSES</span>
        </button>
      </div>

      {showFormPopup && (
        <div className="semester-popup-modal">
          <div className="semester-popup-content">
            <AddLeftSection rows={terms} setTerms={setTerms} />
            <button
              className="semester-close-button"
              onClick={toggleFormPopup}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default TemplatePage;
