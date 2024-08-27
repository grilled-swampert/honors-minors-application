import React from 'react';
import './fac-view-leftprt.css';

function FacViewLeftprt({ tabNumbers, activeTab, handleTabClick }) {
    return (
        <div className="view-sem-info">
            <div className={`side-tab ${activeTab === 'total' ? 'expanded' : ''}`} onClick={() => handleTabClick('total')}>
                <h2>Total</h2>
                <h1 className="number">{tabNumbers.total}</h1>
            </div>
            <div className={`side-tab ${activeTab === 'submitted' ? 'expanded' : ''}`} onClick={() => handleTabClick('submitted')}>
                <h2>Submitted</h2>
                <h1 className="number">{tabNumbers.submitted}</h1>
            </div>
            <div className={`side-tab ${activeTab === 'not-submitted' ? 'expanded' : ''}`} onClick={() => handleTabClick('not-submitted')}>
                <h2>Not Submitted</h2>
                <h1 className="number">{tabNumbers.notSubmitted}</h1>
            </div>
        </div>
    );
}

export default FacViewLeftprt;
