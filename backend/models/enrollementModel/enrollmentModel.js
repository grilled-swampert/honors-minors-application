const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }],
  status: { type: String, enum: ['pending', 'approved', 'disapproved', 'enrolled'], default: 'pending' }
});
  
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;
  