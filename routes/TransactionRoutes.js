const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Transaction = require('../models/Transaction')


// USE THE WEB3.JS library --> connect to ethereum
// Azure cognitive api

router.post('/createTransaction', function(req, res) { // http://localhost:8080/transaction/createTransaction
    const username = req.body.username; // Get user ID
    const password = req.body.password;
    const counterparty = req.body.counterparty;
    const amount = req.body.amount;
    const note = req.body.note;
    const facePicture = req.body.file;

    User.findOne({username: username}).then( (user) => {
        console.log(user) // Debug statement, remove this eventually
        if (user == null) res.status(404).send('Error fetching homepage details')
        if (password != user.password) {
            res.status(401).send('Unauthorized')
            return
        }
        var balance = user.balance // This should eventually get from ethereum


        if (amount <= balance) {
             // We can send money!
            // This is where you send through ethereum
            
            // Create the actual transaction object to log this
            var rng = Math.random
            var transaction = Transaction({uid:rng.toString(), incoming: false, counterparty: counterparty, date: Date.now, amount: amount})

            // TODO: add transaction to users transactions array and then save the user

            // Transaction.save(function(err) {
            //     if (err) {
            //         res.send('Error creating transaction')
            //         return
            //     }; 
            // })
        } else {
            res.send('Too little money')
        }
    })
    .catch((err) => {
        res.status(500).send('Error fetching details:' + err)
    })

})

// Dont use websockets

module.exports = router
