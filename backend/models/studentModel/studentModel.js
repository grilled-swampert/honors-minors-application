const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  division: { type: String, required: true },
  contactNumber: { type: String, required: true },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  enrollmentStatus: {
    type: String,
    enum: ["enrolled", "not enrolled"],
    default: "not enrolled",
  },
  finalCourse: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  status: { type: String, default: "not-submitted" },
  terms: { type: String },
  submissionTime: { type: Date },
  dropReason: { type: String },
  dropFile: { type: String },
  dropApproval: {
    type: String,
    enum: ["pending", "approved", "rejected", "none"],
    default: "none",
  },
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
