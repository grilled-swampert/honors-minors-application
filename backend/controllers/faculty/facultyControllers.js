const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const { auth } = require("../../firebase");
const { ObjectId } = require("mongoose").Types;
const Term = require("../../models/termModel/termModel");
const Student = require("../../models/studentModel/studentModel");
const nodemailer = require("nodemailer");
const path = require("path");
const asyncHandler = require("express-async-handler");
const Course = require("../../models/courseModel/courseModel");

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  // Configure your email service here
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

exports.getDropApplicationPdf = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  try {
    const student = await Student.findById(studentId);

    if (!student || !student.dropFile) {
      return res
        .status(404)
        .json({ message: "Drop application file not found for the student" });
    }

    const projectRoot = path.resolve(__dirname, "../../../");
    const filePath = path.join(
      projectRoot,
      "backend/controllers/student/",
      student.dropFile
    );

    if (!fs.existsSync(filePath)) {
      console.error("File not found:", filePath);
      return res.status(404).json({ message: "Drop application file not found." });
    }
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error fetching drop application PDF:", error);
    res.status(500).json({ message: "Failed to fetch PDF file" });
  }
});

exports.getAllStudentsInTerm = asyncHandler(async (req, res) => {
  const { branch, termId } = req.params;

  try {
    const term = await Term.findById(termId);

    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }

    let studentIds;
    if (branch) {
      const branchKey = `${branch.toUpperCase()}_SL`;
      studentIds = term[branchKey] || [];
    } else {
      const branchKeys = [
        "EXCP_SL",
        "COMP_SL",
        "MECH_SL",
        "IT_SL",
        "ETRX_SL",
        "AIDS_SL",
        "RAI_SL",
        "CCE_SL",
        "VLSI_SL",
        "CSBS_SL",
        "EXTC_SL",
      ];
      studentIds = branchKeys.reduce((allIds, key) => {
        return allIds.concat(term[key] || []);
      }, []);
    }

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
        "VLSI_SL",
        "CSBS_SL",
        "EXTC_SL",
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

    for (let student of students) {
      const course = await Course.findById(student.finalCourse[0]);
      if (course) {
        student.finalCourseName = course.programName;
        student.save();
      }
    }

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT to update dropApproval status for a single student
exports.updateDropApprovalStatus = asyncHandler(async (req, res) => {
  const { studentId, isApproved, rejectionReason } = req.body;

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update student's course drop status
    student.dropApproval = isApproved ? "approved" : "rejected";
    await student.save();

    const emailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: isApproved
        ? "Course Drop Request Approved"
        : "Course Drop Request Rejected",
      text: isApproved
        ? "Your course drop request has been approved."
        : `Your course drop request has been rejected. Reason: ${rejectionReason}`,
    };
    await transporter.sendMail(emailOptions);

    res.status(200).json({
      message: "Course drop request processed successfully and email sent",
      emailOptions: emailOptions,
    });
  } catch (error) {
    console.error("Error processing course drop request:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
      stack: error.stack,
    });
  }
});

exports.deleteStudents = async (req, res) => {
  try {
    const { studentId, termId } = req.body;

    if (!ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID format" });
    }

    const studentObjectId = new ObjectId(studentId);
    const student = await Student.findById(studentObjectId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentTerm = student.terms;

    if (studentTerm) {
      const term = await Term.findById(studentTerm);

      if (!term) {
        return res
          .status(404)
          .json({ message: `Term with ID ${termId} not found` });
      }

      const branch = student.branch;
      const branchListField = `${branch}_SL`;

      if (!term[branchListField]) {
        return res.status(404).json({
          message: `Branch list ${branchListField} not found in term ${termId}`,
        });
      }

      // Remove the student ID from the branch list
      term[branchListField] = term[branchListField].filter(
        (id) => id.toString() !== studentObjectId.toString()
      );

      await term.save();
    }

    // Finally, delete the student
    await Student.findByIdAndDelete(studentObjectId);

    return res.status(200).json({ message: "Student successfully deleted" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting the student" });
  }
};
