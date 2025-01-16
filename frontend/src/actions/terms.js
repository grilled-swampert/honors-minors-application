// actions/terms.js
import {
  FETCH_TERMS,
  CREATE_TERM,
  UPDATE_TERM,
  DELETE_TERM,
  FETCH_STUD_TERM,
  FETCH_STUDENTS,
  FETCH_ALL_COURSES,
  SUBMIT_COURSES,
} from "../constants/actonsTypes.js";
import * as api from "../api/index.js";

// Term Actions
export const getTerms = () => async (dispatch) => {
  try {
    const { data } = await api.fetchTerms();
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
    console.error(error.message);
  }
};

export const updateTerm = (id, term) => async (dispatch) => {
  try {
    const { data } = await api.updateTerm(id, term);
    dispatch({ type: UPDATE_TERM, payload: data });
  } catch (error) {
    console.error(error.message);
  }
}

export const deleteTerm = (id) => async (dispatch) => {
  try {
    await api.deleteTerm(id);
    dispatch({ type: DELETE_TERM, payload: id });
  } catch (error) {
    console.error(error.message);
  }
};

// Student Actions
export const getTermDetails = (studentId) => async (dispatch) => {
  try {
    const { data } = await api.getTermDetails(studentId);
    dispatch({ type: FETCH_STUD_TERM, payload: data });
  } catch (error) {
    console.error(error.message);
  }
};

export const getStudents = (branch, termId) => async (dispatch) => {
  try {
    const { data } = await api.fetchStudents(branch, termId);
    dispatch({ type: FETCH_STUDENTS, payload: data });
  } catch (error) {
    console.error("Error fetching students:", error.message); // Debug log for errors
  }
};

export const getDropStudents = (branch, termId) => async (dispatch) => {
  try {
    const { data } = await api.getDropStudents(branch, termId);
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
    const { data } = await api.getAllCourses(termId);
    dispatch({ type: FETCH_ALL_COURSES, payload: data });
  } catch (error) {
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

export const deleteStudents = (studentId, branch, termId) => async (dispatch) => {
  try {
    const response = await api.deleteStudents(studentId, branch, termId);
    dispatch({ type: "DELETE_STUDENTS_SUCCESS", payload: studentId });
  } catch (error) {
    console.error("Error in deleteStudents action:", error.message);
    dispatch({ type: "DELETE_STUDENTS_FAILURE", payload: error.message });
  }
};
