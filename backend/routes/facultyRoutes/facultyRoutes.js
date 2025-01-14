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

// Make sure this initialization happens only once in your application
if (!admin.apps.length) {
  admin.initializeApp();
}

router.post("/create-user", async (req, res) => {
  const { email, password, role, branch, studentId } = req.body;
  console.log("[DEBUG] Received request to create user with data:", { email, password, role, branch, studentId });

  try {
    console.log("[DEBUG] Attempting to create Firebase user with email:", email);

    // Create Firebase user using Firebase Admin SDK
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });
    console.log("[DEBUG] Firebase user created successfully:", userRecord.uid);

    // Add custom claims (like role, branch, studentId)
    console.log("[DEBUG] Setting custom claims for user:", { role, branch, studentId });
    
    // Await to ensure the claims are set before continuing
    await admin.auth().setCustomUserClaims(userRecord.uid, { role, branch, studentId });
    console.log("[DEBUG] Custom claims set successfully for user:", userRecord.uid);

    // Add user details to Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: email,
      role: role,
      branch: branch,
      studentId: studentId
    });
    console.log("[DEBUG] User added to Firestore successfully");

    // Respond with success
    return res.status(200).json({ message: "User created successfully", uid: userRecord.uid });

  } catch (error) {
    console.error("[ERROR] Error creating Firebase user:", error);

    // Respond with error
    return res.status(500).json({ message: "Error creating user", error: error.message });
  }
});

// Add a route to fetch the drop application PDF for a specific student
router.get("/:branch/:termId/edit/facDrop/:studentId", getDropApplicationPdf);


module.exports = router;
