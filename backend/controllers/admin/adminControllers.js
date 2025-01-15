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

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function to get all student emails from a term
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

// Send broadcast email to all students
const sendBroadcastEmail = async (message, termId) => {
  const studentEmails = await getStudentEmailsFromTerm(termId);

  if (studentEmails.length === 0) {
    console.log("No student emails found for term:", termId);
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
    console.log("Broadcast email sent successfully");
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
  console.log(`Received ID: ${termId}`);
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
    const term = await Term.findById(termId);
    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }
    const courseIds = term.courses;
    await Course.deleteMany({ _id: { $in: courseIds } });

    const broadcastMessage = term.broadcastMessage;
    await BroadcastMessage.findByIdAndDelete(broadcastMessage);

    const studentLists = Object.keys(term.toObject()).filter((key) =>
      key.endsWith("_SL")
    );

    for (const list of studentLists) {
      const students = term[list];
      await Student.deleteMany({ _id: { $in: students } });
    }

    await term.remove();
    
    res.status(200).json({ message: "Term deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE a term
exports.updateTerm = async (req, res) => {
  const { termId } = req.params;
  console.log(termId);
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
    // Find the term by termId
    const term = await Term.findById(termId);

    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }

    // Extract course IDs from the term
    const courseIds = term.courses;

    // Find the courses using the extracted course IDs
    const courses = await Course.find({ _id: { $in: courseIds } });

    // Count preferences for all courses in the term
    const preferenceUpdateResult = await Course.countPreferencesForAllCourses(
      termId
    );
    console.log(
      `Preference counts updated for term ${termId}:`,
      preferenceUpdateResult
    );

    // Send the full course details after updating preferences
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

    console.log(`Course ID: ${courseId}`);
    console.log(`Status: ${status}`);
    console.log(`Temporary Status: ${temporaryStatus}`);
    console.log(`Term: ${termId}`);

    // Access all student lists ending with "_SL"
    const branchStudentLists = Object.keys(term.toObject()).filter((key) =>
      key.endsWith("_SL")
    );

    console.log(`Branch student lists: ${branchStudentLists.join(", ")}`);

    // Find the course by courseId (required for all operations)
    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    console.log(
      `Course found: ${courseId}, course finalCount: ${course.finalCount}`
    );

    // Deactivation (both permanent and temporary)
    if (status === "inactive" || temporaryStatus === "inactive") {
      console.log(`Deactivating course ${courseId}`);

      // Collect promises for branch-related updates
      const branchPromises = branchStudentLists.map(async (branch) => {
        const students = term[branch]; // Accessing each branch's student list
        console.log(
          `Processing students for branch: ${branch}, total students: ${students.length}`
        );

        // Find all students where finalCourse matches courseId
        const studentsToUpdate = await Student.find({
          _id: { $in: students },
          finalCourse: courseId,
        });
        console.log(
          `Students to update in branch ${branch}: ${studentsToUpdate.length}`
        );

        // Collect student update promises
        const studentPromises = studentsToUpdate.map(async (student) => {
          // Decrement the final count for the current course
          course.finalCount = course.finalCount ? course.finalCount - 1 : 0;

          const nextActiveCourse = await getNextActiveCourse(
            student.courses,
            courseId
          );
          console.log(
            `Next active course for student ${student._id}:`,
            nextActiveCourse
          );
          if (nextActiveCourse) {
            // Increment the final count for the next active course
            nextActiveCourse.finalCount = nextActiveCourse.finalCount
              ? nextActiveCourse.finalCount + 1
              : 1;
            await nextActiveCourse.save();
            console.log(
              `Final count updated for next active course ${nextActiveCourse._id}`
            );

            // Update the student's finalCourse to the next active course
            student.finalCourse = [nextActiveCourse._id];
          }

          console.log(`Final course updated for student ${student._id}`);

          // Save the updated student record
          return student.save();
        });

        // Execute all student updates concurrently
        return Promise.all(studentPromises);
      });

      // Wait for all branch-related updates to complete
      await Promise.all(branchPromises);

      // Only save the course after processing all students
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
      console.log("Course is being temporarily activated");

      for (let branch of branchStudentLists) {
        console.log(`Processing branch: ${branch}`);

        // Fetch students associated with the current branch
        const students = term[branch];
        if (!students || students.length === 0) {
          console.log(`No students found for branch: ${branch}`);
          continue;
        }
        console.log(`Total students for branch ${branch}: ${students.length}`);

        // Loop through each student using their student ID
        const studentsToUpdate = await Student.find({ _id: { $in: students } });
        if (!studentsToUpdate || studentsToUpdate.length === 0) {
          console.log(`No students found in database for branch: ${branch}`);
          continue;
        }

        for (let student of studentsToUpdate) {
          console.log(`Processing student with ID: ${student._id}`);

          // Ensure the finalCourse array exists and has at least one element
          if (student.finalCourse && student.finalCourse.length > 0) {
            const finalCourseId = student.finalCourse[0].toHexString();
            console.log(
              `Student ${student._id} has a finalCourse: ${finalCourseId}`
            );
            console.log(`Checking against courseId: ${courseId}`);

            const courseIndex = student.courses.findIndex(
              (c) => c.toString() === courseId
            );
            const finalCourseIndex = student.courses.findIndex(
              (c) => c.toString() === finalCourseId
            );

            console.log(`Course index in student courses: ${courseIndex}`);
            console.log(
              `Final course index in student courses: ${finalCourseIndex}`
            );

            if (courseIndex !== -1 && courseIndex < finalCourseIndex) {
              console.log(`Updating final course for student ${student._id}`);

              const finalCourse = await Course.findById(finalCourseId);
              if (finalCourse) {
                console.log(
                  `Decreasing final count for previous course: ${finalCourseId}`
                );
                console.log(`Previous final count: ${finalCourse.finalCount}`);
                finalCourse.finalCount--;
                console.log(`New final count: ${finalCourse.finalCount}`);
                await finalCourse.save();
              } else {
                console.log(
                  `No course found for finalCourseId: ${finalCourseId}`
                );
              }

              console.log(`Increasing final count for new course: ${courseId}`);
              console.log(`Previous final count: ${course.finalCount}`);
              course.finalCount++;
              console.log(`New final count: ${course.finalCount}`);

              student.finalCourse = [courseId];
              await student.save();

              console.log(
                `Final course updated for student ${student._id}: ${courseId}`
              );
            } else {
              console.log(`No updates made for student ${student._id}`);
            }
          } else {
            console.log(`No finalCourse for student ${student._id}`);
          }
        }
      }

      console.log("Setting course status to active");
      course.temporaryStatus = "active";
      await course.save();

      console.log("Course activated, final counts updated");
      return res.status(200).json({
        message:
          "Course temporarily activated, final counts updated, and student data updated",
      });
    } else {
      console.log("Temporary status is not 'active', skipping update");
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

    console.log(`Course ID: ${courseId}`);
    console.log(`Status: ${status}`);
    console.log(`Temporary Status: ${temporaryStatus}`);
    console.log(`Term: ${termId}`);

    // Access all student lists ending with "_SL"
    const branchStudentLists = Object.keys(term.toObject()).filter((key) =>
      key.endsWith("_SL")
    );

    console.log(`Branch student lists: ${branchStudentLists.join(", ")}`);

    // Find the course by courseId (required for all operations)
    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    console.log(
      `Course found: ${courseId}, course finalCount: ${course.finalCount}`
    );

    // Deactivation (both permanent and temporary)
    if (status === "inactive" || temporaryStatus === "inactive") {
      console.log(`Deactivating course ${courseId}`);

      // Collect promises for branch-related updates
      const branchPromises = branchStudentLists.map(async (branch) => {
        const students = term[branch]; // Accessing each branch's student list
        console.log(
          `Processing students for branch: ${branch}, total students: ${students.length}`
        );

        // Find all students where finalCourse matches courseId
        const studentsToUpdate = await Student.find({
          _id: { $in: students },
          finalCourse: courseId,
        });
        console.log(
          `Students to update in branch ${branch}: ${studentsToUpdate.length}`
        );

        // Collect student update promises
        const studentPromises = studentsToUpdate.map(async (student) => {
          // Decrement the final count for the current course
          course.finalCount = course.finalCount ? course.finalCount - 1 : 0;

          const nextActiveCourse = await getNextActiveCourse(
            student.courses,
            courseId
          );
          console.log(
            `Next active course for student ${student._id}:`,
            nextActiveCourse
          );
          if (nextActiveCourse) {
            // Increment the final count for the next active course
            nextActiveCourse.finalCount = nextActiveCourse.finalCount
              ? nextActiveCourse.finalCount + 1
              : 1;
            await nextActiveCourse.save();
            console.log(
              `Final count updated for next active course ${nextActiveCourse._id}`
            );

            // Update the student's finalCourse to the next active course
            student.finalCourse = [nextActiveCourse._id];
          }

          console.log(`Final course updated for student ${student._id}`);

          // Save the updated student record
          return student.save();
        });

        // Execute all student updates concurrently
        return Promise.all(studentPromises);
      });

      // Wait for all branch-related updates to complete
      await Promise.all(branchPromises);

      // Only save the course after processing all students
      course.status = status || course.status;
      course.temporaryStatus = temporaryStatus || course.temporaryStatus;
      course.permanent = true;
      await course.save();

      return res.status(200).json({
        message:
          "Course deactivated (permanent) and final counts updated",
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
    console.log("Step 1: Fetching term data using termId:", termId);

    // Get term data
    const term = await Term.findById(termId);
    if (!term) {
      console.error("Step 2: Term not found");
      return res.status(404).json({ error: "Term not found" });
    }

    console.log("Step 2: Term data fetched:", term);

    const courseMax = await Course.findById(courseId);
    if (!courseMax) {
      console.log(`Checkpoint 01: Course with ID ${courseId} not found`);
      return res.status(404).json({ message: "Course not found" });
    }
    console.log(`Checkpoint 01: Course found - ${courseId}`);

    // if (courseMax.finalCount > maxCount)
    //   courseMax.finalCount = maxCount;
    // await courseMax.save();
    // console.log(`Checkpoint 02: Course preferences updated - ${courseId}`);

    console.log(
      'Step 3: Extracting student lists for branches ending with "_SL"'
    );
    const studentLists = Object.keys(term.toObject()).filter((key) =>
      key.endsWith("_SL")
    );
    console.log("Step 3: Student lists identified:", studentLists);

    let allStudents = [];

    for (const list of studentLists) {
      console.log(`Step 4: Fetching students from branch: ${list}`);
      const studentsAll = term[list];
      const students = await Student.find({
        _id: { $in: studentsAll },
        finalCourse: courseId,
      });
      allStudents = allStudents.concat(students);
      console.log(`Step 4: Students fetched from branch: ${students.length}`);
    }

    console.log(
      "Step 5: All students with finalCourse as courseId fetched:",
      allStudents
    );

    // Save the submittedAt time for all relevant students
    // for (const student of allStudents) {
    //   student.submittedAt = new Date(); // Set to the current time
    //   await student.save();
    //   console.log(`Step 6: SubmittedAt saved for student ${student._id}`);
    // }

    // Sort students by submittedAt in ascending order
    console.log("Step 7: Sorting students by submittedAt");
    allStudents.sort((a, b) => a.submissionTime - b.submissionTime);
    console.log("Step 7: Students sorted:", allStudents.length);

    if (maxCount > 0) {
      selectedStudents = allStudents.slice(0, maxCount);
      excessStudents = allStudents.slice(maxCount);
    } else {
      excessStudents = allStudents;
    }

    for (const student of excessStudents) {
      console.log(`Step 9: Processing excess student ${student._id}`);

      // Decrement the finalCount for the current finalCourse
      const currentFinalCourse = await Course.findById(student.finalCourse);
      if (currentFinalCourse) {
        currentFinalCourse.finalCount = Math.max(
          0,
          currentFinalCourse.finalCount - 1
        );
        await currentFinalCourse.save();
        console.log(
          `Step 9: Decremented finalCount for current finalCourse ${currentFinalCourse._id}`
        );
      } else {
        console.log(`Current finalCourse not found for student ${student._id}`);
      }

      const nextActiveCourse = await getNextActiveCourse(
        student.courses,
        courseId
      );
      student.finalCourse = nextActiveCourse ? nextActiveCourse._id : null;

      if (nextActiveCourse) {
        nextActiveCourse.finalCount++;
        await nextActiveCourse.save();
        console.log(
          `Step 10: Incremented finalCount for new finalCourse ${nextActiveCourse._id}`
        );
      } else {
        console.log(`No active course found for student ${student._id}`);
      }

      await student.save();
      console.log(`Step 11: Student ${student._id} updated and saved`);
    }

    const course = await Course.findById(courseId);
    course.finalCount = maxCount;
    course.maxCount = maxCount;
    course.status = "inactive";
    course.temporaryStatus = "inactive";
    course.permanent = true;
    await course.save();
    console.log("Step 12: Updated finalCount for course:", courseId);

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
    console.log(
      `Fetching students for termId: ${termId}, courseId: ${courseId}`
    );

    // Fetch the term by ID
    console.log(`[1] Fetching term with ID: ${termId}`);
    const term = await Term.findById(termId);

    const course = await Course.findById(courseId);
    const programName = course.programName;

    if (!term) {
      console.log(`[2] Term not found for termId: ${termId}`);
      return res.status(404).json({ message: "Term not found" });
    }
    console.log(
      `[2] Term found: ${term._id}, Term Object: ${JSON.stringify(term)}`
    );

    // Get student lists ending with "_SL"
    console.log(`[3] Extracting student lists with '_SL' keys`);
    const studentLists = Object.keys(term.toObject()).filter((key) =>
      key.endsWith("_SL")
    );

    if (studentLists.length === 0) {
      console.log(`[3.1] No student lists found in term: ${termId}`);
    } else {
      console.log(`[3.1] Student lists found: ${studentLists.join(", ")}`);
    }

    let allocatedStudents = [];

    // Iterate through student lists
    for (const listKey of studentLists) {
      console.log(`[4] Processing student list: ${listKey}`);

      const studentIds = term[listKey];
      if (!studentIds || studentIds.length === 0) {
        console.log(`[4.1] No student IDs found in list: ${listKey}`);
        continue;
      }

      console.log(`[4.1] Found ${studentIds.length} student IDs in ${listKey}`);
      const students = await Student.find({ _id: { $in: studentIds } });

      if (students.length === 0) {
        console.log(`[4.2] No students found for IDs in ${listKey}`);
      } else {
        console.log(
          `[4.2] Found ${students.length} students for list ${listKey}`
        );
      }

      console.log("courseId", courseId);

      // Filter students matching the courseId
      const matchingStudents = students.filter(
        (student) =>
          student.finalCourse && student.finalCourse.toString() === courseId
      );
      console.log(
        `[5] ${matchingStudents.length} students match the course ID ${courseId} in ${listKey}`
      );

      allocatedStudents = allocatedStudents.concat(matchingStudents);
    }

    console.log(
      `[6] Total allocated students after all lists: ${allocatedStudents.length}`
    );

    // Prepare CSV data
    const csvData = allocatedStudents.map((student) => ({
      branch: student.branch,
      rollNumber: student.rollNumber,
      name: student.name,
      email: student.email,
      contactNumber: student.contactNumber,
    }));

    console.log(
      `[7] First few rows of CSV data (if any):`,
      JSON.stringify(csvData.slice(0, 3), null, 2)
    );

    if (csvData.length === 0) {
      console.log(`[7.1] No student data available to generate CSV.`);
      return res
        .status(404)
        .json({ message: "No students allocated to this course" });
    }

    // Generate CSV with json2csv
    console.log(`[8] Generating CSV`);
    const fields = ["branch", "rollNumber", "name", "email", "contactNumber"];
    const json2csvParser = new Parser({ fields, delimiter: ",", eol: "\r\n" });
    const csv = json2csvParser.parse(csvData);

    console.log(
      `[8.1] First few lines of generated CSV:`,
      csv.split("\n").slice(0, 4).join("\n")
    );

    const csvWithBOM = "\ufeff" + csv; // Add BOM for Excel compatibility
    const fileName = `students_allocated_to_course_${programName}.csv`;
    const filePath = path.join(__dirname, "..", "..", "downloads", fileName);

    // Write CSV to file using promises
    console.log(`[9] Writing CSV file to path: ${filePath}`);
    await fs.promises.writeFile(filePath, csvWithBOM);

    console.log(`[9.1] CSV file saved successfully at ${filePath}`);

    // Send the file as a download
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error(`[10] Error sending file:`, err);
        return res.status(500).send("Error downloading file");
      } else {
        console.log(`[10] File sent successfully for download.`);
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
    console.log(`[1] Fetching allocation info for termId: ${termId}`);

    // Fetch the term by ID
    console.log(`[2] Fetching term with ID: ${termId}`);
    const term = await Term.findById(termId);

    if (!term) {
      console.log(`[3] Term not found for termId: ${termId}`);
      return res.status(404).json({ message: "Term not found" });
    }
    console.log(
      `[3] Term found: ${term._id}, Courses in term: ${term.courses.join(", ")}`
    );

    // Fetch courses related to the term
    console.log(`[4] Fetching courses for termId: ${termId}`);
    const courses = await Course.find({ _id: { $in: term.courses } });

    if (courses.length === 0) {
      console.log(`[4.1] No courses found for termId: ${termId}`);
    } else {
      console.log(
        `[4.1] Found ${courses.length} courses for termId: ${termId}`
      );
    }

    // Prepare data for CSV
    console.log(`[5] Preparing data for CSV`);
    const csvData = courses.map((course) => ({
      offeringDepartment: course.offeringDepartment,
      programName: course.programName,
      category: course.category, // This should be minors/honors
      finalCount: course.finalCount,
    }));

    console.log(`[5.1] CSV Data Prepared:`, JSON.stringify(csvData, null, 2));

    const fields = [
      "offeringDepartment",
      "programName",
      "category",
      "finalCount",
    ];
    const json2csvParser = new Parser({ fields, header: true, delimiter: "," });
    console.log(`[6] Generating CSV from prepared data`);

    const csv = json2csvParser.parse(csvData);
    console.log(
      `[6.1] CSV generated successfully, first few lines:`,
      csv.split("\n").slice(0, 4).join("\n")
    );

    // Add BOM for UTF-8 encoding compatibility
    const csvWithBOM = "\ufeff" + csv;

    // Set headers for CSV download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=allocation_info_${termId}.csv`
    );
    res.setHeader("Content-Type", "text/csv");
    console.log(`[7] Sending CSV file for download`);

    // Send the CSV data
    res.status(200).send(csvWithBOM);
    console.log(`[7.1] CSV file sent successfully`);
  } catch (error) {
    console.error(`[8] Error in getAllocationInfo:`, error);
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

    // If the message is being activated, deactivate all other messages
    if (!message.isActive) {
      // Deactivate all other messages
      await BroadcastMessage.updateMany(
        { isActive: true },
        { isActive: false }
      );
    }

    // Toggle the message status
    message.isActive = !message.isActive;
    await message.save();

    // If message is being activated, send email to all students
    if (message.isActive) {
      try {
        await sendBroadcastEmail(message.text, termId);
      } catch (emailError) {
        console.error("Error sending broadcast email:", emailError);
        // Continue with the response even if email fails
      }
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in toggleBroadcastMessage:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
