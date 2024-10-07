import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// import LoginPage from './pages/login';
import FirebaseLogin from './login';
import { PrivateRoute } from './pages/login';
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
        <Route path="/" element={<FirebaseLogin />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminLandingPage />
          </PrivateRoute>
        } />
        <Route path="/admin/:termId/view" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminViewPage />
          </PrivateRoute>
        } />
        <Route path="/admin/:termId/edit/addCourses" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AddCoursesPage />
          </PrivateRoute>
        } />
        <Route path="/admin/:termId/edit/allocation" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Allocation />
          </PrivateRoute>
        } />
        <Route path="/admin/:termId/edit/broadcast" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Broadcast />
          </PrivateRoute>
        } />

        {/* Faculty Routes */}
        <Route path="/faculty/:branch/dashboard" element={
          <PrivateRoute allowedRoles={['faculty']}>
            <FacLandingPage />
          </PrivateRoute>
        } />
        <Route path="/faculty/:branch/:termId/edit/facAddStudent" element={
          <PrivateRoute allowedRoles={['faculty']}>
            <FacAddStudent />
          </PrivateRoute>
        } />
        <Route path='/faculty/:branch/:termId/facView' element={
          <PrivateRoute allowedRoles={['faculty']}>
            <FacView />
          </PrivateRoute>
        } />
        <Route path='/faculty/:branch/:termId/edit/facDrop' element={
          <PrivateRoute allowedRoles={['faculty']}>
            <FacDrop />
          </PrivateRoute>
        } />

        {/* Student Routes */}
        <Route path='/student/:studentId/dashboard' element={
          <PrivateRoute allowedRoles={['student']}>
            <StudentDashboard />
          </PrivateRoute>
        } />
        <Route path='/student/:studentId/courses' element={
          <PrivateRoute allowedRoles={['student']}>
            <SelectCourses />
          </PrivateRoute>
        } />
      </Routes> 
    </BrowserRouter>
  );
}
export default App;
