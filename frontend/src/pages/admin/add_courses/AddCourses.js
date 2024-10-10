import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getTerm, getTerms } from '../../../actions/terms';
import './add-courses.css';
import TemplatePage from './components/template';
import AddLeftSection from './components/add-left-section';
import AddRightSection from './components/add-right-section';
import Header from '../../header/header';
import AdminSideBar from '../admin-sidebar/adminSidebar';

const AddCoursesPage = () => {
  const [terms, setTerms] = useState([]);
  const { termId } = useParams();

  const dispatch = useDispatch();
  const allTerms = useSelector((state) => state.terms);

  useEffect(() => {
    if (termId) {
      dispatch(getTerms());
    }
  }, [dispatch, termId]);

  console.log('Terms from store:', allTerms);

  // get the term using id
  const termNeeded = allTerms.find((allTerms) => allTerms._id === termId);
  console.log('Term needed:', termNeeded);

  return (
    <div className="main">
      <Header />
      <div className="admin-add-content">
      <AdminSideBar />
      <div className='add-right-sec'> 
      <TemplatePage />
        <AddLeftSection rows={terms} setTerms={setTerms} />
        <div className="ad-right-section">
          <table id="ad-table">
            <thead>
              <tr>
                <th>DOWNLOAD</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody id="table-body">
              {termNeeded ? (
                <AddRightSection key={termNeeded._id} term={termNeeded} setTerms={setTerms}/>
              ) : (
                <tr>
                  <td colSpan="4">No courses added yet.</td>
                </tr>
              )}
            
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AddCoursesPage;