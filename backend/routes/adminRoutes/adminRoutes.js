const express = require("express");
const mongoose = require("mongoose");
const Term = require("../../models/termModel/termModel.js");
const {
  getAllTerms,
  getTerm,
  createTerm,
  updateTerm,
  deleteTerm,
  getAllCourses,
  deactivateCourse,
  setMaxCount,
  getStudentsAllocatedToCourse,
  getAllocationInfo,
  createBroadcastMessage,
  getActiveBroadcastMessages,
  deleteBroadcastMessage,
  toggleBroadcastMessage,
  toggleCourseActivation,
} = require("../../controllers/admin/adminControllers.js");
const csvController = require("../../controllers/admin/csvController.js");

const router = express.Router();

// GET all terms
router.get("/", getAllTerms);

// GET one term
router.get("/:termId", getTerm);

// POST one term
router.post("/", createTerm);

// UPDATE one term
router.put("/:termId/edit/addCourses", updateTerm);

// DELETE one term
router.delete("/:termId", deleteTerm);

// GET all courses
router.get("/:termId/edit/allocation", getAllCourses);

// DEACTIVATE a course
// router.patch("/:termId/edit/allocation", deactivateCourse);

// TOGGLE a course
router.put("/:termId/edit/allocation", toggleCourseActivation);

// SET max count
router.patch("/:termId/edit/allocation", setMaxCount);

// New route to get students allocated to a course
router.get("/:termId/courses/:courseId/students", getStudentsAllocatedToCourse);

// GET allocation information for all courses in a term
router.get("/:termId/allocation-info", getAllocationInfo);

//--------------------------------------------

// PATCH courses of a term
router.patch(
  "/:termId/edit/addCourses",
  csvController.uploadFiles,
  csvController.createSemesterAndProcessCSV
);

// GET a term
router.get("/:termId/edit", getTerm);

// Broadcast Message Routes
router.post("/:termId/edit/broadcast", createBroadcastMessage);
router.get("/:termId/edit/broadcast", getActiveBroadcastMessages);
router.delete("/:termId/edit/broadcast/:id", deleteBroadcastMessage);
router.patch("/:termId/edit/broadcast", toggleBroadcastMessage);

//--------------------------------------------
module.exports = router;
