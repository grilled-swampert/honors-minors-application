const Term = require("../../models/termModel/termModel");
const Student = require("../../models/studentModel/studentModel");
const Course = require("../../models/courseModel/courseModel");
const BroadcastMessage = require("../../models/broadcastModel/broadcastMessageModel");
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
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
    console.log("Term ID:", termId);

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

    // Collect all students across all semesters in the term
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
    console.log("Term ID:", termId);
    console.log("Semester ID:", semesterId);

    // Find the term and the specific semester within it
    const term = await Term.findById(termId).populate({
      path: "semesters",
      match: { _id: semesterId }, // Match the specific semester ID
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

    // Return the students in the specified semester
    const students = term.semesters[0].studentsList;
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET Course details for a student in the specific branch
exports.getFilteredCoursesForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Debugging: Log the studentId received
    console.log("Received studentId:", studentId);

    // Step 1: Find the student by ID
    const student = await Student.findById(studentId).populate("terms");

    // Debugging: Log the student found
    console.log("Found student:", student);

    if (!student) {
      console.log("Student not found");
      return res.status(404).json({ message: "Student not found" });
    }

    // Step 2: Extract the term and branch
    const term = student.terms; // Assuming 'terms' is an array or a single term object
    const branch = student.branch;

    // Debugging: Log the extracted term and branch
    console.log("Extracted term:", term);
    console.log("Extracted branch:", branch);

    // Step 3: Find the term using termId and populate the courses
    const termWithCourses = await Term.findById(term);

    // Debugging: Log the termWithCourses found
    console.log("Term with populated courses:", termWithCourses);

    if (!termWithCourses) {
      console.log("Term not found");
      return res.status(404).json({ message: "Term not found" });
    }

    // Step 4: Retrieve each course document by ID and filter by branch
    const filteredCourses = [];
    for (const courseId of termWithCourses.courses) {
      const course = await Course.findById(courseId); // Assuming `Course` is the model for courses
      console.log("Course:", course);

      if (course && course[branch] === "YES") {
        filteredCourses.push(course);
      }
    }

    // Debugging: Log the filtered courses
    console.log("Filtered courses:", filteredCourses);

    // Step 5: Return the filtered courses
    res.json({ courses: filteredCourses });
  } catch (error) {
    console.error("Error in getFilteredCoursesForStudent:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTermFromStudent = asyncHandler(async (req, res) => {
  try {
    const studentId = req.params.studentId;
    
    // Find the student by ID
    const student = await Student.findById(studentId);
    console.log("Student:", student);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Retrieve the term ID from the student object
    const termId = student.terms;

    // Find the term by the term ID
    const term = await Term.findById(termId);
    console.log("Term:", term);

    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }

    // Retrieve finalCourse and courses from the student
    const finalCourseId = student.finalCourse;
    const courseIds = student.courses;

    console.log("Final Course ID:", finalCourseId);
    console.log("Course IDs:", courseIds);
    
    // Find final course
    const finalCourse = finalCourseId ? await Course.findById(finalCourseId) : null;
    
    // Find courses by their IDs
    const courses = await Course.find({ _id: { $in: courseIds } });
    
    // Sort courses according to the order in courseIds
    const sortedCourses = courseIds.map(courseId => courses.find(course => course._id.equals(courseId)));
    
    console.log("Final Course:", finalCourse);
    console.log("Courses:", sortedCourses);

    // Return student, term, finalCourse (if it exists), and courses (if they exist)
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
    const { courses } = req.body; // Array of {id, preference} objects

    // Ensure the courses are an array
    if (!Array.isArray(courses)) {
      return res.status(400).json({ message: "Courses must be an array" });
    }

    // Debugging: Print courses[0] after receiving from req.body
    console.log("Step 1 - Received courses[0]:", courses[0]);

    // Sort courses by preference
    courses.sort((a, b) => a.preference - b.preference);

    // Debugging: Print courses[0] after sorting
    console.log("Step 2 - Sorted courses[0]:", courses[0]);

    // Extract course IDs in order of preference
    const courseIds = courses.map(course => course.id);

    // Debugging: Print courses[0] after extracting course IDs
    console.log("Step 3 - Extracted course IDs for courses[0]:", courses[0]);

    // Validate the courses: Find them in the database and populate the relevant fields
    const validCourses = await Course.find({ _id: { $in: courseIds } });

    // Debugging: Print courses[0] after fetching valid courses from DB
    console.log("Step 4 - Validated courses[0]:", courses[0]);

    // Check if all courses are valid
    if (validCourses.length !== courseIds.length) {
      return res.status(404).json({ message: "One or more courses not found" });
    }

    // Create a map of course id to course object for easy lookup
    const courseMap = new Map(validCourses.map(course => [course._id.toString(), course]));

    // Debugging: Print courses[0] after creating courseMap
    console.log("Step 5 - Mapped course IDs for courses[0]:", courses[0]);

    // Update the student's course selection in the order of preference
    const student = await Student.findByIdAndUpdate(
      studentId,
      {
        courses: courseIds, // Store in order of preference
        submissionTime: Date.now(),
        status: "submitted",
      },
      { new: true }
    );

    // Debugging: Print courses[0] after updating student courses
    console.log("Step 6 - Updated student courses[0]:", courses[0]);

    // Set the first preference as the final course
    const firstPreference = courseMap.get(courseIds[0]);
    student.finalCourse = firstPreference._id;
    student.submissionTime = Date.now();
    await student.save();

    // Debugging: Print courses[0] after setting the final course
    console.log("Step 7 - Set final course for student from courses[0]:", courses[0]);

    // Prepare email content with courses in the correct order
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

    // Send confirmation email
    await transporter.sendMail(emailOptions);
    console.log("Step 8 - Confirmation email sent to:", student.email);

    // Update preference counts for each course
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

      // Debugging: Print courses[0] after updating course preferences
      console.log(`Step 9 - Updated preference count for course ${i + 1}, courses[0]:`, courses[0]);
    }

    // Update final count for first preference
    await Course.findByIdAndUpdate(
      firstPreference._id,
      { $inc: { finalCount: 1 } },
      { new: true }
    );

    // Debugging: Print courses[0] after updating final count
    console.log("Step 10 - Updated final count for first preference, courses[0]:", courses[0]);

    // Return response with updated student data
    return res.status(200).json({
      message: "Course preferences submitted and confirmation email sent",
      student
    });
  } catch (error) {
    console.error("Error submitting courses:", error);

    // Debugging: Print courses[0] in case of error
    console.log("Step 11 - Error occurred, courses[0]:", courses[0]);

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
    console.log('No student emails found for term:', termId);
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
    console.log('Broadcast email sent successfully');
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

    // Toggle the message status
    message.isActive = !message.isActive;
    await message.save();

    // If message is being activated, send email to all students
    if (message.isActive) {
      try {
        await sendBroadcastEmail(message.text, termId);
      } catch (emailError) {
        console.error('Error sending broadcast email:', emailError);
        // Continue with the response even if email fails
      }
    }

    res.status(200).json(message);
  } catch (error) {
    console.error('Error in toggleBroadcastMessage:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "uploads/student");

    // Check if the directory exists, if not create it
    if (!fs.existsSync(uploadDir)) {
      console.log("Directory doesn't exist, creating now...");
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    console.log("Setting upload destination:", uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    console.log("Generating unique filename:", uniqueName);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

exports.uploadDropFile = upload.single("dropFile");

// Controller function
exports.updateDropDetails = async (req, res) => {
  console.log("Received request to update drop details");

  const { studentId } = req.params;
  const { dropReason } = req.body;
  const file = req.file;
  console.log("Extracted parameters");
  console.log("Student ID:", studentId);
  console.log("Drop Reason:", dropReason);

  let dropFileUrl;

  // Check if file is uploaded
  console.log("Checking if file is uploaded...");
  if (req.file) {
    dropFileUrl = "/uploads/student/" + req.file.filename; // Store the relative path
    console.log("File uploaded:", dropFileUrl);
  } else {
    console.log("No file uploaded");
  }

  try {
    // Find student by ID
    console.log("Finding student by ID...");
    const student = await Student.findById(studentId);
    if (!student) {
      console.log("Student not found");
      return res.status(404).json({ error: "Student not found" });
    }
    console.log("Student found:", student);

    // Update student's drop reason and file URL
    console.log("Updating student's drop reason and file URL");
    student.dropReason = dropReason;
    if (dropFileUrl) {
      student.dropFile = dropFileUrl;
    }
    student.dropApproval = "pending";

    console.log("Saving updated student data...");
    await student.save();
    console.log("Student data updated successfully");

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