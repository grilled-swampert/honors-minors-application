import React from 'react';
import './template.css'; 
// import { Link } from 'react-router-dom';

const TemplatePage = ()=>{
    return(
    <div className="template">
        DOWNLOAD TEMPLATE:
        <button id="honours"><a href="https://docs.google.com/spreadsheets/d/1o_BabKrTUoPsEUOvbT4g06cfsN5T1_syPjBOPKNnE0A/edit?usp=sharing" target="_blank" rel="noopener noreferrer">PROGRAM LIST</a></button>
    </div>
    );
}
export default TemplatePage;