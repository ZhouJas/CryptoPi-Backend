const express = require('express')
const router = express.Router()
const admin = require('../auth/setup')
const User = require('../models/User')

router.post('/register', async (req, res) => {
    admin.auth().createUser({
        email: req.body.email,
        emailVerified: false,
        password: req.body.password,
        displayName: req.body.username,
        disabled: false
      })
        .then(function(userRecord) {
          // See the UserRecord reference doc for the contents of userRecord.
          const newUser = new User({uid: userRecord.uid, username: req.body.username, email: req.body.email, date: Date.now(), courses: []})
            newUser.save().then(function(user) {
                if (user == null) {console.log(err); return res.send(`Error creating new user $err`)}
                res.send('Created new user: ' + user.uid)
                console.log('worked')
            }).catch((err) => res.send('Error creating new user: ' + error))
        })
        .catch(function(error) {
          console.log(error)
          res.send('Error creating new user:' + error);
        });
})
  
// Who needs deleting anyways amirite?
// Feel free to do it here if you want but it's probably pointless

module.exports = router
