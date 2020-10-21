const express = require('express')
const router = express.Router()
const checkIfAuthenticated = require('../auth/utils')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const Web3 = require('web3');
const User = require('../models/User')

router.post('/register', function(req,res){
    const username = req.body.username; 
    const password = req.body.password;
    const photo = req.body.photo; // This should be passed to the azure api --> we can do this part later

    // ETH id should be the actual ethereum id
    var user = User({username: username, password: password, ethId: 'feifjeiofjewiof'})
    user.save(function (err) {
        if (err) {
            res.send('Error creating account')
            return
        };

        // This should now send to the azure api

        res.send('Created account!')
    });

}) 



router.get('/balance', function(req, res) {
    const username = req.body.username; // Get user ID
    const password = req.body.password;

    User.findOne({username: username}).then( (user) => {
        console.log(user) // Debug statement, remove this eventually
        if (user == null) res.status(404).send('Error fetching homepage details')
        if (password != user.password) {
            res.status(401).send('Unauthorized')
            return
        }
        var balance = user.balance
        res.json({
            balance: balance,
        });
    })
    .catch((err) => {
        res.status(500).send('Error fetching details:' + err)
    })
})

router.get('/transactions', function(req, res) {
    const recent = req.query.recent; // This tells you if you need to only send back recent ones (idk maybe like last 5, or maybe in last week)
    
    const username = req.body.username; // Get user ID
    const password = req.body.password;
    
    User.findOne({username: username}).populate('transactions').then( (user) => {
        console.log(user) // Debug statement, remove this eventually
        if (user == null) res.status(404).send('Error fetching homepage details')
        
        // This should eventually get from ethereum --> check for new transactions and import them
        let transactions = recent ? user.transactions.slice(0,8) : user.transactions 

        if (password != user.password) {
            res.status(401).send('Unauthorized')
            return
        }

        res.json({
            transactions: transactions
        });
    })
    .catch((err) => {
        res.status(500).send('Error fetching details:' + err)
    })
})


// This can be implemented later, should be an ez fix

// router.post('/updateNote/:transactionID', function(req, res) {
   
//     var transactionID = req.params.transactionID
//     var newNote = req.query.note

//     console.log('updating transaction ' + transactionID + ' with note: ' + newNote)
//     const uid = res.locals.uid; // Get user ID
//     User.findOne({uid: uid}).populate('transactions').then( (user) => {
//         if (user == null) res.status(404).send('Error fetching  details')
//         var foundTransaction;
//         console.log(user.transactions)
//         for (var i = 0; i < user.transactions.length; i++) {
//             var transactionIndex = i
//             if (user.transactions[transactionIndex].uid.localeCompare(course) == 0) {
//                 foundTransaction = courseIndex
//                 console.log('Found course!')
//             }
//         }

//         if (foundTransaction == null) {
//             if (user == null) res.status(404).send('Can\'t find transaction')
//         } else {
//             user.transactions[foundTransaction].note = newNote;
//             user.save().then((usr) => {
//                 res.send('Done!')
//             })
//             .catch((err) => {
//                 res.send('Error saving data' + err)
//             })
//         }
//     })
//     .catch((err) => {
//         res.status(500).send('Error fetching details:' + err)
//     })
// })

module.exports = router