// reducers/terms.js
import { 
    FETCH_TERMS, CREATE_TERM, UPDATE_TERM, FETCH_TERM, SUBMIT_COURSES,
    FETCH_STUD_TERM, FETCH_STUD_DETAILS, FETCH_ALL_COURSES,
    DEACTIVATE_COURSE, SET_MAX_COUNT,
    APPLY_FOR_DROP
} from '../constants/actonsTypes';
  
// eslint-disable-next-line import/no-anonymous-default-export
export default (terms = [], action) => {
    switch (action.type) {
        case FETCH_TERMS:
            return action.payload;

        case FETCH_TERM:
            return action.payload;

        case CREATE_TERM:
            return [...terms, action.payload];

        case UPDATE_TERM:
            return terms.map((term) => (term._id === action.payload._id ? action.payload : term));

        case SUBMIT_COURSES:
            return terms.map((term) => (term._id === action.payload._id ? action.payload : term));

        case FETCH_STUD_TERM:
            return action.payload;

        case APPLY_FOR_DROP:
            return terms.map((term) => (term._id === action.payload._id ? action.payload : term));

        case FETCH_STUD_DETAILS:
            return action.payload;

        case FETCH_ALL_COURSES:
            console.log("Reducer received FETCH_ALL_COURSES with payload:", action.payload);
            return action.payload;

        case DEACTIVATE_COURSE:
            return terms.map((term) => (term._id === action.payload._id ? action.payload : term));

        case SET_MAX_COUNT:
            return terms.map((term) => (term._id === action.payload._id ? action.payload : term));
        
        default:
            return terms;
    }
};


  