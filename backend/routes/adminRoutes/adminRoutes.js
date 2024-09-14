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
router.patch("/:termId", updateTerm);

// DELETE one term
router.delete("/:termId", deleteTerm);

// GET all courses
router.get("/:termId/edit/allocation", getAllCourses);

// DEACTIVATE a course
router.patch("/:termId/edit/allocation", deactivateCourse);

// SET max count
router.put("/:termId/edit/allocation", setMaxCount);

// New route to get students allocated to a course
router.get("/:termId/edit/allocation", getStudentsAllocatedToCourse);

//--------------------------------------------

// POST a semester of a term
router.patch("/:termId/edit/addCourses", csvController.uploadFiles, csvController.createSemesterAndProcessCSV);

// GET a term
router.get("/:termId/edit", getTerm);

//--------------------------------------------
module.exports = router;


