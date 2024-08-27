const mongoose = require('mongoose');

const termSchema = new mongoose.Schema({
    termYear: { type: String },
    syllabusFile: { type: String },
    studentsList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    students: { type: String },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    startDate: { type: Date },
    startTime: { type: String  },
    endDate: { type: Date },
    endTime: { type: String },
    broadcastMessage: { type: String },
});
  
const Term = mongoose.model('Term', termSchema);
module.exports = Term;
  