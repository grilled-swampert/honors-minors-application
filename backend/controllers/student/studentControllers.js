const Term = require("../../models/termModel/termModel");
const Student = require("../../models/studentModel/studentModel");
const Course = require("../../models/courseModel/courseModel");

const asyncHandler = require("express-async-handler");

// GET term details
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
      path: 'semesters',
      populate: {
        path: 'studentsList',
        model: 'Student',
      },
    });

    if (!term) {
      return res.status(404).json({ message: 'Term not found' });
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
      path: 'semesters',
      match: { _id: semesterId }, // Match the specific semester ID
      populate: {
        path: 'studentsList',
        model: 'Student',
      },
    });

    if (!term || term.semesters.length === 0) {
      return res.status(404).json({ message: 'Semester not found in the specified term' });
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
      console.log('Received studentId:', studentId);

      // Step 1: Find the student by ID
      const student = await Student.findById(studentId).populate('terms');

      // Debugging: Log the student found
      console.log('Found student:', student);

      if (!student) {
          console.log('Student not found');
          return res.status(404).json({ message: 'Student not found' });
      }

      // Step 2: Extract the term and branch
      const term = student.terms;  // Assuming 'terms' is an array or a single term object
      const branch = student.branch;

      // Debugging: Log the extracted term and branch
      console.log('Extracted term:', term);
      console.log('Extracted branch:', branch);

      // Step 3: Find the term using termId and populate the courses
      const termWithCourses = await Term.findById(term);

      // Debugging: Log the termWithCourses found
      console.log('Term with populated courses:', termWithCourses);

      if (!termWithCourses) {
          console.log('Term not found');
          return res.status(404).json({ message: 'Term not found' });
      }

      // Step 4: Retrieve each course document by ID and filter by branch
      const filteredCourses = [];
      for (const courseId of termWithCourses.courses) {
          const course = await Course.findById(courseId);  // Assuming `Course` is the model for courses
          console.log('Course:', course);

          if (course && course[branch] === "TRUE") {
              filteredCourses.push(course);
          }
      }

      // Debugging: Log the filtered courses
      console.log('Filtered courses:', filteredCourses);

      // Step 5: Return the filtered courses
      res.json({ courses: filteredCourses });
  } catch (error) {
      console.error('Error in getFilteredCoursesForStudent:', error);
      res.status(500).json({ message: 'Server error' });
  }
};

// GET term from student usinf student ID
exports.getTermFromStudent = asyncHandler(async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log('Student:', student);

    const termId = student.terms;
    console.log('Term ID:', termId);

    const term = await Term.findById(termId);

    if (!term) {
      return res.status(404).json({ message: 'Term not found' });
    }

    console.log('Term:', term);

    res.json(term);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

exports.getStudentDetails = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});