// src/reducers/courseReducer.js
import {
  TOGGLE_COURSE_ACTIVATION_REQUEST,
  TOGGLE_COURSE_ACTIVATION_SUCCESS,
  TOGGLE_COURSE_ACTIVATION_FAILURE,
} from "../constants/actonsTypes";

const initialState = {
  loading: false,
  course: null,
  error: null,
};

export const courseActivationReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_COURSE_ACTIVATION_REQUEST:
      return { ...state, loading: true, error: null };

    case TOGGLE_COURSE_ACTIVATION_SUCCESS:
      return { ...state, loading: false, course: action.payload };

    case TOGGLE_COURSE_ACTIVATION_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
