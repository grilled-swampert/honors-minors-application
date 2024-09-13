import React from 'react';
import './fac-add-bottom.css';
import { useParams } from 'react-router-dom';

function FacAddBottom({ term }) {
    const { branch } = useParams();

    let studentData;
    const branchRequired = branch.toUpperCase();

    if (branchRequired === 'EXCP') {
        studentData = term.EXCP_students || 'No data available';
    } else if (branchRequired === 'COMP') {
        studentData = term.COMP_students || 'No data available';
    } else if (branchRequired === 'MECH') {
        studentData = term.MECH_students || 'No data available';
    } else if (branchRequired === 'IT') {
        studentData = term.IT_students || 'No data available';
    } else if (branchRequired === 'ETRX') {
        studentData = term.ETRX_students || 'No data available';
    } else if (branchRequired === 'AIDS') {
        studentData = term.AIDS_students || 'No data available';
    } else if (branchRequired === 'RAI') {
        studentData = term.RAI_students || 'No data available';
    } else if (branchRequired === 'CCE') {
        studentData = term.CCE_students || 'No data available';
    } else if (branchRequired === 'VDT') {
        studentData = term.VDT_students || 'No data available';
    } else if (branchRequired === 'CSBS') {
        studentData = term.CSBS_students || 'No data available';
    } else {
        studentData = 'Branch not recognized';
    }

    return (
        <div className="add-bottom">
            <div className="add-box">
                <p>CSV: {studentData}</p>
            </div>
        </div>
    );
}

export default FacAddBottom;
