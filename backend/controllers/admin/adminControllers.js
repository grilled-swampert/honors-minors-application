const Term = require("../../models/termModel/termModel");
const Course = require("../../models/courseModel/courseModel");
const Student = require("../../models/studentModel/studentModel");
const BroadcastMessage = require("../../models/broadcastModel/broadcastMessageModel");
const { Parser } = require("json2csv");
const { ObjectId } = require("mongoose");
const path = require("path");
const fs = require("fs");
const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getStudentEmailsFromTerm = async (termId) => {
  const term = await Term.findById(termId);
  if (!term) return [];

  const studentLists = Object.keys(term.toObject()).filter((key) =>
    key.endsWith("_SL")
  );
  let studentEmails = [];

  for (const listKey of studentLists) {
    const studentIds = term[listKey];
    const students = await Student.find({ _id: { $in: studentIds } });
    studentEmails = studentEmails.concat(
      students.map((student) => student.email)
    );
  }

  return studentEmails;
};

const sendBroadcastEmail = async (message, termId) => {
  const studentEmails = await getStudentEmailsFromTerm(termId);

  if (studentEmails.length === 0) {
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    bcc: studentEmails, // Use BCC for privacy
    subject: "New Broadcast Message",
    html: `
      <h2>New Broadcast Message</h2>
      <p>${message}</p>
      <hr>
      <p>This is an automated message. Please do not reply.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending broadcast email:", error);
    throw error;
  }
};

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
    // Check if term exists
    const term = await Term.findById(termId);
    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }

    const courseIds = term.courses || [];
    if (courseIds.length > 0) {
      await Course.deleteMany({ _id: { $in: courseIds } });
    } 

    // Delete associated broadcast message
    const broadcastMessage = term.broadcastMessage;
    if (broadcastMessage) {
      await BroadcastMessage.findByIdAndDelete(broadcastMessage);
    } 
    // Delete associated student lists
    const studentLists = Object.keys(term.toObject()).filter((key) =>
      key.endsWith("_SL")
    );

    for (const list of studentLists) {
      const students = term[list] || [];
      if (students.length > 0) {
        await Student.deleteMany({ _id: { $in: students } });
      } else {
      }
    }

    await Term.findByIdAndDelete(termId);

    res.status(200).json({ message: "Term deleted successfully" });
  } catch (error) {
    console.error(`[ERROR] An error occurred: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// UPDATE a term
exports.updateTerm = async (req, res) => {
  const { termId } = req.params;
  try {
    const term = await Term.findByIdAndUpdate(termId, req.body, { new: true });
    if (!term) return res.status(404).json({ message: "Term not found" });
    res.status(200).json(term);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
    const term = await Term.findById(termId);

    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }

    const courseIds = term.courses;

    const courses = await Course.find({ _id: { $in: courseIds } });

    const preferenceUpdateResult = await Course.countPreferencesForAllCourses(
      termId
    );
    res.json(courses);
  } catch (error) {
    console.error(`Error fetching courses for term ${termId}:`, error);
    res.status(500).json({ message: error.message });
  }
});

