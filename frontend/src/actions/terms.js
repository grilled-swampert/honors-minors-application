// actions/terms.js
import {
  FETCH_TERMS,
  CREATE_TERM,
  UPDATE_TERM,
  DELETE_TERM,
  FETCH_STUD_TERM,
  FETCH_STUD_DETAILS,
  FETCH_STUDENTS,
  FETCH_ALL_COURSES,
  SUBMIT_COURSES,
} from "../constants/actonsTypes.js";
import * as api from "../api/index.js";

// Term Actions
export const getTerms = () => async (dispatch) => {
  try {
    console.log("Sending request to fetch terms");
    const { data } = await api.fetchTerms();
    console.log("Received data:", data);
    dispatch({ type: FETCH_TERMS, payload: data });
  } catch (error) {
    console.error("Error fetching terms:", error.message);
    console.error(error);
  }
};

export const getTerm = (termId) => async (dispatch) => {
  try {
    const response = await fetch(`/admin/${termId}/edit`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const term = await response.json();
    dispatch({
      type: "GET_TERM_SUCCESS",
      payload: term,
    });
  } catch (error) {
    dispatch({
      type: "GET_TERM_FAILURE",
      payload: error.message,
    });
  }
};

export const createTerm = (term) => async (dispatch) => {
  try {
    const { data } = await api.createTerm(term);
    dispatch({ type: CREATE_TERM, payload: data });
  } catch (error) {
    console.log(error.message);
  }
};

export const updateTerm = (id, term) => async (dispatch) => {
  try {
    const { data } = await api.updateTerm(id, term);
    dispatch({ type: UPDATE_TERM, payload: data });
  } catch (error) {
    console.log(error.message);
  }
};

export const deleteTerm = (id) => async (dispatch) => {
  try {
    await api.deleteTerm(id);
    dispatch({ type: DELETE_TERM, payload: id });
  } catch (error) {
    console.log(error.message);
  }
};

// Student Actions
export const getTermDetails = (studentId) => async (dispatch) => {
  try {
    const { data } = await api.getTermDetails(studentId);
    dispatch({ type: FETCH_STUD_TERM, payload: data });
  } catch (error) {
    console.log(error.message);
  }
};

export const getStudents = (branch, termId) => async (dispatch) => {
  console.log("Fetching students for branch:", branch); // Debug log for termId
  console.log("Fetching students for Term ID:", termId); // Debug log for termId

  try {
    const { data } = await api.fetchStudents(branch, termId);
    console.log("Fetched Data:", data); // Debug log for fetched data
    dispatch({ type: FETCH_STUDENTS, payload: data });
  } catch (error) {
    console.error("Error fetching students:", error.message); // Debug log for errors
  }
};

export const getDropStudents = (branch, termId) => async (dispatch) => {
  console.log("Fetching students for branch:", branch); // Debug log for termId
  console.log("Fetching students for Term ID:", termId); // Debug log for termId

  try {
    const { data } = await api.getDropStudents(branch, termId);
    console.log("Fetched Data:", data); // Debug log for fetched data
    dispatch({ type: "FETCH_DROP_STUDENTS", payload: data });
  } catch (error) {
    console.error("Error fetching students:", error.message); // Debug log for errors
  }
};

export const putDropApplication = (branch, termId, studentId) => async (dispatch) => {
  try {
    const { data } = await api.putDropApplication(branch, termId, studentId);
    dispatch({ type: "PUT_DROP_APPLICATION", payload: data });
  } catch (error) {
    console.error("Error dropping student:", error.message);
  }
}

export const getCourses = (termId) => async (dispatch) => {
  try {
    console.log("From getCourses, termId: ", termId);

    // Log before the API call
    console.log("Fetching courses data...");

    // Fetch data from API
    const { data } = await api.getAllCourses(termId);

    // Log after fetching data
    console.log("Fetched Data:", data);

    // Log before dispatching action
    console.log("Dispatching FETCH_ALL_COURSES with payload:", data);

    // Dispatch the action to the reducer
    dispatch({ type: FETCH_ALL_COURSES, payload: data });

    // Log after dispatch (this confirms dispatch call was made)
    console.log("Dispatch completed.");
  } catch (error) {
    // Log the error if the API call fails
    console.error("Error fetching courses:", error.message);
  }
};

export const submitCourses = (studentId, courses) => async (dispatch) => {
  try {
    const { data } = await api.submitCourses(studentId, courses);
    dispatch({ type: SUBMIT_COURSES, payload: data });
  } catch (error) {
    console.error("Error submitting courses:", error.message);
  }
};

export const deactivateCourse = (termId, courseId) => async (dispatch) => {
  try {
    const { data } = await api.deactivateCourse(termId, courseId);
    dispatch({ type: "DEACTIVATE_COURSE_SUCCESS", payload: data });
  } catch (error) {
    dispatch({ type: "DEACTIVATE_COURSE_FAILURE", payload: error.message });
  }
};

export const setMaxCount = (termId, courseId, maxCount) => async (dispatch) => {
  try {
    const { data } = await api.setMaxCount(termId, courseId, maxCount);
    dispatch({ type: "SET_MAX_COUNT_SUCCESS", payload: data });
  } catch (error) {
    dispatch({ type: "SET_MAX_COUNT_FAILURE", payload: error.message });
  }
};

export const applyForDrop = (studentId) => async (dispatch) => {
  try {
    const { data } = await api.applyForDrop(studentId);
    dispatch({ type: "APPLY_FOR_DROP_SUCCESS", payload: data });
  } catch (error) {
    dispatch({ type: "APPLY_FOR_DROP_FAILURE", payload: error.message });
  }
};