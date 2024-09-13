const Term = require("../../models/termModel/termModel");
const Student = require("../../models/studentModel/studentModel");

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
  const { id } = req.params;
  try {
    const term = await Term.findById(id);
    if (!term) return res.status(404).json({ message: "Term not found" });
    res.status(200).json(term);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all students across all semesters within a term
exports.getAllStudentsInTerm = asyncHandler(async (req, res) => {
  const { branch, termId } = req.params;

  try {
    console.log("Term ID:", termId);
    console.log("Branch:", branch);

    // Find the term
    const term = await Term.findById(termId);

    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }

    let studentIds;
    if (branch) {
      // If branch is specified, get the student list for that branch
      const branchKey = `${branch.toUpperCase()}_SL`;
      studentIds = term[branchKey] || [];
    } else {
      // If no branch is specified, collect all students from all branches
      const branchKeys = [
        'EXCP_SL', 'COMP_SL', 'MECH_SL', 'IT_SL', 'ETRX_SL',
        'AIDS_SL', 'RAI_SL', 'CCE_SL', 'VDT_SL', 'CSBS_SL'
      ];
      studentIds = branchKeys.reduce((allIds, key) => {
        return allIds.concat(term[key] || []);
      }, []);
    }

    // Fetch the actual student documents
    const students = await Student.find({ _id: { $in: studentIds } });

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update student details in a semester in a term
exports.updateStudentDetails = asyncHandler(async (req, res) => {
  const { termId, studentId } = req.params;
  const updateData = req.body; // This will contain the fields to be updated

  try {
    console.log("Term ID:", termId);
    console.log("Student ID:", studentId);

    // Find the term and populate its semesters with the studentsList
    const term = await Term.findById(termId).populate({
      path: "semesters",
      populate: {
        path: "studentsList",
        model: "Student",
      },
    });

    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }

    // Find the student across all semesters within the term
    let foundStudent = null;
    for (const semester of term.semesters) {
      const student = semester.studentsList.find(
        (student) => student._id.toString() === studentId
      );
      if (student) {
        foundStudent = student;
        break;
      }
    }

    if (!foundStudent) {
      return res
        .status(404)
        .json({ message: "Student not found in the specified term" });
    }

    // Update the student details
    Object.assign(foundStudent, updateData);
    await foundStudent.save();

    console.log("Updated Student:", foundStudent);

    res.status(200).json(foundStudent);
  } catch (error) {
    console.error("Error updating student details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
