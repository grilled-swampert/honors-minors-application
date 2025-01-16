import {
    FETCH_STUDENTS,
    FETCH_DROP_STUDENTS,
    PUT_DROP_APPLICATION
} from '../constants/actonsTypes';

// eslint-disable-next-line import/no-anonymous-default-export
export default (students = [], action) => {
    switch (action.type) {
        case FETCH_STUDENTS:
            return action.payload;

        case FETCH_DROP_STUDENTS:
            return action.payload;

        case PUT_DROP_APPLICATION:
            return action.payload;
        
        default:
            return students;
    }
}
