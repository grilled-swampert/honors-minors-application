const express = require("express");
const {
  getFilteredCoursesForStudent,
  getTermFromStudent,
  submitCourses,
  updateDropDetails,
  uploadDropFile
} = require("../../controllers/student/studentControllers");
const { getActiveBroadcastMessages } = require("../../controllers/student/studentControllers");
const Student = require("../../models/studentModel/studentModel");
const mongoose = require("mongoose");
const Course = require("../../models/courseModel/courseModel");

const router = express.Router();

router.get("/:studentId/dashboard", getTermFromStudent);
router.get("/:studentId/courses", getFilteredCoursesForStudent);

router.patch("/:studentId/courses", submitCourses);
router.patch('/:studentId/dashboard', uploadDropFile , updateDropDetails);
router.get("/broadcast-messages", getActiveBroadcastMessages);

module.exports = router;
