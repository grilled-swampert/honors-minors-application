const Term = require("../../models/termModel/termModel");
const Course = require("../../models/courseModel/courseModel");

const asyncHandler = require("express-async-handler");

// GET all terms
exports.getAllTerms = asyncHandler(async (req, res) => {
  try {
    const terms = await Term.find();
    res.json(terms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single term
exports.getTerm = asyncHandler(async (req, res) => {
  const { termId } = req.params;
  console.log(`Received ID: ${termId}`); // Logging the ID for debugging

  try {
    const term = await Term.findById(termId);

    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }

    res.status(200).json(term);
  } catch (error) {
    console.error(`Error fetching term with ID ${termId}:`, error.message); // Logging the error for debugging
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// POST a term
exports.createTerm = asyncHandler(async (req, res) => {
  const term = new Term({
    termYear: req.body.termYear,
    termType: req.body.termType,
  });
  try {
    const newTerm = await term.save();
    res.status(201).json(newTerm);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE a term
exports.deleteTerm = async (req, res) => {
  const { termId } = req.params;
  try {
    const term = await Term.findByIdAndDelete(termId);
    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }
    res.status(200).json({ message: "Term deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE a term
exports.updateTerm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const term = await Term.findByIdAndUpdate(id, req.body, { new: true });
    if (!term) return res.status(404).json({ message: "Term not found" });
    res.status(200).json(term);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------
// DOWNLOAD syllabus
exports.downloadSyllabus = async (req, res) => {
  try {
    const { id } = req.params;
    const semester = await Semester.findById(id);

    if (!semester || !semester.syllabusFile) {
      return res.status(404).json({ message: "Syllabus file not found" });
    }

    const filePath = path.resolve(semester.syllabusFile);
    res.download(filePath, (err) => {
      if (err) {
        res.status(500).json({ message: "Error downloading file", err });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving syllabus file", error });
  }
};

// GET all courses
exports.getAllCourses = asyncHandler(async (req, res) => {
  const { termId } = req.params;

  try {
    // Find the term by termId
    const term = await Term.findById(termId);

    if (!term) {
      return res.status(404).json({ message: 'Term not found' });
    }

    // Extract course IDs from the term
    const courseIds = term.courses;

    // Find the courses using the extracted course IDs
    const courses = await Course.find({ _id: { $in: courseIds } });

    // Send the full course details
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

