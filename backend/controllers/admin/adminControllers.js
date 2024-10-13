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

// ----------------------------------------------------------------
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

    console.log(`Course found: ${courseId}, course finalCount: ${course.finalCount}`);

    // Deactivation (both permanent and temporary)
    if (status === "inactive" || temporaryStatus === "inactive") {
      console.log(`Deactivating course ${courseId}`);

      // Collect promises for branch-related updates
      const branchPromises = branchStudentLists.map(async (branch) => {
        const students = term[branch]; // Accessing each branch's student list
        console.log(`Processing students for branch: ${branch}, total students: ${students.length}`);

        // Find all students where finalCourse matches courseId
        const studentsToUpdate = await Student.find({
          _id: { $in: students },
          finalCourse: courseId,
        });
        console.log(`Students to update in branch ${branch}: ${studentsToUpdate.length}`);

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
            console.log(`Student ${student._id} has a finalCourse: ${finalCourseId}`);
            console.log(`Checking against courseId: ${courseId}`);
    
            const courseIndex = student.courses.findIndex((c) => c.toString() === courseId);
            const finalCourseIndex = student.courses.findIndex((c) => c.toString() === finalCourseId);
    
            console.log(`Course index in student courses: ${courseIndex}`);
            console.log(`Final course index in student courses: ${finalCourseIndex}`);
    
            if (courseIndex !== -1 && courseIndex < finalCourseIndex) {
              console.log(`Updating final course for student ${student._id}`);
    
              const finalCourse = await Course.findById(finalCourseId);
              if (finalCourse) {
                console.log(`Decreasing final count for previous course: ${finalCourseId}`);
                console.log(`Previous final count: ${finalCourse.finalCount}`);
                finalCourse.finalCount--;
                console.log(`New final count: ${finalCourse.finalCount}`);
                await finalCourse.save();
              } else {
                console.log(`No course found for finalCourseId: ${finalCourseId}`);
              }
              
              console.log(`Increasing final count for new course: ${courseId}`);
              console.log(`Previous final count: ${course.finalCount}`);
              course.finalCount++;
              console.log(`New final count: ${course.finalCount}`);
    
              student.finalCourse = [courseId];
              await student.save();
    
              console.log(`Final course updated for student ${student._id}: ${courseId}`);
            } else {
              console.log(`No updates made for student ${student._id}`);
            }
          } else {
            console.log(`No finalCourse for student ${student._id}`);
          }
        }
      }
    
      console.log("Setting course status to active");
      course.status = "active";
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

// Helper function to find the next active course
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

    // Find the course by courseId and mark it as inactive
    const courseMax = await Course.findById(courseId);
    if (!courseMax) {
      console.log(`Checkpoint 01: Course with ID ${courseId} not found`);
      return res.status(404).json({ message: "Course not found" });
    }
    console.log(`Checkpoint 01: Course found - ${courseId}`);

    // Marking course status as inactive
    // if (courseMax.finalCount > maxCount)
    //   courseMax.finalCount = maxCount;
    // await courseMax.save();
    console.log(`Checkpoint 02: Course preferences updated - ${courseId}`);

    // Extract student lists for branches ending with "_SL"
    console.log(
      'Step 3: Extracting student lists for branches ending with "_SL"'
    );
    const studentLists = Object.keys(term.toObject()).filter((key) =>
      key.endsWith("_SL")
    );
    console.log("Step 3: Student lists identified:", studentLists);

    let allStudents = [];

    // Retrieve all students from each branch's student list
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
    for (const student of allStudents) {
      student.submittedAt = new Date(); // Set to the current time
      await student.save();
      console.log(`Step 6: SubmittedAt saved for student ${student._id}`);
    }

    // Sort students by submittedAt in ascending order
    console.log("Step 7: Sorting students by submittedAt");
    allStudents.sort((a, b) => a.submittedAt - b.submittedAt);
    console.log("Step 7: Students sorted:", allStudents.length);

    // Get students up to maxCount and leave the rest
    const selectedStudents = allStudents.slice(maxCount);
    const excessStudents = allStudents.slice(0, maxCount);

    console.log(
      "Step 8: Selected students within maxCount:",
      selectedStudents.length
    );
    console.log(
      "Step 8: Excess students exceeding maxCount:",
      excessStudents.length
    );

    // Process excess students (remove course and update preferences)
    // Process excess students (remove course and update preferences)
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

      // Get the next active course
      const nextActiveCourse = await getNextActiveCourse(
        student.courses,
        courseId
      );
      student.finalCourse = nextActiveCourse ? nextActiveCourse._id : null;

      if (nextActiveCourse) {
        // Increment finalCount for the new finalCourse
        nextActiveCourse.finalCount++;
        await nextActiveCourse.save();
        console.log(
          `Step 10: Incremented finalCount for new finalCourse ${nextActiveCourse._id}`
        );
      } else {
        console.log(`No active course found for student ${student._id}`);
      }

      // Save the student updates
      await student.save();
      console.log(`Step 11: Student ${student._id} updated and saved`);
    }

    // Update the final count for the course to maxCount
    const course = await Course.findById(courseId);
    course.finalCount = maxCount;
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

