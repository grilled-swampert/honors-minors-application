const admin = require('firebase-admin');
const serviceAccount = require('./config/honors-minors-application-firebase-adminsdk-yi8in-d6e530c14a.json'); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = { admin };
