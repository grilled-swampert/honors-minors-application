// models/Course.js
const mongoose = require('mongoose');
const Term = require('../termModel/termModel'); // Assuming the Term model is in the same directory
const Student = require('../studentModel/studentModel'); // Assuming the Student model is in the same directory

const courseSchema = new mongoose.Schema({
   category: { type: String, enum: ['Minors', 'Honors'], required: true },
   offeringDepartment: { type: String, required: true },
   programCode: { type: String, required: true },
   programName: { type: String, required: true },
   programLink: { type: String, required: true },

   EXCP: { type: String, enum: ['TRUE', 'FALSE'], required: true },
   ETRX: { type: String, enum: ['TRUE', 'FALSE'], required: true },
   COMP: { type: String, enum: ['TRUE', 'FALSE'], required: true },
   IT: { type: String, enum: ['TRUE', 'FALSE'], required: true },
   AIDS: { type: String, enum: ['TRUE', 'FALSE'], required: true },
   MECH: { type: String, enum: ['TRUE', 'FALSE'], required: true },
   RAI: { type: String, enum: ['TRUE', 'FALSE'], required: true },
   CCE: { type: String, enum: ['TRUE', 'FALSE'], required: true },
   VDT: { type: String, enum: ['TRUE', 'FALSE'], required: true },
   CSBS: { type: String, enum: ['TRUE', 'FALSE'], required: true },

   // Preference counts
   firstPreference: { type: Number, default: 0 },
   secondPreference: { type: Number, default: 0 },
   thirdPreference: { type: Number, default: 0 },
   fourthPreference: { type: Number, default: 0 },
   fifthPreference: { type: Number, default: 0 },

   finalCount: { type: Number, default: 0 },
   maxCount: { type: Number, default: null }, // Optional, no default
   
   // Activation status fields
   status: { type: String, enum: ['active', 'inactive'], default: 'active' },
   temporaryStatus: { type: String, enum: ['active', 'inactive'], default: 'active' }, // To store temporary state

   // Whether deactivation is permanent
   permanent: { type: Boolean, default: false }, // If the course is permanently inactive

   // Store the previous preference counts when course is temporarily deactivated
   previousState: {
      firstPreference: { type: Number, default: 0 },
      secondPreference: { type: Number, default: 0 },
      thirdPreference: { type: Number, default: 0 },
      fourthPreference: { type: Number, default: 0 },
      fifthPreference: { type: Number, default: 0 },
   }
});

courseSchema.statics.countPreferencesForAllCourses = async function (termId) {
   console.log(`Start counting preferences for all courses in term: ${termId}`);

   // Fetch the term based on the termId
   const term = await Term.findById(termId);
   if (!term) {
      console.error(`Term not found for termId: ${termId}`);
      return;
   }
   console.log(`Term found: ${termId}`);

   // Extract all student lists that end with "_SL"
   const studentLists = [
      term.EXCP_SL || [],
      term.ETRX_SL || [],
      term.COMP_SL || [],
      term.IT_SL || [],
      term.AIDS_SL || [],
      term.MECH_SL || [],
      term.RAI_SL || [],
      term.CCE_SL || [],
      term.VDT_SL || [],
      term.CSBS_SL || []
   ];
   console.log(`Student lists extracted from term. Lists count: ${studentLists.length}`);

   // A map to hold course preference counts
   const courseCounts = {};

   // Loop through each student list
   for (const [listIndex, studentList] of studentLists.entries()) {
      console.log(`Processing student list #${listIndex + 1} with ${studentList.length} students`);

      for (const studentId of studentList) {
         console.log(`Fetching student document for studentId: ${studentId}`);
         
         // Fetch the student's document based on their ID
         const student = await Student.findById(studentId);
         if (!student) {
            console.warn(`Student not found for studentId: ${studentId}`);
            continue;
         }
         console.log(`Student found: ${studentId}`);

         // Loop through each course in the student's preferences
         student.courses.forEach((courseId, index) => {
            if (!courseCounts[courseId]) {
               // Initialize counts for the course if not already present
               courseCounts[courseId] = {
                  firstPreference: 0,
                  secondPreference: 0,
                  thirdPreference: 0,
                  fourthPreference: 0,
                  fifthPreference: 0,
               };
            }

            // Update the relevant preference count based on the index
            if (index === 0) {
               courseCounts[courseId].firstPreference++;
               console.log(`First preference matched for course: ${courseId}`);
            } else if (index === 1) {
               courseCounts[courseId].secondPreference++;
               console.log(`Second preference matched for course: ${courseId}`);
            } else if (index === 2) {
               courseCounts[courseId].thirdPreference++;
               console.log(`Third preference matched for course: ${courseId}`);
            } else if (index === 3) {
               courseCounts[courseId].fourthPreference++;
               console.log(`Fourth preference matched for course: ${courseId}`);
            } else if (index === 4) {
               courseCounts[courseId].fifthPreference++;
               console.log(`Fifth preference matched for course: ${courseId}`);
            }
         });
      }
   }

   console.log('Updating course documents with the new counts...');

   // Update each course document with the new counts
   for (const [courseId, counts] of Object.entries(courseCounts)) {
      await this.findByIdAndUpdate(courseId, {
         firstPreference: counts.firstPreference,
         secondPreference: counts.secondPreference,
         thirdPreference: counts.thirdPreference,
         fourthPreference: counts.fourthPreference,
         fifthPreference: counts.fifthPreference,
      });
      console.log(`Updated counts for courseId: ${courseId}`);
   }

   console.log('Update complete for all courses in the term.');
   
   // Return the course counts for reporting purposes
   return courseCounts;
};

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
