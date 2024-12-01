import React from "react";
import "./fac-template.css";
import csvlogo from "../../../photos-logos/csv.png";

function FacTemplate() {
  return (
    <div className="add-student-left">
      <p className="icons">DOWNLOAD TEMPLATE :</p>
      <a
        href="https://docs.google.com/spreadsheets/d/10Ye9WUrPl-fX-ktz-t2E9pnDiEHDaRnBFQD2ln7UBxI/edit?gid=0#gid=0"
        target="_blank"
        rel="noopener noreferrer"
      >
        <button className="add-temp-btn">
          
          <img className="temp-img" src={csvlogo} alt="csv" />
        </button>
      </a>
    </div>
  );
}
export default FacTemplate;