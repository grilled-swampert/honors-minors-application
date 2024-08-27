const express = require("express");
const mongoose = require("mongoose");
const Term = require("../../models/termModel/termModel.js");
const {
  getAllTerms,
  getTerm,
  createTerm,
  updateTerm,
  deleteTerm,
  getSemesters,
  getSemester,
  updateSemester,
  deleteSemester,
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

//--------------------------------------------

// GET all semesters of a term
router.get("/:termId/edit", getSemesters);
router.get("/:termId/view", getSemesters);

// GET a single semester of a term
router.get("/:termId/edit/:semesterId", getSemester);

// POST a semester of a term
router.post("/:termId/edit", csvController.uploadFiles, csvController.createSemesterAndProcessCSV);

// UPDATE a semester of a term
router.patch("/:termId/edit/:semesterId", updateSemester);

// DELETE a semester of a term
router.delete("/:termId/edit/:semesterId", deleteSemester);

//--------------------------------------------
module.exports = router;
