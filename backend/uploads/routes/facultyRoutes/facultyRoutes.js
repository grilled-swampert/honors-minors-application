const express = require('express');
const { getAllTerms, getTerm } = require('../../controllers/admin/adminControllers');
const { getSemesters, getAllStudentsInTerm, updateStudentDetails } = require('../../controllers/faculty/facultyControllers');
const studentFileController = require('../../controllers/faculty/studentFileController');

const router = express.Router();

// GET all terms
router.get('/:branch', getAllTerms);

// GET one term
router.get('/:branch/:termId', getTerm);

// GET all semesters in a term
router.get('/branch/:termId/edit', getSemesters);

// Add students to a semester
router.patch('/:branch/:termId/edit/addStudents', studentFileController.uploadFiles, studentFileController.addStudents);

// GET all students in a term
router.get('/branch/:termId/edit/approveCertificate', getAllStudentsInTerm);
router.get('/branch/:termId/edit/approveCourses', getAllStudentsInTerm);
router.get('/branch/:termId/view/students', getAllStudentsInTerm);
router.get('/branch/:termId/view', getAllStudentsInTerm)

// UPDATE student details
router.patch('/branch/:termId/edit/approveCertificate/:studentId', updateStudentDetails);
router.patch('/branch/:termId/edit/approveCourses/:studentId', updateStudentDetails);

//

module.exports = router;