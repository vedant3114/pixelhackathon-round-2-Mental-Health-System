const admin = require('firebase-admin');
const serviceAccount = require('/etc/secrets/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
