var admin = require("firebase-admin");
var serviceAccount = require('./crpytopi-firebase-adminsdk-bspjy-198e93dcb8.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
module.exports = admin