const csv = require('csv-parser');
const fs = require('fs');
const multer = require('multer');
const mkdirp = require('mkdirp');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

// Import Student, and Term models
const Student = require('../../models/studentModel/studentModel');
const Term = require('../../models/termModel/termModel');

// Ensure the uploads directory exists
mkdirp.sync('uploads/faculty');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/faculty');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + '-' + Date.now());
    }
});

const upload = multer({ storage: storage });

// Middleware for file uploads
exports.uploadFiles = upload.single('studentsList');

const importStudents = async (file, termId) => {
    const results = [];
    const filePath = file.path;
    console.log('Attempting to read file at:', filePath);

    try {
        await fs.promises.readFile(filePath, { encoding: 'utf8' });
        console.log('File successfully read.');
    } catch (error) {
        console.error('Error reading file:', error);
        throw new Error('File not found or inaccessible');
    }

    return new Promise((resolve, reject) => {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error('File not found or inaccessible:', filePath);
                return reject(new Error('File not found or inaccessible'));
            }
            console.log('Processing file:', filePath);
            fs.createReadStream(filePath)
                .on('error', (err) => {
                    console.error('Error reading CSV file:', err);
                    return reject(new Error('Error reading CSV file'));
                })
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                    try {
                        const studentPromises = results.map(async (row) => {
                            // Check if the student already exists by roll number or email
                            const existingStudent = await Student.findOne({
                                $or: [
                                    { rollNumber: row.rollNumber },
                                    { email: row.emailId },
                                ],
                            });

                            if (existingStudent) {
                                console.log('Student already exists:', existingStudent);
                                return existingStudent._id;
                            }

                            // Create a new student if not already present
                            const student = new Student({
                                name: row.studentName,
                                rollNumber: row.rollNumber,
                                email: row.emailId,
                                branch: row.branch,
                                division: row.classDivision,
                                contactNumber: row.contactNumber,
                                eligibility: row.onlineEligible,
                                enrollmentStatus: "enrolled",
                                status: "not-submitted",
                            });
                            console.log('Creating new student:', student);
                            await student.save();
                            return student._id;
                        });

                        const studentIds = await Promise.all(studentPromises);
                        resolve(studentIds);
                    } catch (error) {
                        console.error('Error saving students:', error);
                        reject(new Error('Error saving students'));
                    }
                });
        });
    });
};

exports.addStudents = asyncHandler(async (req, res) => {
    console.log('Uploaded file:', req.file);
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const { termId } = req.params;
    console.log('Term ID:', termId);

    const file = req.file;

    try {
        let term = await Term.findById(termId);

        if (!term) {
            return res.status(404).json({ message: 'Term not found' });
        }

        console.log('Term:', term);

        const studentIds = await importStudents(file, termId);

        // Add students to the term
        term.studentsList.push(...studentIds);
        term.students = file.path;
        console.log('Updating term with new students');

        const updatedTerm = await term.save();

        console.log('Updated term:', updatedTerm);
        res.status(200).json(updatedTerm);
    } catch (error) {
        console.error('Error adding students:', error);
        res.status(500).json({ message: error.message });
    }
});
