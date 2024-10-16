const csv = require("csv-parser");
const fs = require("fs");
const multer = require("multer");
const mkdirp = require("mkdirp");
const mongoose = require("mongoose");
const axios = require("axios");
const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

// Import Student, and Term models
const Student = require("../../models/studentModel/studentModel");
const Term = require("../../models/termModel/termModel");

const backendUrl = "http://localhost:9000";

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Ensure the uploads directory exists
mkdirp.sync("uploads/faculty");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/faculty");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + "-" + Date.now());
  },
});

const upload = multer({ storage: storage });

// Middleware for file uploads
const allowedFields = [
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

// Middleware for file uploads
exports.uploadFiles = (req, res, next) => {
  upload.any()(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res
        .status(500)
        .json({ message: `Unknown upload error: ${err.message}` });
    }

    // Check if any file was uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Everything went fine, pass the first file to req.file for compatibility
    req.file = req.files[0];
    next();
  });
};

const importStudents = async (file, termId, branch) => {
  const results = [];
  const filePath = file.path;
  console.log("[DEBUG] Attempting to read file at:", filePath);

  try {
    await fs.promises.readFile(filePath, { encoding: "utf8" });
    console.log("[DEBUG] File successfully read.");
  } catch (error) {
    console.error("[ERROR] Error reading file:", error);
    throw new Error("File not found or inaccessible");
  }

  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error("[ERROR] File not found or inaccessible:", filePath);
        return reject(new Error("File not found or inaccessible"));
      }
      console.log("[DEBUG] File exists, proceeding with processing:", filePath);

      fs.createReadStream(filePath)
        .on("error", (err) => {
          console.error("[ERROR] Error reading CSV file:", err);
          return reject(new Error("Error reading CSV file"));
        })
        .pipe(csv())
        .on("data", (data) => {
          console.log("[DEBUG] Pushed row to results:", data);
          results.push(data);
        })
        .on("end", async () => {
          console.log("[DEBUG] Finished reading CSV, total rows:", results.length);

          try {
            const studentPromises = results.map(async (row, index) => {
              console.log(`[DEBUG] Processing row ${index + 1}:`, row);

              // Check if the student already exists by roll number or email
              const existingStudent = await Student.findOne({
                $or: [{ rollNumber: row.rollNumber }, { email: row.email }],
              });

              if (existingStudent) {
                console.log("[DEBUG] Student already exists:", existingStudent);
                return existingStudent._id;
              }

              // Create a new student if not already present
              console.log("[DEBUG] Creating new student with data:", row);
              const student = new Student({
                name: row.studentName,
                rollNumber: row.rollNumber,
                email: row.email,
                branch: row.branch,
                division: row.classDivision,
                contactNumber: row.contactNumber,
                courses: row.courses,
                finalCourses: row.finalCourse,
                coursesApprovalStatus: row.coursesApprovalStatus,
                enrollmentStatus: "enrolled",
                status: "not-submitted",
                terms: termId,
              });

              console.log("[DEBUG] Saving new student to database:", student);
              await student.save();

              function generateRandomPassword(length = 6) {
                const charset =
                  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
                let password = "";
                for (let i = 0, n = charset.length; i < length; i++) {
                  password += charset.charAt(Math.floor(Math.random() * n));
                }
                return password;
              }

              // Generate a random password
              const password = generateRandomPassword(); // Generates a random 6-character password
              console.log("[DEBUG] Generated password for student:", password);

              // Convert the ObjectId to a string
              const studentId = student._id.toString();
              console.log("[DEBUG] Extracted studentId:", studentId);

              const lowercaseBranch = row.branch.toLowerCase();

              console.log("[DEBUG] Sending student data to backend:", {
                email: row.email,
                password: password,
                role: "student",
                branch: lowercaseBranch,
                studentId: studentId,
              });

              try {
                const response = await axios.post(`${backendUrl}/faculty/create-user`, {
                  email: row.email,
                  password: password,
                  role: "student",
                  branch: lowercaseBranch,
                  studentId: studentId,
                });
                console.log("User created:", response.data);
              } catch (error) {
                console.error("Error creating user:", error.response ? error.response.data : error.message);
              }              

              const emailOptions = {
                from: process.env.EMAIL_USER,
                to: row.email,
                subject: "Welcome to Course Selection System",
                text: `Dear ${student.name},

We're pleased to inform you that you have been added to our Course Selection System.

Your login credentials are as follows:
Email: ${row.email}
Password: ${password}

Please log in and change your password upon your first login.

Best regards,
The Course Selection Team`,
              };

              console.log("[DEBUG] Sending welcome email to:", row.email);
              await transporter.sendMail(emailOptions);

              console.log("[DEBUG] Finished processing student:", student._id);
              return student._id;
            });

            console.log("[DEBUG] Awaiting all student promises.");
            const studentIds = await Promise.all(studentPromises);
            console.log("[DEBUG] All students processed successfully. Total students:", studentIds.length);
            resolve({ studentIds, filePath });
          } catch (error) {
            console.error("[ERROR] Error saving students:", error);
            reject(new Error(error));
          }
        });
    });
  });
};