// DOWNLOAD course allocation
exports.getStudentsAllocatedToCourse = async (req, res) => {
  try {
    const { termId } = req.params;
    const { courseId } = req.body;
    console.log(
      `Fetching students for termId: ${termId}, courseId: ${courseId}`
    );

    const term = await Term.findById(termId);
    if (!term) {
      console.log(`Term not found for termId: ${termId}`);
      return res.status(404).json({ message: "Term not found" });
    }
    console.log(`Term found: ${term._id}`);

    const studentLists = Object.keys(term.toObject()).filter((key) =>
      key.endsWith("_SL")
    );
    console.log(`Student lists found: ${studentLists.join(", ")}`);

    let allocatedStudents = [];

    for (const listKey of studentLists) {
      const studentIds = term[listKey];
      console.log(
        `Processing ${listKey}, found ${studentIds.length} student IDs`
      );

      const students = await Student.find({ _id: { $in: studentIds } });
      console.log(`Found ${students.length} students for ${listKey}`);

      const matchingStudents = students.filter(
        (student) =>
          student.finalCourse && student.finalCourse.toString() === courseId
      );
      console.log(
        `${matchingStudents.length} students match the course in ${listKey}`
      );

      allocatedStudents = allocatedStudents.concat(matchingStudents);
    }

    console.log(`Total allocated students: ${allocatedStudents.length}`);

    // 6. Prepare data for CSV
    const csvData = allocatedStudents.map((student) => ({
      branch: student.branch,
      rollNumber: student.rollNumber,
      name: student.name,
      email: student.email,
      contactNumber: student.contactNumber,
    }));

    // 7. Generate CSV
    const fields = ["branch", "rollNumber", "name", "email", "contactNumber"];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);

    // 8. Save CSV to file
    const fileName = `students_allocated_to_course_${courseId}.csv`;
    const filePath = path.join(__dirname, "..", "..", "downloads", fileName);

    fs.writeFile(filePath, csv, (err) => {
      if (err) {
        console.error("Error writing CSV file:", err);
        return res
          .status(500)
          .json({ message: "Error saving CSV file", error: err.message });
      }

      console.log(`CSV file saved successfully at ${filePath}`);

      // Send the file as a download
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send("Error downloading file");
        }
      });
    });
  } catch (error) {
    console.error("Error in getStudentsAllocatedToCourse:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllocationInfo = async (req, res) => {
  try {
    const { termId } = req.params;
    console.log(`Fetching allocation info for termId: ${termId}`);

    const term = await Term.findById(termId);
    if (!term) {
      console.log(`Term not found for termId: ${termId}`);
      return res.status(404).json({ message: "Term not found" });
    }

    const courses = await Course.find({ _id: { $in: term.courses } });

    // Prepare data for CSV
    const csvData = courses.map((course) => ({
      offeringDepartment: course.offeringDepartment,
      programName: course.programName,
      category: course.category, // This should be minors/honors
      finalCount: course.finalCount,
    }));

    // Generate CSV
    const fields = [
      "offeringDepartment",
      "programName",
      "category",
      "finalCount",
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);

    // Set headers for CSV download
    res.setHeader(
      "Content-disposition",
      `attachment; filename=allocation_info_${termId}.csv`
    );
    res.set("Content-Type", "text/csv");
    res.status(200).send(csv);
  } catch (error) {
    console.error("Error in getAllocationInfo:", error);
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