const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
   category: { type: String, enum: ['Minors', 'Honors'], required: true },
   offeringDepartment: { type: String, required: true },
   programCode: { type: String, required: true },
   programName: { type: String, required: true },
   programLink: { type: String, required: true },
   EXCP: { type: String, enum:['TRUE', 'FALSE'], required: true },
   ETRX: { type: String, enum:['TRUE', 'FALSE'], required: true },
   COMP: { type: String, enum:['TRUE', 'FALSE'], required: true },
   IT: { type: String, enum:['TRUE', 'FALSE'], required: true },
   AIDS: { type: String, enum:['TRUE', 'FALSE'], required: true },
   MECH: { type: String, enum:['TRUE', 'FALSE'], required: true },
   RAI: { type: String, enum:['TRUE', 'FALSE'], required: true },
   CCE: { type: String, enum:['TRUE', 'FALSE'], required: true },
   VDT: { type: String, enum:['TRUE', 'FALSE'], required: true },
   CSBS: { type: String, enum:['TRUE', 'FALSE'], required: true },
   firstPreference: { type: Number, default: 0 },
   secondPreference: { type: Number, default: 0 },
   thirdPreference: { type: Number, default: 0 },
   fourthPreference: { type: Number, default: 0 },
   fifthPreference: { type: Number, default: 0 },
   finalCount: { type: Number, default: 0 },
   maxCount: { type: Number },
   status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;