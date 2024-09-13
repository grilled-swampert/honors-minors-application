import React, { useEffect } from 'react';
import './facAddStudent.css';
// import { Link } from 'react-router-dom';
import Header from '../../header/header';
import FacTemplate from './components/fac-template';
import FacAddTop from './components/fac-add-top';
import FacAddBottom from './components/fac-add-bottom';
import FacNavbar from '../facNavbar/facNavbar';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTerms } from '../../../actions/terms';

function FacAddStudent(){
    const { termId } = useParams();

    const dispatch = useDispatch();
    const terms = useSelector((state) => state.terms);
  
    useEffect(() => {
      if (termId) {
        dispatch(getTerms());
      }
    }, [dispatch, termId]);
  
    console.log('Terms from store:', terms);
  
    // get the term using id
    const termNeeded = terms.find((term) => term._id === termId);
    console.log('Term needed:', termNeeded);

    return(
        <div className='main'>
        <Header />
           <div className='add-content'>
            <FacTemplate />
            <FacNavbar />
            <div className='add-right'>
            <FacAddTop />
            <div className="fac-add-bottom"> 
                {
                    termNeeded ? (
                        <FacAddBottom term={termNeeded} key={termNeeded._id}/>
                    ) : (
                        <tr>
                          <td colSpan="4">No students added yet.</td>
                        </tr>
                    )
                }
            </div>
            </div>
        </div>
        </div>
    );
}
export default FacAddStudent;