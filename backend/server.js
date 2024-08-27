require('dotenv').config();
const cors = require('cors');

const express = require('express');
const mongoose = require('mongoose');
const adminRoutes = require('./routes/adminRoutes/adminRoutes');
const facultyRoutes = require('./routes/facultyRoutes/facultyRoutes');
const studentRoutes = require('./routes/studentRoutes/studentRoutes');
const bodyParser = require('body-parser');

// EXPRESS APP
const app = express();

// MIDDLEWARE
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// ROUTES
app.use('/admin', adminRoutes);
app.use('/faculty', facultyRoutes);
app.use('/student', studentRoutes);

// CONNECT TO MONGODB
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(process.env.PORT, () => {
            console.log('Server is running on port ' + process.env.PORT);
        });
    })
    .catch((err) => console.log(err));