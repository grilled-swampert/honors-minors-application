import React, { useState } from 'react';
import AlpLeftSection from './alp-left-section';
import AlpRightSection from './alp-right-section';
import './alp-main.css';
import { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { getTerms } from '../../../../actions/terms';

const AlpMain = () => {
  const [term, setTerm] = useState('');
  const [sem, setSem] = useState('');
  const [rows, setRows] = useState([
    { term: '2023-24', sem: 'EVEN' },
    { term: '2023-25', sem: 'ODD' },
  ]);

  const handleCreate = () => {
    setRows([...rows, { term, sem }]);
    setTerm('');
    setSem('');
  };

  const dispatch = useDispatch();
  const terms = useSelector((state) => state.terms);

  useEffect(() => {
    dispatch(getTerms());
  }, [dispatch]);

  return (
    <div className="alp-main">
      <div className="land-content">
        <div className="left-panel">
          <AlpLeftSection />
        </div>
      </div>
      <div className="right-panel"> 
        <table id="admin-term-table">
          <thead>
            <tr>
              <th scope="col">ACADEMIC YEAR</th>
              <th scope="col">EDIT</th>
              <th scope="col">DELETE</th>
            </tr>
          </thead>
          { terms && terms.map((term) => (
            <AlpRightSection term={term} key={term._id} />
          ))}
        </table>      
      </div>
    </div>
  );
}

export default AlpMain;
