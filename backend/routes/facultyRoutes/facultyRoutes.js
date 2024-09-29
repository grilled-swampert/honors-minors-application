const express = require('express');
const { getAllTerms, getTerm } = require('../../controllers/admin/adminControllers');
const { getAllStudentsInTerm, getDropStudents, updateDropApprovalStatus } = require('../../controllers/faculty/facultyControllers');
const studentFileController = require('../../controllers/faculty/studentFileController');

const router = express.Router();

// GET all terms
router.get('/:branch', getAllTerms);

// GET one term
router.get('/:branch/:termId', getTerm);

// GET all semesters in a term

// Add students to a semester
router.patch('/:branch/:termId/edit/facAddStudent', studentFileController.uploadFiles, studentFileController.addStudents);

// GET all students in a term
router.get('/:branch/:termId/facView', getAllStudentsInTerm);

router.get('/:branch/:termId/edit/facDrop', getDropStudents);
router.put('/:branch/:termId/edit/facDrop', updateDropApprovalStatus);
module.exports = router;