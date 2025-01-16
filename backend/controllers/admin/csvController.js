const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mkdrip = require('mkdirp');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

// Import models
const Course = require('../../models/courseModel/courseModel');
const Term = require('../../models/termModel/termModel');

mkdrip.sync('uploads/admin');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/admin');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + '-' + Date.now());
    }
});

const upload = multer({ storage: storage });

// Middleware to handle file uploads
exports.uploadFiles = upload.single('syllabusFile');

const sanitizeData = (data) => {
    const sanitizedData = {};
    
    for (let key in data) {
        // Remove quotes from the key
        const sanitizedKey = key.replace(/^[\'\"]+|[\'\"]+$/g, '').trim();
        
        // Remove surrounding quotes from the value, if any
        let value = data[key];
        if (typeof value === 'string') {
            value = value.replace(/^[\'\"]+|[\'\"]+$/g, '').trim();
        }
        
        // Assign sanitized key-value pair to the result object
        sanitizedData[sanitizedKey] = value;
    }
    
    return sanitizedData;
};



const importCourses = async (file, termId) => {
    const results = [];
    const filePath = file.path;

    try {
        await fs.promises.readFile(filePath, { encoding: 'utf8' });
    } catch (error) {
        throw new Error('File not found or inaccessible');
    }

    return new Promise((resolve, reject) => {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                return reject(new Error('File not found or inaccessible'));
            }
            fs.createReadStream(filePath)
                .on('error', (err) => reject(new Error('Error reading CSV file')))
                .pipe(csv())
                .on('data', (data) => results.push(sanitizeData(data))) // Sanitize each row
                .on('end', async () => {
                    try {
                        const courseIds = [];
                        for (const row of results) {
                            const newCourse = new Course({
                                category: row.category,
                                offeringDepartment: row.offeringDepartment,
                                programCode: row.programCode,
                                programName: row.programName,
                                programLink: row.programLink,
                                EXCP: row.EXCP,
                                ETRX: row.ETRX,
                                COMP: row.COMP,
                                IT: row.IT,
                                AIDS: row.AIDS,
                                MECH: row.MECH,
                                RAI: row.RAI,
                                CCE: row.CCE,
                                VLSI: row.VLSI,
                                CSBS: row.CSBS,
                                EXTC: row.EXTC,
                                term: termId,
                                status: 'active',
                            });

                            await newCourse.save();
                            courseIds.push(newCourse._id);
                        }

                        resolve(courseIds);
                    } catch (error) {
                        reject(error);
                    }
                });
        });
    });
};

exports.createSemesterAndProcessCSV = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    const { termId } = req.params; // Destructure termId from req.params
    const { startDate, endDate, startTime, endTime } = req.body;
    const file = req.file;

    try {
        let term = await Term.findById(termId);

        if (term) {
            Object.keys(req.body).forEach((key) => {
                term[key] = req.body[key];
            });

            if (req.file) {
                term.syllabusFile = req.file.path;
                const courseIds = await importCourses(req.file, termId);
                term.courses = courseIds;
            }

            const updatedTerm = await term.save();
            res.status(200).json(updatedTerm);
        } else {
            // Create a new term
            term = new Term({
                syllabusFile: req.file.path,
                startDate,
                endDate,
                startTime,
                endTime,
            });

            const savedTerm = await term.save();

            if (req.file) {
                const courseIds = await importCourses(req.file, termId);
                savedTerm.courses = courseIds;
                await savedTerm.save();
            }

            res.status(201).json(savedTerm);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
