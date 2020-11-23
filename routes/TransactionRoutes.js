const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Web3 = require('web3')
var web3 = new Web3('https://rinkeby.infura.io/v3/1f9e08b44e114893950fbe09995e6061');
const Transaction = require('../models/Transaction')

router.post('/createTransaction', function (req, res) { // http://localhost:8080/transactions/createTransaction
    //Transfer funds via ethereum. Additional funds will be exhausted from senderfor gas (trasnaction fee)
    //All units are in Wei (10^-18 eth)
    const tag = req.body.tag; //sender
    const reader = req.body.reader; //receiver
    const amount = req.body.money;
    const note = req.body.note;
    const facePicture = req.body.file;

    User.findOne({ piTag: tag }).then((user) => {
        User.findOne({ piTag: reader }).then((counter) => {
            if (user == null) res.status(404).send('Error fetching User details')
            web3.eth.getBalance(user.ethAccount.address).then((ethBalance) => {
                if (amount <= Number(ethBalance)) {
                    //Configuring transactionObject to send to rinkeby test chain
                    var transactionObject = { to: counter.ethAccount.address, value: amount, gas: 100000 }
                    web3.eth.accounts.signTransaction(transactionObject, user.ethAccount.privateKey).then((signedContract) => {
                        web3.eth.sendSignedTransaction(signedContract.rawTransaction).on('receipt', receipt => {
                            //upon retrival of receipt, log transaction and update balance for users involved.
                            var today = new Date();

                            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

                            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

                            var dateTime = date + ' ' + time;

                            var transaction = Transaction({ uid: receipt.transactionHash, incoming: false, counterparty: counter.username, date: dateTime.toString(), amount: amount })

                            user.transactions.unshift(transaction);

                            transaction.incoming = true;
                            transaction.counterparty = user.username;

                            counter.transactions.unshift(transaction);
                            transaction.incoming = null;
                            transaction.user = user.username;
                            transaction.counterparty = counter.username;
                            transaction.save()
                                .catch(err => {
                                    res.send(err);
                                })

                            web3.eth.getBalance(user.ethAccount.address).then(balance => {
                                user.balance = balance;
                                user.save(function (err) {
                                    if (err) {
                                        res.send(err);
                                        return;
                                    };
                                });
                            });
                            web3.eth.getBalance(counter.ethAccount.address).then(balance => {
                                counter.balance = balance;
                                counter.save(function (err) {
                                    if (err) {
                                        res.send(err);
                                        return;
                                    };
                                });
                            });
                            res.send(receipt);
                        })

                    })


                } else {
                    res.send('Too little money')
                }
            }).catch((err) => {
                res.send(err);
                return;
            })
        }).catch((err) => {
            res.status(500).send('Error fetching details:' + err)
        })
    })
        .catch((err) => {
            res.status(500).send('Error fetching details:' + err)
        })

})
module.exports = router
