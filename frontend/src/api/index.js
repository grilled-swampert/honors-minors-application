// api/index.js
import axios from 'axios';

const urlAdmin = 'http://localhost:3000/admin';
const urlStudent = 'http://localhost:3000/student';

// Term API Requests
export const fetchTerms = () => axios.get(urlAdmin);
export const createTerm = (newTerm) => axios.post(urlAdmin, newTerm);
export const updateTerm = (id, updatedTerm) => axios.patch(`${urlAdmin}/${id}`, updatedTerm);
export const deleteTerm = (id) => axios.delete(`${urlAdmin}/${id}`);
export const getTerm = (id) => axios.get(`${urlAdmin}/${id}`);
export const getAllCourses = (termId) => axios.get(`${urlAdmin}/${termId}/edit/allocation`);

// Course API Requests
// actions/terms.js
export const fetchCourses = (studentId) => async (dispatch) => {
    dispatch({ type: 'FETCH_COURSES_REQUEST' });
  
    try {
      const response = await axios.get(`/student/${studentId}/courses`);
      
      // Debugging: Log the response data
      console.log('API Response:', response.data);
  
      dispatch({ type: 'FETCH_COURSES_SUCCESS', payload: response.data.courses });
    } catch (error) {
      console.error('Error fetching courses:', error.message);
      dispatch({ type: 'FETCH_COURSES_FAILURE', payload: error.message });
    }
};

export const submitCourses = (studentId, courses) => async (dispatch) => {
    dispatch({ type: 'SUBMIT_COURSES_REQUEST' });
  
    try {
      const response = await axios.patch(`/student/${studentId}/courses`, { courses });
  
      // Debugging: Log the response data
      console.log('API Response:', response.data);
  
      dispatch({ type: 'SUBMIT_COURSES_SUCCESS', payload: response.data });
    } catch (error) {
      console.error('Error submitting courses:', error.message);
      dispatch({ type: 'SUBMIT_COURSES_FAILURE', payload: error.message });
    }
};

// Student API Requests
export const getTermDetails = (studentId) => axios.get(`${urlStudent}/${studentId}/dashboard`);
export const getStudentDetails = (studentId) => axios.get(`${urlStudent}/${studentId}/dashboard`);

// Faculty API Requests
export const fetchStudents = (termId) => axios.get(`/faculty/branch/${termId}/facView`);
