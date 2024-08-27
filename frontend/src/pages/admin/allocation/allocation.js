import React, { useState } from 'react';
import './allocation.css';
import Header from '../../header/header';
import AdminSideBar from '../admin-sidebar/adminSidebar';

const Allocation = () => {
  const [tableData, setTableData] = useState([
    {
      department: 'IT',
      courseName: 'ABC',
      category: 'Honours',
      choices: [30, 10, 9, 7],
      maxCount: '',
      notRun: false,
      finalCount: 50
    },
    {
      department: 'COMPS',
      courseName: 'XYZ',
      category : 'Minors',
      choices: [30, 10, 9, 7],
      maxCount: '',
      notRun: false,
      finalCount: 40
    }
  ]);

 
  // Handle input changes
  const handleInputChange = (index, event) => {
    const { id, value, checked } = event.target;
    const updatedTableData = [...tableData];

    if (id === 'maxCount') {
      updatedTableData[index].maxCount = value;
    } else if (id === 'notRun') {
      updatedTableData[index].notRun = checked;
    }

    setTableData(updatedTableData);
  };

  function applyChanges() {
    const table = document.getElementById('myTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        
        for (let j = 0; j < cells.length; j++) {
            const cell = cells[j];
            const input = cell.querySelector('input:not([type="checkbox"])');  
            
            if (input && input.value.trim() !== "") {  
              const text = document.createTextNode(input.value);
              cell.removeChild(input);
              cell.appendChild(text);
          }
        }
    }
}

  return (
    <div className="main">
     <Header />
    <AdminSideBar />
      <div className="ad-content">
        <table id="myTable">
          <thead>
            <tr>
              <th>OFFERING DEPARTMENT</th>
              <th>PROGRAM NAME</th>
              <th>CATEGORY</th>
              <th>1<sup>st</sup> CHOICE</th>
              <th>2<sup>nd</sup> CHOICE</th>
              <th>3<sup>rd</sup> CHOICE</th>
              <th>4<sup>th</sup> CHOICE</th>
              <th>MAX COUNT</th>
              <th>NOT RUN</th>
              <th>FINAL COUNT</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                <td>{row.department}</td>
                <td>{row.courseName}</td>
                <td>{row.category}</td>
                {row.choices.map((choice, i) => (
                  <td key={i}>{choice}</td>
                ))}
                <td>
                  {<input
                    type="number"
                    placeholder="Count"
                    value={row.maxCount}
                    onChange={(e) => handleInputChange(index, e)}
                    id="maxCount"
                  /> } 
                   {/* <td><input placeholder="Count" className="max-count" id="input1" /></td> */}
                </td>
                <td>
                  { <input
                    type="checkbox"
                    checked={row.notRun}
                    onChange={(e) => handleInputChange(index, e)}
                    id="notRun"
                  /> }
                   {/* <td><input type="checkbox"/></td> */}
                </td>
                <td>{row.finalCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="apply-btn" onClick={applyChanges}>APPLY</button>
      <button className="submit-btn">SUBMIT</button>
    </div>
  );
};

export default Allocation;
