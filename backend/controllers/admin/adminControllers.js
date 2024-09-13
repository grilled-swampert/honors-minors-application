const Term = require("../../models/termModel/termModel");
const Course = require("../../models/courseModel/courseModel");
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
  const { termId } = req.params;
  console.log(`Received ID: ${termId}`); // Logging the ID for debugging

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
exports.updateTerm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const term = await Term.findByIdAndUpdate(id, req.body, { new: true });
    if (!term) return res.status(404).json({ message: "Term not found" });
    res.status(200).json(term);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

    // Send the full course details
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ----------------------------------------------------------------
// deactivating a course and its repurcussions
exports.deactivateCourse = async (req, res) => {
  try {
    const { termId } = req.params;
    const { courseId } = req.body;

    console.log(
      `Checkpoint 1: Received termId = ${termId} and courseId = ${courseId}`
    );

    // 1. Find the term by termId
    const term = await Term.findById(termId);
    if (!term) {
      console.log(`Checkpoint 2: Term with ID ${termId} not found`);
      return res.status(404).json({ message: "Term not found" });
    }
    console.log(`Checkpoint 2: Term found - ${termId}`);
    console.log(term)

    // 2. Access all student lists ending with "_SL"
    const branchStudentLists = Object.keys(term.toObject()).filter((key) =>
      key.endsWith("_SL")
    );
    console.log(
      `Checkpoint 3: Found branch student lists - ${branchStudentLists}`
    );

    // 3. Find the course by courseId and mark it as inactive
    const course = await Course.findById(courseId);
    if (!course) {
      console.log(`Checkpoint 4: Course with ID ${courseId} not found`);
      return res.status(404).json({ message: "Course not found" });
    }
    console.log(`Checkpoint 4: Course found - ${courseId}`);

    // Marking course status as inactive
    course.firstPreference = 404;
    course.secondPreference = 404;
    course.thirdPreference = 404;
    course.fourthPreference = 404;
    course.fifthPreference = 404;
    course.status = "inactive";
    await course.save();
    console.log(
      `Checkpoint 5: Course status updated to inactive - ${courseId}`
    );

    // 4. Loop through each branch's student list
    for (let branch of branchStudentLists) {
      console.log(branch)
      const students = term[branch]; // Accessing each branch's student list
      console.log(students)
      console.log(
        `Checkpoint 6: Processing branch ${branch} with student IDs: ${students}`
      );

      // 5. Find all students where `finalCourse` matches `courseId`
      const studentsToUpdate = await Student.find({
        _id: { $in: students },
        finalCourse: courseId,
      });
      console.log(
        `Checkpoint 7: Found students to update for course ${courseId} in branch ${branch} - ${studentsToUpdate.map(
          (s) => s._id
        )}`
      );

      // 6. For each student, remove `courseId` from `courses` array and update `finalCourse`
      for (let student of studentsToUpdate) {
        console.log(`Checkpoint 8: Updating student ${student._id}`);

        // Remove `courseId` from the student's courses array
        student.courses = student.courses.filter(
          (course) => course.toString() !== courseId
        );
        console.log(
          `Checkpoint 9: Removed course ${courseId} from student ${student._id}'s courses`
        );

        // Update `finalCourse` to the first course in the array (if any)
        student.finalCourse =
          student.courses.length > 0 ? student.courses[0] : null;
        console.log(
          `Checkpoint 10: Updated finalCourse for student ${student._id} to ${student.finalCourse}`
        );

        // Loop through student's courses and adjust preference counts
        for (let i = 0; i <= student.courses.length; i++) {
          const course = await Course.findById(student.courses[i]);

          if (!course) {
            console.log(
              `Checkpoint 11: Course with ID ${student.courses[i]} not found for preference update`
            );
            continue;
          }

          if (i === 0) {
            // First course in the array: Increment firstPreference, decrement secondPreference
            course.firstPreference++;
            course.secondPreference--;
            course.finalCount++;
            console.log(
              `Checkpoint 12: Updated preferences for first course in student ${student._id}'s list - ${course._id}`
            );
          } else if (i === 1) {
            // Second course in the array: Increment secondPreference, decrement thirdPreference
            course.secondPreference++;
            course.thirdPreference--;
            console.log(
              `Checkpoint 13: Updated preferences for second course in student ${student._id}'s list - ${course._id}`
            );
          } else if (i === 2) {
            // Third course in the array: Increment thirdPreference, decrement fourthPreference
            course.thirdPreference++;
            course.fourthPreference--;
            console.log(
              `Checkpoint 14: Updated preferences for third course in student ${student._id}'s list - ${course._id}`
            );
          } else if (i === 3) {
            // Fourth course in the array: Increment fourthPreference, decrement fifthPreference
            course.fourthPreference++;
            course.fifthPreference--;
            console.log(
              `Checkpoint 15: Updated preferences for fourth course in student ${student._id}'s list - ${course._id}`
            );
          }

          // Save the updated course preferences
          await course.save();
        }

        await student.save();
        console.log(`Checkpoint 16: Student ${student._id} saved successfully`);
      }
    }

    console.log("Checkpoint 17: All students and courses updated successfully");
    res
      .status(200)
      .json({ message: "Course and students updated successfully" });
  } catch (error) {
    console.error(`Checkpoint Error: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};