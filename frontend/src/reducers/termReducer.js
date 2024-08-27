// reducers/termReducer.js
const initialState = {
    filteredCourses: [], // Initialize as an empty array
    loading: false,
    error: null,
};
  
export default function termReducer(state = initialState, action) {
    switch (action.type) {
      case 'FETCH_COURSES_REQUEST':
        return {
          ...state,
          loading: true,
          error: null,
        };
      case 'FETCH_COURSES_SUCCESS':
        return {
          ...state,
          loading: false,
          filteredCourses: action.payload, // Set fetched courses here
        };
      case 'FETCH_COURSES_FAILURE':
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      default:
        return state;
    }
  }
  