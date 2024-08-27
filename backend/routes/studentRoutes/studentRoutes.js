const express = require('express');
const { getFilteredCoursesForStudent, getTermFromStudent } = require('../../controllers/student/studentControllers');
const Student = require('../../models/studentModel/studentModel');
const mongoose = require('mongoose');
const Course = require('../../models/courseModel/courseModel');

const router = express.Router();

router.get('/:studentId/dashboard', getTermFromStudent)
router.get('/:studentId/courses', getFilteredCoursesForStudent);


router.patch('/:studentId/courses', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const { courses } = req.body; // Expecting an array of course IDs

    if (!Array.isArray(courses)) {
      return res.status(400).json({ message: 'Courses must be an array' });
    }

    // Find the course documents using the course IDs
    const validCourses = await Course.find({ _id: { $in: courses } });

    if (validCourses.length !== courses.length) {
      return res.status(404).json({ message: 'One or more courses not found' });
    }

    // Update the student's courses field with the valid courses
    const student = await Student.findByIdAndUpdate(
      studentId,
      { courses: validCourses.map(course => course._id) },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;