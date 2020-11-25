const express = require('express')
const Transaction = require('../models/Transaction')
const router = express.Router()
const User = require('../models/User')
const PiTag = require('../models/PiTag')
const EthAccount = require('../models/EthAccount')
const Web3 = require('web3')
var web3 = new Web3('https://rinkeby.infura.io/v3/1f9e08b44e114893950fbe09995e6061');

//http://localhost:8080/register
// Request body --> JSON file 

function convert() {
    // our Transaction() object
}

router.post('/addPi', function (req, res) { //from pi, add pi to list of available piss
    const piTag = req.body.piTag;

    var today = new Date();

    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    var dateTime = date + ' ' + time;

    var tag = PiTag({ piTag: piTag, date: dateTime.toString() })

    User.count({ piTag: piTag }, function (err, count) {
        PiTag.count({ piTag: piTag }, function (err, count2) {
            if (count > 0) {
                res.send("Pi already registered")
            } else if (count2 > 0) {
                res.send("Pi already added to list")
            } else {
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

router.get('/getPis', function (req, res) { //lists pis available to register to account (meant for webapp)
    PiTag.find({}).then((tag) => {
        res.json({
            tag: tag
        })

    }).catch((err) => {
        res.status(500).send('Error fetching details:' + err)
    })
})

router.post('/registerPi', function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const piTag = req.body.piTag;

    User.findOne({ username: username }).then((user) => {
        if (user == null) res.status(404).send('Error fetching homepage details')
        if (password != user.password) {
            res.status(401).send('Unauthorized')
            return
        }

        user.piTag = piTag; //sets the users pi tag

        PiTag.findOne({ piTag: piTag }).then((tag) => {
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

router.post('/register', function (req, res) {
    /*Creates new account associated with eth account. 
    If private key is provided and there is no duplicate in database, 
    the eth account already associated with the private key will become associated with the user account*/
    const username = req.body.username;
    const password = req.body.password;
    const privateKey = req.body.privateKey;
    const photo = req.body.photo;
    if (privateKey != null) {
        const account = web3.eth.accounts.privateKeyToAccount(privateKey);
        const ethAccount = EthAccount({ address: account.address, privateKey: account.privateKey })
        web3.eth.getBalance(account.address).then((ethBalance) => {

            var user = User({ username: username, password: password, balance: ethBalance, ethAccount: ethAccount })
            user.save(function (err) {
                if (err) {
                    res.send(err)
                    return
                };
                res.send(`Created account! address is ${user.ethAccount.address}, private key is ${user.ethAccount.privateKey}`)
                return;
            });
        }).catch((err) => {
            res.status(500).send('Error creating account' + err)
            return;
        })
    } else {
    const account = web3.eth.accounts.create();
    const ethAccount = EthAccount({ address: account.address, privateKey: account.privateKey })
    web3.eth.getBalance(account.address).then((ethBalance) => {

        var user = User({ username: username, password: password, balance: ethBalance, ethAccount: ethAccount })
        user.save(function (err) {
            if (err) {
                res.send(err)
                return
            };
            res.send(`Created account! address is ${user.ethAccount.address}, private key is ${user.ethAccount.privateKey}`)
        });
    }).catch((err) => {
        res.status(500).send('Error creating account' + err)
    })}
})

router.get('/balance', function (req, res) {
    //calls on eth network and returns a string displaying user balance in wei
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ username: username }).then((user) => {
        if (user == null) res.status(404).send('Error fetching homepage details')
        if (password != user.password) {
            res.status(401).send('Unauthorized')
            return
        }
        //obtains balance and updates it on user's profile
        console.log(user.ethAccount.address);
        web3.eth.getBalance(user.ethAccount.address).then((ethBalance) => {
            user.balance = ethBalance;
            user.save(function (err) {
                if (err) {
                    res.send(err);
                    return;
                };
            });
            res.json({
                "balance": ethBalance,
            });
        }).catch((err) => {
            res.send(err);
            return;
        })
    }).catch((err) => {
        res.send(err);
        return;
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
router.get('/getTransactions', function (req, res) {
    const recent = false;//req.query.recent; // This tells you if you need to only send back recent ones (idk maybe like last 5, or maybe in last week)
    const username = req.query.username; // Get user ID
    const password = req.query.password;

    User.findOne({ username: username }).populate('transactions').then((user) => {
        console.log(user) // Debug statement, remove this eventually
        if (user == null) res.status(404).send('Error fetching homepage details')

        // This should eventually get from ethereum --> check for new transactions and import them
        let transactions = recent ? user.transactions.slice(0, 8) : user.transactions

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