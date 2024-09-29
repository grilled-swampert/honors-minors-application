import {
    FETCH_STUDENTS,
    FETCH_DROP_STUDENTS,
    PUT_DROP_APPLICATION
} from '../constants/actonsTypes';

// eslint-disable-next-line import/no-anonymous-default-export
export default (students = [], action) => {
    switch (action.type) {
        case FETCH_STUDENTS:
            console.log('FETCH_STUDENTS Action Payload:', action.payload); // Debug log for action payload
            return action.payload;

        case FETCH_DROP_STUDENTS:
            console.log('FETCH_DROP_STUDENTS Action Payload:', action.payload); // Debug log for action payload
            return action.payload;

        case PUT_DROP_APPLICATION:
            console.log('PUT_DROP_APPLICATION Action Payload:', action.payload); // Debug log for action payload
            return action.payload;
        
        default:
            console.log('Default Case, Returning Current Students:', students); // Debug log for default case
            return students;
    }
}
