const mongoose = require('mongoose');

const termSchema = new mongoose.Schema({
    termYear: { type: String },
    syllabusFile: { type: String },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    startDate: { type: Date },
    startTime: { type: String },
    endDate: { type: Date },
    endTime: { type: String },
    broadcastMessage: { type: String },
    EXCP_SL: [{type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    COMP_SL: [{type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    MECH_SL: [{type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    IT_SL: [{type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    ETRX_SL: [{type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    AIDS_SL: [{type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    RAI_SL: [{type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    CCE_SL: [{type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    VLSI_SL: [{type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    CSBS_SL: [{type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    EXTC_SL: [{type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    EXCP_students: { type: String },
    COMP_students: { type: String },
    MECH_students: { type: String },
    IT_students: { type: String },
    ETRX_students: { type: String },
    AIDS_students: { type: String },
    RAI_students: { type: String },
    CCE_students: { type: String },
    VLSI_students: { type: String },
    CSBS_students: { type: String },
    EXTC_students: { type: String },
});
  
const Term = mongoose.model('Term', termSchema);
module.exports = Term;
  