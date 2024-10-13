const express = require("express");
const { auth } = require("../../firebase");
const {
  getAllTerms,
  getTerm,
} = require("../../controllers/admin/adminControllers");
const {
  getAllStudentsInTerm,
  getDropStudents,
  updateDropApprovalStatus,
  deleteStudents,
} = require("../../controllers/faculty/facultyControllers");
const studentFileController = require("../../controllers/faculty/studentFileController");

const router = express.Router();

// GET all terms
router.get("/:branch", getAllTerms);

// GET one term
router.get("/:branch/:termId", getTerm);

// Add students to a semester
router.patch(
  "/:branch/:termId/edit/facAddStudent",
  studentFileController.uploadFiles,
  studentFileController.addStudents
);

// GET all students in a term
router.get("/:branch/:termId/facView", getAllStudentsInTerm);
router.delete("/:branch/:termId/facView", deleteStudents);

router.get("/:branch/:termId/edit/facDrop", getDropStudents);
router.put("/:branch/:termId/edit/facDrop", updateDropApprovalStatus);

router.post("/create-user", async (req, res) => {
  const { email, password, role, branch, studentId } = req.body;

  try {
    const userRecord = await auth.createUser({
      email: email,
      password: password,
    });

    // Add custom claims (like role) if needed
    await auth.setCustomUserClaims(userRecord.uid, { role, branch, studentId });

    return res
      .status(200)
      .json({ message: "User created successfully", uid: userRecord.uid });
  } catch (error) {
    console.error("Error creating Firebase user:", error);
    return res.status(500).json({ message: "Error creating user", error });
  }
});

module.exports = router;
