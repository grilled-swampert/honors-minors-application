import "./facLandingPage.css";
import Header from "../../header/header";
import { useDispatch, useSelector } from "react-redux";
import { getTerms } from "../../../actions/terms";
import React, { useEffect } from "react";
import TableRow from "./TableRow";
import { useParams } from "react-router-dom";

const FacLandingPage = () => {
  const { branch } = useParams();
  const dispatch = useDispatch();
  const rows = useSelector((state) => state.terms);
  console.log(rows);

  useEffect(() => {
    dispatch(getTerms());
  }, [dispatch]);

  console.log(rows);

  return (
    <div className="main-fac-landing">
      <Header />
      <p id="intro-fac">
        WELCOME{" "}
        <span className="highlight-branch-fac">{`${branch.toUpperCase()}`}</span>'s
        Faculty Coordinator
      </p>
      <div className="content-fac">
        <table className="table-fac-landing">
          <thead className="thead-fac-landing">
            <tr className="tr-fac-landing">
              <th className="th-fac-landing">TERM</th>
              <th className="th-fac-landing">VIEW</th>
              <th className="th-fac-landing">EDIT</th>
            </tr>
          </thead>
          {rows && rows.map((row) => <TableRow row={row} key={row._id} />)}
        </table>
      </div>
    </div>
  );
};
export default FacLandingPage;