exports.toggleCourseActivation = async (req, res) => {
  try {
    const { termId } = req.params;
    const { courseId, status, temporaryStatus } = req.body;

    // Find the term by termId
    const term = await Term.findById(termId);
    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }

    const branchStudentLists = Object.keys(term.toObject()).filter((key) =>
      key.endsWith("_SL")
    );

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (status === "inactive" || temporaryStatus === "inactive") {

      const branchPromises = branchStudentLists.map(async (branch) => {
        const students = term[branch]; 
        const studentsToUpdate = await Student.find({
          _id: { $in: students },
          finalCourse: courseId,
        });

        const studentPromises = studentsToUpdate.map(async (student) => {
          course.finalCount = course.finalCount ? course.finalCount - 1 : 0;

          const nextActiveCourse = await getNextActiveCourse(
            student.courses,
            courseId
          );

          if (nextActiveCourse) {
            nextActiveCourse.finalCount = nextActiveCourse.finalCount
              ? nextActiveCourse.finalCount + 1
              : 1;
            await nextActiveCourse.save();

            student.finalCourse = [nextActiveCourse._id];
          }
          return student.save();
        });

        return Promise.all(studentPromises);
      });

      await Promise.all(branchPromises);

      course.status = status || course.status;
      course.temporaryStatus = temporaryStatus || course.temporaryStatus;
      await course.save();

      return res.status(200).json({
        message:
          "Course deactivated (permanent or temporary) and final counts updated",
      });
    }

    // Temporary Activation
    if (temporaryStatus === "active") {

      for (let branch of branchStudentLists) {

        // Fetch students associated with the current branch
        const students = term[branch];
        if (!students || students.length === 0) {
          continue;
        }

        const studentsToUpdate = await Student.find({ _id: { $in: students } });
        if (!studentsToUpdate || studentsToUpdate.length === 0) {
          continue;
        }

        for (let student of studentsToUpdate) {

          if (student.finalCourse && student.finalCourse.length > 0) {
            const finalCourseId = student.finalCourse[0].toHexString();
            const courseIndex = student.courses.findIndex(
              (c) => c.toString() === courseId
            );
            const finalCourseIndex = student.courses.findIndex(
              (c) => c.toString() === finalCourseId
            );

            if (courseIndex !== -1 && courseIndex < finalCourseIndex) {

              const finalCourse = await Course.findById(finalCourseId);
              if (finalCourse) {
                finalCourse.finalCount--;
                await finalCourse.save();
              } 
              course.finalCount++;

              student.finalCourse = [courseId];
              await student.save();
            } 
          } 
        }
      }

      course.temporaryStatus = "active";
      await course.save();

      return res.status(200).json({
        message:
          "Course temporarily activated, final counts updated, and student data updated",
      });
    } 
  } catch (error) {
    console.error(`Error in toggleCourseActivation: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deactivateCourse = async (req, res) => {
  try {
    const { termId } = req.params;
    const { courseId, status, temporaryStatus } = req.body;

    // Find the term by termId
    const term = await Term.findById(termId);
    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }

    const branchStudentLists = Object.keys(term.toObject()).filter((key) =>
      key.endsWith("_SL")
    );

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (status === "inactive" || temporaryStatus === "inactive") {
      const branchPromises = branchStudentLists.map(async (branch) => {
        const students = term[branch]; 

        const studentsToUpdate = await Student.find({
          _id: { $in: students },
          finalCourse: courseId,
        });

        const studentPromises = studentsToUpdate.map(async (student) => {
          course.finalCount = course.finalCount ? course.finalCount - 1 : 0;

          const nextActiveCourse = await getNextActiveCourse(
            student.courses,
            courseId
          );

          if (nextActiveCourse) {
            nextActiveCourse.finalCount = nextActiveCourse.finalCount
              ? nextActiveCourse.finalCount + 1
              : 1;
            await nextActiveCourse.save();

            student.finalCourse = [nextActiveCourse._id];
          }
          return student.save();
        });

        return Promise.all(studentPromises);
      });

      await Promise.all(branchPromises);

      // Only save the course after processing all students
      course.status = status || course.status;
      course.temporaryStatus = temporaryStatus || course.temporaryStatus;
      course.permanent = true;
      await course.save();

      return res.status(200).json({
        message: "Course deactivated (permanent) and final counts updated",
      });
    }
  } catch (error) {
    console.error(`Error in toggleCourseActivation: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

async function getNextActiveCourse(courses, deactivatedCourseId) {
  for (let i = 0; i < courses.length; i++) {
    const currentCourse = await Course.findById(courses[i]);
    if (
      currentCourse &&
      currentCourse._id.toString() !== deactivatedCourseId &&
      currentCourse.status === "active" &&
      currentCourse.temporaryStatus === "active"
    ) {
      return currentCourse;
    }
  }
  return null;
}

exports.setMaxCount = async (req, res) => {
  const { termId } = req.params;
  const { courseId, maxCount } = req.body;

  try {
    const term = await Term.findById(termId);
    if (!term) {
      console.error("Term not found");
      return res.status(404).json({ error: "Term not found" });
    }

    const courseMax = await Course.findById(courseId);
    if (!courseMax) {
      return res.status(404).json({ message: "Course not found" });
    }

    // if (courseMax.finalCount > maxCount)
    //   courseMax.finalCount = maxCount;
    // await courseMax.save();

    const studentLists = Object.keys(term.toObject()).filter((key) =>
      key.endsWith("_SL")
    );

    let allStudents = [];

    for (const list of studentLists) {
      const studentsAll = term[list];
      const students = await Student.find({
        _id: { $in: studentsAll },
        finalCourse: courseId,
      });
      allStudents = allStudents.concat(students);
    }

    allStudents.sort((a, b) => a.submissionTime - b.submissionTime);
    if (maxCount > 0) {
      selectedStudents = allStudents.slice(0, maxCount);
      excessStudents = allStudents.slice(maxCount);
    } else {
      excessStudents = allStudents;
    }

    for (const student of excessStudents) {
      const currentFinalCourse = await Course.findById(student.finalCourse);
      if (currentFinalCourse) {
        currentFinalCourse.finalCount = Math.max(
          0,
          currentFinalCourse.finalCount - 1
        );
        await currentFinalCourse.save();
      } 

      const nextActiveCourse = await getNextActiveCourse(
        student.courses,
        courseId
      );
      student.finalCourse = nextActiveCourse ? nextActiveCourse._id : null;

      if (nextActiveCourse) {
        nextActiveCourse.finalCount++;
        await nextActiveCourse.save();
      }

      await student.save();
    }

    const course = await Course.findById(courseId);
    course.finalCount = maxCount;
    course.maxCount = maxCount;
    course.status = "inactive";
    course.temporaryStatus = "inactive";
    course.permanent = true;
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course preferences updated successfully",
    });
  } catch (error) {
    console.error("Error in updateCoursePreferences:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getStudentsAllocatedToCourse = async (req, res) => {
  try {
    const { termId, courseId } = req.params;
    const term = await Term.findById(termId);

    const course = await Course.findById(courseId);
    const programName = course.programName;

    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }

    const studentLists = Object.keys(term.toObject()).filter((key) =>
      key.endsWith("_SL")
    );

    let allocatedStudents = [];

    for (const listKey of studentLists) {
      const studentIds = term[listKey];
      if (!studentIds || studentIds.length === 0) {
        continue;
      }

      const students = await Student.find({ _id: { $in: studentIds } });

      const matchingStudents = students.filter(
        (student) =>
          student.finalCourse && student.finalCourse.toString() === courseId
      );
      allocatedStudents = allocatedStudents.concat(matchingStudents);
    }

    const csvData = allocatedStudents.map((student) => ({
      branch: student.branch,
      rollNumber: student.rollNumber,
      name: student.name,
      email: student.email,
      contactNumber: student.contactNumber,
    }));

    if (csvData.length === 0) {
      return res
        .status(404)
        .json({ message: "No students allocated to this course" });
    }

    const fields = ["branch", "rollNumber", "name", "email", "contactNumber"];
    const json2csvParser = new Parser({ fields, delimiter: ",", eol: "\r\n" });
    const csv = json2csvParser.parse(csvData);

    const csvWithBOM = "\ufeff" + csv; // Add BOM for Excel compatibility
    const fileName = `students_allocated_to_course_${programName}.csv`;
    const filePath = path.join(__dirname, "..", "..", "downloads", fileName);

    await fs.promises.writeFile(filePath, csvWithBOM);

    res.download(filePath, fileName, (err) => {
      if (err) {
        return res.status(500).send("Error downloading file");
      } 
    });
  } catch (error) {
    console.error(`[11] Error in getStudentsAllocatedToCourse:`, error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.getAllocationInfo = async (req, res) => {
  try {
    const { termId } = req.params;
    const term = await Term.findById(termId);

    const courses = await Course.find({ _id: { $in: term.courses } });

    const csvData = courses.map((course) => ({
      offeringDepartment: course.offeringDepartment,
      programName: course.programName,
      category: course.category, // This should be minors/honors
      finalCount: course.finalCount,
    }));

    const fields = [
      "offeringDepartment",
      "programName",
      "category",
      "finalCount",
    ];
    const json2csvParser = new Parser({ fields, header: true, delimiter: "," });
    const csv = json2csvParser.parse(csvData);
    const csvWithBOM = "\ufeff" + csv;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=allocation_info_${termId}.csv`
    );
    res.setHeader("Content-Type", "text/csv");
    res.status(200).send(csvWithBOM);
  } catch (error) {
    console.error(`Error in getAllocationInfo:`, error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createBroadcastMessage = async (req, res) => {
  const { text } = req.body;
  const message = new BroadcastMessage({ text });
  await message.save();
  res.status(201).json(message);
};

exports.getActiveBroadcastMessages = async (req, res) => {
  try {
    const messages = await BroadcastMessage.find().sort("-createdAt");
    res.json(messages);
  } catch (error) {
    console.error("Error fetching broadcast messages:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

exports.deleteBroadcastMessage = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "ID is required" });
  }

  try {
    await BroadcastMessage.findByIdAndDelete(id);
    res.status(200).json({ message: "Broadcast message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting message", error });
  }
};

exports.toggleBroadcastMessage = async (req, res) => {
  const { id } = req.body;
  const { termId } = req.params;

  try {
    const message = await BroadcastMessage.findById(id);
    if (!message) {
      return res.status(404).json({ message: "Broadcast message not found" });
    }

    if (!message.isActive) {
      await BroadcastMessage.updateMany(
        { isActive: true },
        { isActive: false }
      );
    }

    message.isActive = !message.isActive;
    await message.save();

    if (message.isActive) {
      try {
        await sendBroadcastEmail(message.text, termId);
      } catch (emailError) {
        console.error("Error sending broadcast email:", emailError);
      }
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in toggleBroadcastMessage:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
