const admin = require('firebase-admin');
const serviceAccount = require('./config/honors-minors-application-7681836bed5c.json'); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = { admin };
