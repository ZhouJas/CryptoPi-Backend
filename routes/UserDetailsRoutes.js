const express = require('express')
const Transaction = require('../models/Transaction')
const router = express.Router()
const User = require('../models/User')
const PiTag = require('../models/PiTag')

//http://localhost:8080/register
// Request body --> JSON file 

function convert() {
    // our Transaction() object
}

router.post('/addPi', function(req,res){ //from pi, add pi to list of available piss
    const piTag = req.body.piTag;

    var today = new Date();

    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    var dateTime = date+' '+time;

    var tag = PiTag({piTag: piTag, date: dateTime.toString()})

    User.count({piTag: piTag}, function (err, count){ 
        PiTag.count({piTag: piTag}, function (err, count2){ 
            if(count>0){
                res.send("Pi already registered")
            }else if(count2>0){
                res.send("Pi already added to list")
            }else{
                tag.save(function (err) {
                    if (err) {
                        res.send(err)
                        return
                    };
                    res.send('Pi Tag added to list')
                });
            }
        });
    });

    
})

router.get('/getPis', function(req,res){ //lists pis available to register to account (meant for webapp)
    PiTag.find({}).then( (tag) => {
        res.json({
            tag:tag
        })

    }).catch((err) => {
        res.status(500).send('Error fetching details:' + err)
    })
})

router.post('/registerPi',function(req,res){
    const username = req.body.username;
    const password = req.body.password;
    const piTag = req.body.piTag;

    User.findOne({username: username}).then( (user) => {
        if (user == null) res.status(404).send('Error fetching homepage details')
        if (password != user.password) {
            res.status(401).send('Unauthorized')
            return
        }

        user.piTag = piTag; //sets the users pi tag

        PiTag.findOne({piTag:piTag}).then((tag) => {
            tag.remove() //removes pi tag from list of available pi tags
        })

        user.save(function (err) {
            if (err) {
                res.send(err)
                return
            };
            res.send("Registered Pi to account")
        });

    }).catch((err) => {
        res.status(500).send('Error fetching details:' + err)
    })


})

router.post('/register', function(req,res){
    const username = req.body.username; 
    const password = req.body.password;
    // const piTag = req.body.piTag
    const balance = req.body.balance; //For testing only, to integrate with eth later
    const photo = req.body.photo; // This should be passed to the azure api --> we can do this part later

    // ETH id should be the actual ethereum id


    // This should now send to the azure api


    var user = User({username: username, password: password, balance: balance, ethId: 'feifjeiofjewiof'})
    // var user = User({username: username, password: password, piTag: tag, balance: balance, ethId: 'feifjeiofjewiof'}) //use this code after pi integration
    user.save(function (err) {
        if (err) {
            res.send(err)
            return
        };
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
        // Get new balance
        // Update it for the user

        var balance = user.balance

        res.json({
            balance: balance,
        });
    })
    .catch((err) => {
        res.status(500).send('Error fetching details:' + err)
    })
})


/*

Without populate


User {
    name: "Hello"
    ...
    transactions: [Transaction1, Transaction2, Transaction3]
}

With populate

User {
    name: "Hello"
    ...
    transactions: [
        {
            uuid: 24343243
            incoming: true
            counterparty: "hwfeufehuwei"
        }    
    ]
}


*/

//http://localhost:8080/userDetails/getTransactions
router.get('/getTransactions', function(req, res) {
    const recent = req.body.recent; // This tells you if you need to only send back recent ones (idk maybe like last 5, or maybe in last week)
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