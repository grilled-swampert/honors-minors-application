const Term = require("../../models/termModel/termModel");
const Student = require("../../models/studentModel/studentModel");
const Course = require("../../models/courseModel/courseModel");
const BroadcastMessage = require("../../models/broadcastModel/broadcastMessageModel");
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const { GridFsStorage } = require("multer-gridfs-storage");
const multer = require('multer');
const path = require('path');
const { ObjectId } = require("mongodb");
const asyncHandler = require("express-async-handler");
const fs = require('fs');

// GET term details
exports.getAllTerms = asyncHandler(async (req, res) => {
  try {
    const terms = await Term.find();
    res.json(terms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// GET a single term
exports.getTerm = asyncHandler(async (req, res) => {
  const { termId } = req.params;
  try {
    const term = await Term.findById(termId);
    if (!term) return res.status(404).json({ message: "Term not found" });
    res.status(200).json(term);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all students across all semesters within a term
exports.getAllStudentsInTerm = asyncHandler(async (req, res) => {
  const { termId } = req.params;

  try {
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

    const allStudents = term.semesters.reduce((students, semester) => {
      return students.concat(semester.studentsList);
    }, []);

    res.status(200).json(allStudents);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET students from a specific semester within a term
exports.getStudentsInSemester = asyncHandler(async (req, res) => {
  const { termId, semesterId } = req.params;

  try {
    const term = await Term.findById(termId).populate({
      path: "semesters",
      match: { _id: semesterId }, 
      populate: {
        path: "studentsList",
        model: "Student",
      },
    });

    if (!term || term.semesters.length === 0) {
      return res
        .status(404)
        .json({ message: "Semester not found in the specified term" });
    }

    const students = term.semesters[0].studentsList;
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.getFilteredCoursesForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).populate("terms");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const term = student.terms; 
    const branch = student.branch;

    const termWithCourses = await Term.findById(term);

    if (!termWithCourses) {
      return res.status(404).json({ message: "Term not found" });
    }

    const filteredCourses = [];
    for (const courseId of termWithCourses.courses) {
      const course = await Course.findById(courseId); 

      if (course && course[branch] === "YES") {
        filteredCourses.push(course);
      }
    }
    res.json({ courses: filteredCourses });
  } catch (error) {
    console.error("Error in getFilteredCoursesForStudent:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTermFromStudent = asyncHandler(async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const termId = student.terms;
    const term = await Term.findById(termId);

    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }

    const finalCourseId = student.finalCourse;
    const courseIds = student.courses;
    const finalCourse = finalCourseId ? await Course.findById(finalCourseId) : null;
    
    const courses = await Course.find({ _id: { $in: courseIds } });
    
    const sortedCourses = courseIds.map(courseId => courses.find(course => course._id.equals(courseId)));

    res.json({
      term,
      student,
      finalCourse: finalCourse || null,
      courses: courses.length > 0 ? courses : []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

exports.getStudentDetails = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH: Update all preference counts for a specific student
exports.submitCourses = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const { courses } = req.body; 

    if (!Array.isArray(courses)) {
      return res.status(400).json({ message: "Courses must be an array" });
    }

    courses.sort((a, b) => a.preference - b.preference);

    const courseIds = courses.map(course => course.id);
    const validCourses = await Course.find({ _id: { $in: courseIds } });

    if (validCourses.length !== courseIds.length) {
      return res.status(404).json({ message: "One or more courses not found" });
    }

    const courseMap = new Map(validCourses.map(course => [course._id.toString(), course]));

    const student = await Student.findByIdAndUpdate(
      studentId,
      {
        courses: courseIds, // Store in order of preference
        submissionTime: Date.now(),
        status: "submitted",
      },
      { new: true }
    );

    const firstPreference = courseMap.get(courseIds[0]);
    student.finalCourse = firstPreference._id;
    student.submissionTime = Date.now();
    await student.save();

    const courseList = courseIds.map((id, index) => {
      const course = courseMap.get(id);
      return `${index + 1}. ${course.programName} (${course.programCode})`;
    }).join('\n');

    const emailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: "Course Selection Submission Confirmation",
      text: `Dear ${student.name},

Your course preferences have been successfully submitted. Here are your selected courses in order of preference:

${courseList}

Your first preference has been automatically set as your final course. Please note that this selection is subject to approval and availability.

If you need to make any changes or have questions, please contact your faculty advisor.

Best regards,
Course Registration Team`,
    };

    await transporter.sendMail(emailOptions);

    const preferenceKeys = [
      "firstPreference",
      "secondPreference",
      "thirdPreference",
      "fourthPreference",
      "fifthPreference",
      "sixthPreference",
    ];

    for (let i = 0; i < courseIds.length; i++) {
      const courseId = courseIds[i];
      const preferenceKey = preferenceKeys[i];

      if (preferenceKey) {
        await Course.findByIdAndUpdate(
          courseId,
          { $inc: { [preferenceKey]: 1 } },
          { new: true }
        );
      }
    }

    await Course.findByIdAndUpdate(
      firstPreference._id,
      { $inc: { finalCount: 1 } },
      { new: true }
    );

    return res.status(200).json({
      message: "Course preferences submitted and confirmation email sent",
      student
    });
  } catch (error) {
    console.error("Error submitting courses:", error);
    res.status(500).json({ message: error.message });
  }
};


// Helper function to get all student emails from a term
const getStudentEmailsFromTerm = async (termId) => {
  const term = await Term.findById(termId);
  if (!term) return [];

  const studentLists = Object.keys(term.toObject()).filter(key => key.endsWith('_SL'));
  let studentEmails = [];

  for (const listKey of studentLists) {
    const studentIds = term[listKey];
    const students = await Student.find({ _id: { $in: studentIds } });
    studentEmails = studentEmails.concat(students.map(student => student.email));
  }

  return studentEmails;
};

// Send broadcast email to all students
const sendBroadcastEmail = async (message, termId) => {
  const studentEmails = await getStudentEmailsFromTerm(termId);
  
  if (studentEmails.length === 0) {
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    bcc: studentEmails, // Use BCC for privacy
    subject: 'New Broadcast Message',
    html: `
      <h2>New Broadcast Message</h2>
      <p>${message}</p>
      <hr>
      <p>This is an automated message. Please do not reply.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending broadcast email:', error);
    throw error;
  }
};

// Updated toggleBroadcastMessage controller
exports.toggleBroadcastMessage = async (req, res) => {
  const { id } = req.body;
  const { termId } = req.params;

  try {
    const message = await BroadcastMessage.findById(id);
    if (!message) {
      return res.status(404).json({ message: "Broadcast message not found" });
    }

    message.isActive = !message.isActive;
    await message.save();

    if (message.isActive) {
      try {
        await sendBroadcastEmail(message.text, termId);
      } catch (emailError) {
        console.error('Error sending broadcast email:', emailError);
      }
    }

    res.status(200).json(message);
  } catch (error) {
    console.error('Error in toggleBroadcastMessage:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateStudentDetails = asyncHandler(async (req, res) => {
  const { termId, studentId } = req.params;
  const updateData = req.body; // This will contain the fields to be updated

  try {
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
    res.status(200).json(foundStudent);
  } catch (error) {
    console.error("Error updating student details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "uploads/student");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

exports.uploadDropFile = upload.single("dropFile");

// Controller function
exports.updateDropDetails = async (req, res) => {
  const { studentId } = req.params;
  const { dropReason } = req.body;
  const file = req.file;

  let dropFileUrl;

  if (req.file) {
    dropFileUrl = "/uploads/student/" + req.file.filename; // Store the relative path
  }

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    student.dropReason = dropReason;
    if (dropFileUrl) {
      student.dropFile = dropFileUrl;
    }
    student.dropApproval = "pending";
    await student.save();
    res
      .status(200)
      .json({ message: "Student drop details updated successfully", student });
  } catch (error) {
    console.error("Error updating student drop details:", error);
    res.status(500).json({ error: error.message });
  }
};


exports.getActiveBroadcastMessages = async (req, res) => {
  try {
    const messages = await BroadcastMessage.find({ isActive: true })
      .sort("-createdAt");
    res.json(messages);
  } catch (error) {
    console.error("Error fetching broadcast messages:", error);
    res.status(500).json({ error: "Server error. Please try again later."});
  }
};