exports.addStudents = asyncHandler(async (req, res) => {
  console.log("Uploaded file:", req.file);
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { branch, termId } = req.params;
  console.log("Term ID:", termId);
  console.log("Branch:", branch);

  const file = req.file;

  try {
    let term = await Term.findById(termId);

    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }

    console.log("Term:", term);

    const { studentIds, filePath } = await importStudents(file, termId, branch);

    // Initialize arrays for each branch if not already present
    if (!term.EXCP_SL && branch.toUpperCase() === "EXCP") {
      term.EXCP_SL = [];
    }
    if (!term.IT_SL && branch.toUpperCase() === "IT") {
      term.IT_SL = [];
    }
    if (!term.COMP_SL && branch.toUpperCase() === "COMP") {
      term.COMP_SL = [];
    }
    if (!term.CSBS_SL && branch.toUpperCase() === "CSBS") {
      term.CSBS_SL = [];
    }
    if (!term.MECH_SL && branch.toUpperCase() === "MECH") {
      term.MECH_SL = [];
    }
    if (!term.ETRX_SL && branch.toUpperCase() === "ETRX") {
      term.ETRX_SL = [];
    }
    if (!term.AIDS_SL && branch.toUpperCase() === "AIDS") {
      term.AIDS_SL = [];
    }
    if (!term.RAI_SL && branch.toUpperCase() === "RAI") {
      term.RAI_SL = [];
    }
    if (!term.CCE_SL && branch.toUpperCase() === "CCE") {
      term.CCE_SL = [];
    }
    if (!term.VDT_SL && branch.toUpperCase() === "VDT") {
      term.VDT_SL = [];
    }

    // Push student IDs and assign file paths for each branch
    if (branch.toUpperCase() === "EXCP") {
      term.EXCP_SL.push(...studentIds);
      term.EXCP_students = filePath;
    } else if (branch.toUpperCase() === "IT") {
      term.IT_SL.push(...studentIds);
      term.IT_students = filePath;
    } else if (branch.toUpperCase() === "COMP") {
      term.COMP_SL.push(...studentIds);
      term.COMP_students = filePath;
    } else if (branch.toUpperCase() === "CSBS") {
      term.CSBS_SL.push(...studentIds);
      term.CSBS_students = filePath;
    } else if (branch.toUpperCase() === "MECH") {
      term.MECH_SL.push(...studentIds);
      term.MECH_students = filePath;
    } else if (branch.toUpperCase() === "ETRX") {
      term.ETRX_SL.push(...studentIds);
      term.ETRX_students = filePath;
    } else if (branch.toUpperCase() === "AIDS") {
      term.AIDS_SL.push(...studentIds);
      term.AIDS_students = filePath;
    } else if (branch.toUpperCase() === "RAI") {
      term.RAI_SL.push(...studentIds);
      term.RAI_students = filePath;
    } else if (branch.toUpperCase() === "CCE") {
      term.CCE_SL.push(...studentIds);
      term.CCE_students = filePath;
    } else if (branch.toUpperCase() === "VDT") {
      term.VDT_SL.push(...studentIds);
      term.VDT_students = filePath;
    }

    console.log(`Updating term with new students for branch: ${branch}`);

    const updatedTerm = await term.save();

    console.log("Updated term:", updatedTerm);
    res.status(200).json(updatedTerm);
  } catch (error) {
    console.error("Error adding students:", error);
    res.status(500).json({ message: error.message });
  }
});
