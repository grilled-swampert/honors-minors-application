const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { auth } = require("../../firebase");
const { ObjectId } = require('mongoose').Types;
const Term = require("../../models/termModel/termModel");
const Student = require("../../models/studentModel/studentModel");
const nodemailer = require("nodemailer");

const asyncHandler = require("express-async-handler");

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  // Configure your email service here
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
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
  const { studentId, isApproved, rejectionReason } = req.body;
  console.log('Received request:', { studentId, isApproved, rejectionReason });

  try {
    console.log('Searching for student with ID:', studentId);
    const student = await Student.findById(studentId);
    console.log('Found student:', student);

    if (!student) {
      console.log('Student not found');
      return res.status(404).json({ message: "Student not found" });
    }

    // Update student's course drop status
    student.dropApproval = isApproved ? 'approved' : 'rejected';
    console.log('Updating student drop approval status to:', student.dropApproval);
    await student.save();
    console.log('Updated student:', student);

    // Prepare email content
    const emailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: isApproved ? "Course Drop Request Approved" : "Course Drop Request Rejected",
      text: isApproved 
        ? "Your course drop request has been approved."
        : `Your course drop request has been rejected. Reason: ${rejectionReason}`
    };

    console.log('Email options:', emailOptions);

    // Send email using Nodemailer
    await transporter.sendMail(emailOptions);

    res.status(200).json({ 
      message: "Course drop request processed successfully and email sent",
      emailOptions: emailOptions
    });
  } catch (error) {
    console.error("Error processing course drop request:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Internal Server Error", details: error.message, stack: error.stack });
  }
});

exports.deleteStudents = async (req, res) => {
  try {
    console.log("Received request to delete student:", req.body);
    const { studentId, termId } = req.body;

    // Ensure the studentId is a valid ObjectId before proceeding
    if (!ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID format" });
    }

    console.log("Deleting student with ID:", studentId);

    // Convert the studentId to ObjectId
    const studentObjectId = new ObjectId(studentId);

    // Find the student by ObjectId
    const student = await Student.findById(studentObjectId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentTerm = student.terms;

    if (studentTerm) {
      const term = await Term.findById(studentTerm);

      if (!term) {
        return res.status(404).json({ message: `Term with ID ${termId} not found` });
      }

      const branch = student.branch;
      const branchListField = `${branch}_SL`;

      if (!term[branchListField]) {
        return res.status(404).json({ message: `Branch list ${branchListField} not found in term ${termId}` });
      }

      // Remove the student ID from the branch list
      term[branchListField] = term[branchListField].filter(id => id.toString() !== studentObjectId.toString());

      await term.save();
    }

    // Finally, delete the student
    await Student.findByIdAndDelete(studentObjectId);

    return res.status(200).json({ message: "Student successfully deleted" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return res.status(500).json({ message: "An error occurred while deleting the student" });
  }
};
