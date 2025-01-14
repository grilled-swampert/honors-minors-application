import React, { useEffect } from "react";
import "./fac-template.css";
import csvlogo from "../../../photos-logos/csv.png";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTerms } from "../../../../actions/terms";

function FacTemplate() {
  const { termId } = useParams();
  const dispatch = useDispatch();
  const termDetail = useSelector((state) => state.terms[0]);

  useEffect(() => {
      if (termId) {
        dispatch(getTerms());
      }
    }, [dispatch, termId]);

  return (
    <div className="faculty-title-bar">
      <div className="faculty-edit-page-title">
        {termDetail ? `${termDetail.termYear}` : "Loading..."}
      </div>
      <div className="faculty-edit-page-buttons">
        <button
          className="faculty-template-download"
          onClick={() =>
            window.open(
              "https://docs.google.com/spreadsheets/d/10Ye9WUrPl-fX-ktz-t2E9pnDiEHDaRnBFQD2ln7UBxI/edit?gid=0#gid=0"
            )
          }
        >
          <span>TEMPLATE</span>
        </button>
      </div>
    </div>
  );
}
export default FacTemplate;