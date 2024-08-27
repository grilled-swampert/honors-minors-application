import { combineReducers } from "redux";

import terms from "./terms";
import termReducer from "./termReducer";
import students from "./students";

const rootReducer = combineReducers({
  terms,
  filteredCoursesState: termReducer,
  students,
});

export default rootReducer;
