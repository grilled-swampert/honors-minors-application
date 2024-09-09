import React, { useEffect, useState } from 'react';
import './allocation.css';
import Header from '../../header/header';
import AdminSideBar from '../admin-sidebar/adminSidebar';
import downloadIcon from '../../photos-logos/download.png';
import { useDispatch, useSelector } from 'react-redux';
import { getCourses } from '../../../actions/terms';
import AllocationRow from './allocationRow';
import { useParams } from 'react-router-dom';

const Allocation = () => {
  const { termId } = useParams();
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
      category: 'Minors',
      choices: [30, 10, 9, 7],
      maxCount: '',
      notRun: false,
      finalCount: 40
    }
  ]);

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

  const applyChanges = () => {
    setTableData(prevData => 
      prevData.map(row => ({
        ...row,
        maxCount: row.maxCount.trim() !== '' ? row.maxCount : '',
      }))
    );
  };

  const downloadRowData = (rowData) => {
    const csvContent = `Department,Course Name,Category,1st Choice,2nd Choice,3rd Choice,4th Choice,Max Count,Not Run,Final Count\n${rowData.department},${rowData.courseName},${rowData.category},${rowData.choices.join(',')},${rowData.maxCount},${rowData.notRun},${rowData.finalCount}`;
    downloadCSV(csvContent, `${rowData.department}_${rowData.courseName}_data.csv`);
  };

  const downloadAllData = () => {
    const headers = "Department,Course Name,Category,1st Choice,2nd Choice,3rd Choice,4th Choice,Max Count,Not Run,Final Count";
    const csvContent = tableData.map(row => 
      `${row.department},${row.courseName},${row.category},${row.choices.join(',')},${row.maxCount},${row.notRun},${row.finalCount}`
    ).join('\n');
    
    downloadCSV(`${headers}\n${csvContent}`, 'allocation_information.csv');
  };

  const downloadCSV = (content, fileName) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  console.log("Termid: ", termId);

  const dispatch = useDispatch();
  const allCourses = useSelector((state) => state.terms);
  console.log(allCourses);

  useEffect(() => {
    console.log("Inside useEffect with termId:", termId);
    
    // Log before dispatching the action
    console.log("Dispatching getCourses...");
    
    // Dispatch action to fetch courses
    dispatch(getCourses(termId));
  
    // Log after dispatching action to see if `allCourses` is updated right after
    console.log("After dispatch: ", allCourses);
  
  }, [dispatch, termId, allCourses]);
  
  // Log the state outside the useEffect to see when it updates
  console.log("allCourses after render: ", allCourses);
  

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
              <th>DOWNLOAD</th>
            </tr>
          </thead>
          {allCourses && allCourses.map((course, index) => (
            <AllocationRow
              course={course}
              key={course._id}
              handleInputChange={handleInputChange}
              downloadRowData={downloadRowData}
              downloadIcon={downloadIcon}
            />
          ))}
        </table>
      </div>



      <div className="action-buttons-container">
        <button className="apply-btn" onClick={applyChanges}>APPLY</button>
        <button className="submit-btn">SUBMIT</button>
        <button className="download-all-btn" onClick={downloadAllData}>DOWNLOAD ALLOCATION INFORMATION</button>
      </div>
    </div>
  );
};

export default Allocation;