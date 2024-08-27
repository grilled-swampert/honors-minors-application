const express = require("express");
const mongoose = require("mongoose");
const Term = require("../../models/termModel/termModel.js");
const {
  getAllTerms,
  getTerm,
  createTerm,
  updateTerm,
  deleteTerm,
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

// POST a semester of a term
router.patch("/:termId/edit", csvController.uploadFiles, csvController.createSemesterAndProcessCSV);

// GET a term
router.get("/:termId/edit", getTerm);

//--------------------------------------------
module.exports = router;
