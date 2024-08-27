const express = require('express');
const { getAllTerms, getTerm, getSemesters, getAllStudentsInTerm, getNPTELCourses, getCourseraCourses, getCollegeCourses, getStudentTerms } = require('../../controllers/student/studentControllers');

const router = express.Router();

// GET all terms
router.get('/:studentId', getAllTerms);

// GET one term
router.get('/:studentId/:termId', getTerm);

// GET all semesters in a term
router.get('/:studentId', getSemesters);

// GET student details
router.get('/:studentId', getAllStudentsInTerm);

router.get('/:studentId/terms', getStudentTerms);

// GET NPTEL
router.get('/:studentId/:termId/:semesterId/nptelCourses', getNPTELCourses);

// GET Coursera
router.get('/:studentId/:termId/:semesterId/courseraCourses', getCourseraCourses);

// GET College
router.get('/:studentId/:termId/:semesterId/somaiyaCourses', getCollegeCourses);

module.exports = router;