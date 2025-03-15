// api/index.js
import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:9000";

const urlAdmin = `${API_BASE_URL}/admin`;
const urlFaculty = `${API_BASE_URL}/faculty`;
const urlStudent = `${API_BASE_URL}/student`;

// const urlAdmin = 'http://localhost:9000/admin';
// const urlFaculty = 'http://localhost:9000/faculty';
// const urlStudent = 'http://localhost:9000/student';

// Term API Requests
export const fetchTerms = () => axios.get(urlAdmin);
export const createTerm = (newTerm) => axios.post(urlAdmin, newTerm);
export const updateTerm = (id, updatedTerm) =>
  axios.patch(`${urlAdmin}/${id}/edit/addCourses`, updatedTerm);
export const deleteTerm = (id) => axios.delete(`${urlAdmin}/${id}`);
export const getTerm = (id) => axios.get(`${urlAdmin}/${id}`);
export const getAllCourses = (termId) =>
  axios.get(`${urlAdmin}/${termId}/edit/allocation`);
export const deactivateCourse = (termId, courseId) =>
  axios.patch(`${urlAdmin}/${termId}/edit/allocation`, courseId);

export const setMaxCount = (termId, courseId, maxCount) => {
  return axios
    .patch(`${urlAdmin}/${termId}/edit/allocation/max-count`, { courseId, maxCount })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error("API Error:", error.response?.data || error.message); // Log error details
      throw error;
    });
};

export const fetchCourses = (studentId) => async (dispatch) => {
  dispatch({ type: "FETCH_COURSES_REQUEST" });

  try {
    const response = await axios.get(`/student/${studentId}/courses`);
    dispatch({ type: "FETCH_COURSES_SUCCESS", payload: response.data.courses });
  } catch (error) {
    console.error("Error fetching courses:", error.message);
    dispatch({ type: "FETCH_COURSES_FAILURE", payload: error.message });
  }
};

export const submitCourses = (studentId, selectedCourses) =>
  axios.patch(`/student/${studentId}/courses`);

// Student API Requests
export const getTermDetails = (studentId) =>
  axios.get(`${urlStudent}/${studentId}/dashboard`);
export const applyForDrop = (studentId) =>
  axios.post(`${urlStudent}/${studentId}/dashboard`);

// Faculty API Requests
export const fetchStudents = (branch, termId) =>
  axios.get(`${urlFaculty}/${branch}/${termId}/facView`);
export const getDropStudents = (branch, termId) =>
  axios.get(`${urlFaculty}/${branch}/${termId}/edit/facDrop`);
export const putDropApplication = (branch, termId, studentId) =>
  axios.put(`${urlFaculty}/${branch}/${termId}/edit/facDrop`, studentId);
export const deleteStudents = (studentId, branch, termId) => 
  axios.delete(`${urlFaculty}/${branch}/${termId}/facView`, { data: { studentId } });