const admin = require('firebase-admin');
const serviceAccount = require('./config/honors-minors-application-firebase-adminsdk-yi8in-4c11fb563a.json'); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
module.exports = { auth };
