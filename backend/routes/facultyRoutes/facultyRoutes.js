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
  getDropApplicationPdf,
} = require("../../controllers/faculty/facultyControllers");
const studentFileController = require("../../controllers/faculty/studentFileController");
const { admin } = require("../../firebase");

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
router.patch("/:branch/:termId/edit/facDrop", updateDropApprovalStatus);
if (!admin.apps.length) {
  admin.initializeApp();
}

router.post("/create-user", async (req, res) => {
  const { email, password, role, branch, studentId } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, { role, branch, studentId });

    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: email,
      role: role,
      branch: branch,
      studentId: studentId
    });
    return res.status(200).json({ message: "User created successfully", uid: userRecord.uid });

  } catch (error) {
    console.error("[ERROR] Error creating Firebase user:", error);

    return res.status(500).json({ message: "Error creating user", error: error.message });
  }
});

router.get("/:branch/:termId/edit/facDrop/:studentId", getDropApplicationPdf);


module.exports = router;
