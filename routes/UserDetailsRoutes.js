const express = require('express')
const router = express.Router()
const checkIfAuthenticated = require('../auth/utils')
const User = require('../models/User')

router.get('/balance', checkIfAuthenticated, function(req, res) {
    const uid = res.locals.uid; // Get user ID
    User.findOne({uid: uid}).then( (user) => {
        console.log(user) // Debug statement, remove this eventually
        if (user == null) res.status(404).send('Error fetching homepage details')
        var balance = user.balance
        res.json({
            balance: balance,
        });
    })
    .catch((err) => {
        res.status(500).send('Error fetching details:' + err)
    })
})

router.get('/transactions', checkIfAuthenticated, function(req, res) {
    const recent = req.query.id; // This tells you if you need to only send back recent ones (idk maybe like last 5, or maybe in last week)
    const uid = res.locals.uid; // Get user ID
    User.findOne({uid: uid}).populate('transactions').then( (user) => {
        console.log(user) // Debug statement, remove this eventually
        if (user == null) res.status(404).send('Error fetching homepage details')
        let transactions = user.transactions.slice(0,10) // 10 latest ones --> this should be configured by recent
        res.json({
            transactions: transactions
        });
    })
    .catch((err) => {
        res.status(500).send('Error fetching details:' + err)
    })
})

router.post('/updateNote/:transactionID', checkIfAuthenticated, function(req, res) {
    var transactionID = req.params.transactionID
    var newNote = req.query.note
    console.log('updating transaction ' + transactionID + ' with note: ' + newNote)
    const uid = res.locals.uid; // Get user ID
    User.findOne({uid: uid}).populate('transactions').then( (user) => {
        if (user == null) res.status(404).send('Error fetching  details')
        var foundTransaction;
        console.log(user.transactions)
        for (var i = 0; i < user.transactions.length; i++) {
            var transactionIndex = i
            if (user.transactions[transactionIndex].uid.localeCompare(course) == 0) {
                foundTransaction = courseIndex
                console.log('Found course!')
            }
        }

        if (foundTransaction == null) {
            if (user == null) res.status(404).send('Can\'t find transaction')
        } else {
            user.transactions[foundTransaction].note = newNote;
            user.save().then((usr) => {
                res.send('Done!')
            })
            .catch((err) => {
                res.send('Error saving data' + err)
            })
        }
    })
    .catch((err) => {
        res.status(500).send('Error fetching details:' + err)
    })
})

module.exports = router