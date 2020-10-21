const express = require('express')
const router = express.Router()
const checkIfAuthenticated = require('../auth/utils')
const { translateAliases } = require('../models/User')
const User = require('../models/User')
const Transaction = require('../models/Transaction')
import { v4 as uuidv4 } from 'uuid';


router.post('/createTransaction', function(req, res) {
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
            var transaction = Transaction({uid:uuidv4(), incoming: false, counterparty: counterparty, date: Date.now, amount: amount})
            Transaction.save(function(err) {
                if (err) {
                    res.send('Error creating transaction')
                    return
                }; 
            })
        } else {
            res.send('Too little money')
        }
        


    })
    .catch((err) => {
        res.status(500).send('Error fetching details:' + err)
    })

})

