const Term = require("../../models/termModel/termModel");
const Course = require("../../models/courseModel/courseModel");
const Student = require("../../models/studentModel/studentModel");
const BroadcastMessage = require("../../models/broadcastModel/broadcastMessageModel");
const { Parser } = require("json2csv");
const path = require("path");
const fs = require("fs");

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
    const { courseId, courseIds, status, temporaryStatus } = req.body;

    // Find the term by termId
    const term = await Term.findById(termId);
    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }

    console.log(`Course ID: ${courseId}`);
    console.log(`Course IDs: ${courseIds}`);
    console.log(`Status: ${status}`);
    console.log(`Temporary Status: ${temporaryStatus}`);
    console.log(`Term: ${termId}`);

    // Access all student lists ending with "_SL"
    const branchStudentLists = Object.keys(term.toObject()).filter((key) =>
      key.endsWith("_SL")
    );

    console.log(`Branch student lists: ${branchStudentLists.join(", ")}`);

    // Find the course by courseId
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
    }

    console.log(`Course found: ${courseId}`);

    // Permanent Deactivation
    if (status === "inactive") {
        console.log(`Deactivating course ${courseId}`);
        // Find the course by courseId
        const course = await Course.findById(courseId);

        console.log(`Making status inactive`);

        course.status = "inactive";

        // Decrease the final count for the deactivated course
        course.finalCount = course.finalCount ? course.finalCount - 1 : 0;

        console.log(`Final count updated`);

        await course.save();

        // Collect promises for branch-related updates
        const branchPromises = branchStudentLists.map(async (branch) => {
          const students = term[branch]; // Accessing each branch's student list

          // Find all students where finalCourse matches courseId
          const studentsToUpdate = await Student.find({
            _id: { $in: students },
            finalCourse: courseId,
          });

          // Collect student update promises
          const studentPromises = studentsToUpdate.map(async (student) => {
            // Find the next active course for this student
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

            // Save the updated student record without modifying original course preferences
            return student.save();
          });

          // Execute all student updates concurrently
          return Promise.all(studentPromises);
        });

        // Wait for all branch-related updates to complete
        await Promise.all(branchPromises);

      return res.status(200).json({
        message: "Courses permanently deactivated and final counts updated",
      });
    }

    // Temporary Deactivation
    if (temporaryStatus === "inactive") {
      course.temporaryStatus = "inactive";
      await course.save();

      // Loop through each branch's student list
      for (let branch of branchStudentLists) {
        const students = term[branch];

        // Find students who have this course in their courses array
        const studentsToUpdate = await Student.find({
          _id: { $in: students },
          courses: { $in: [courseId] },
        });

        for (let student of studentsToUpdate) {
          let foundCourse = false; // Flag to stop searching once the first match is found

          // Iterate over the student's courses array
          for (let index = 0; index < student.courses.length; index++) {
            const studentCourseId = student.courses[index].toString();

            if (studentCourseId === courseId) {
              // Backup the current course and remove it
              student.tempBackupCourses.push({
                courseId: courseId,
                preferenceIndex: index,
              });
              student.courses.splice(index, 1); // Remove the course at this index

              // Decrement the final count for the deactivated course
              course.finalCount--;
              await course.save();

              // Find the next active course (if exists)
              const nextActiveCourseId = student.courses[index]; // Check the course in the next position
              if (nextActiveCourseId) {
                const nextActiveCourse = await Course.findById(
                  nextActiveCourseId
                );
                if (nextActiveCourse) {
                  nextActiveCourse.finalCount++;
                  await nextActiveCourse.save();
                }
              }

              // Set flag to stop further searching in this student's courses array
              foundCourse = true;
              break; // Stop further processing for this student
            }
          }

          // Save student changes only if a course was found and updated
          if (foundCourse) {
            await student.save();
          }
        }
      }

      return res.status(200).json({
        message: "Course temporarily deactivated and students updated",
      });
    }

    // Temporary Activation
    if (temporaryStatus === "active") {
      course.temporaryStatus = "active";
      await course.save();

      // Loop through each branch's student list
      for (let branch of branchStudentLists) {
        const students = term[branch];

        // Find students who have backed-up data for this course
        const studentsToUpdate = await Student.find({
          _id: { $in: students },
          tempBackupCourses: { $elemMatch: { courseId: courseId } },
        });

        for (let student of studentsToUpdate) {
          // Find the backup entries for the reactivated course
          const backupEntries = student.tempBackupCourses.filter(
            (backup) => backup.courseId === courseId
          );

          // Restore the course to the correct positions in the courses array
          backupEntries.forEach((backup) => {
            // Remove course if it already exists (just in case)
            student.courses = student.courses.filter(
              (c) => c.toString() !== courseId
            );

            // Insert the course back into the correct position
            student.courses.splice(backup.preferenceIndex, 0, courseId);

            // Increment the final count for the restored course
            course.finalCount++;
          });

          // Clear the backup entries for this course
          student.tempBackupCourses = student.tempBackupCourses.filter(
            (backup) => backup.courseId !== courseId
          );

          // Adjust the final counts for other courses, if necessary
          // Check if there was a course that previously took the place of the reactivated course
          const nextActiveCourseId =
            student.courses[backupEntries[0].preferenceIndex + 1];
          if (nextActiveCourseId) {
            const nextActiveCourse = await Course.findById(nextActiveCourseId);
            if (nextActiveCourse) {
              // Decrement final count of the next course if it was promoted due to deactivation
              nextActiveCourse.finalCount--;
              await nextActiveCourse.save();
            }
          }

          // Save the updated student record
          await student.save();
        }
      }

      return res.status(200).json({
        message: "Course temporarily activated and student data reverted",
      });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
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
      currentCourse.status === "active"
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
    if (courseMax.firstPreference > maxCount)
      courseMax.firstPreference = maxCount;
    await courseMax.save();
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

      // Remove the course from their courses array
      student.courses = student.courses.filter(
        (course) => course.toString() !== courseId
      );
      console.log(
        `Step 9: Course removed from student ${student._id} courses array:`
      );

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
  const message = await BroadcastMessage.findById(id);
  if (!message) {
    return res.status(404).json({ message: "Broadcast message not found" });
  }
  message.isActive = !message.isActive;
  await message.save();
  res.status(200).json(message);
};
