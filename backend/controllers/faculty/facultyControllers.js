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

// GET all students across all branches within a term
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
        "EXCP_SL",
        "COMP_SL",
        "MECH_SL",
        "IT_SL",
        "ETRX_SL",
        "AIDS_SL",
        "RAI_SL",
        "CCE_SL",
        "VDT_SL",
        "CSBS_SL",
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

// GET all students in a branch who wanna drop
exports.getDropStudents = asyncHandler(async (req, res) => {
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
        "EXCP_SL",
        "COMP_SL",
        "MECH_SL",
        "IT_SL",
        "ETRX_SL",
        "AIDS_SL",
        "RAI_SL",
        "CCE_SL",
        "VDT_SL",
        "CSBS_SL",
      ];
      studentIds = branchKeys.reduce((allIds, key) => {
        return allIds.concat(term[key] || []);
      }, []);
    }

    // Fetch the students whose dropApproval is pending
    const students = await Student.find({
      _id: { $in: studentIds },
      dropApproval: "pending", // Filter for students with pending dropApproval
    });

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT to update dropApproval status for a single student
exports.updateDropApprovalStatus = asyncHandler(async (req, res) => {
  const { studentId, dropApproval } = req.body; // New dropApproval status from the request body

  try {
    console.log("Student ID:", studentId);
    console.log("New dropApproval status:", dropApproval);

    // Find the student by ID
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update the dropApproval status
    student.dropApproval = dropApproval;

    // Save the updated student
    await student.save();

    res
      .status(200)
      .json({ message: "Drop approval status updated successfully", student });
  } catch (error) {
    console.error("Error updating drop approval status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
