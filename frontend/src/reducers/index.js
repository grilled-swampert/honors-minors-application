import { combineReducers } from "redux";

import terms from "./terms";
import termReducer from "./termReducer";
import students from "./students";
import { courseActivationReducer } from "./courseReducer";

const rootReducer = combineReducers({
  terms,
  filteredCoursesState: termReducer,
  students,
  courseActivation: courseActivationReducer,
});

export default rootReducer;
