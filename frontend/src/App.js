import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// import LoginPage from '../src/pages/login';
import LoginPage from './pages/loginPage';


//Admin
import AdminLandingPage from './pages/admin/landingPage/adminLandingPage';
import AdminViewPage from './pages/admin/adminView/admin-view';
import AddCoursesPage from './pages/admin/add_courses/AddCourses';
import Allocation from './pages/admin/allocation/allocation';
import Broadcast from './pages/admin/broadcast_msg/broadcast';

import FacLandingPage from './pages/faculty/facLandingPage/facLandingPage';
import FacAddStudent from './pages/faculty/facAddStudent/facAddStudent';
import FacView from './pages/faculty/facView/facView';
import FacDrop from './pages/faculty/facDrop/facDrop';

//Faculty

// Student
import StudentDashboard from './pages/student/Student Dashboard/StudentDashboard';
import SelectCourses from './pages/student/Select_courses/SelectCourses';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element = {<LoginPage />}/> 
        <Route path="/admin" element={<AdminLandingPage />} />
        <Route path="/admin/:termId/view" element={<AdminViewPage />} />
        <Route path="/admin/:termId/edit/addCourses" element={<AddCoursesPage />} />
        <Route path="/admin/:termId/edit/allocation" element={<Allocation />} />
        <Route path="/admin/:termId/edit/broadcast" element = {<Broadcast />} />  

        {/* <Route path="/faculty/:branch/dashboard" element={<FacLandingPage />} /> */}
        <Route path="/facLandingPage" element={<FacLandingPage />} />

        <Route path="/faculty/:branch/:termId/edit/facAddStudent" element={<FacAddStudent />} />
        <Route path='/faculty/:branch/:termId/facView' element = {<FacView />} />
        <Route path='/faculty/:branch/:termId/edit/facDrop' element = {<FacDrop />} />

        {/* <Route path='/student/:studentId/dashboard' element = {<StudentDashboard />} /> */}
        <Route path='/stuLandingPage' element = {<StudentDashboard />} />

        <Route path='/student/:studentId/courses' element = {<SelectCourses />} />
      </Routes> 
    </BrowserRouter>
  );
}

export default App;
