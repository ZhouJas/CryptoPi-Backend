const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Transaction = require('../models/Transaction')


// USE THE WEB3.JS library --> connect to ethereum
// Azure cognitive api
//Azure stuff that may need to be kept here
'use strict';

const axios = require('axios').default;

// Add a valid subscription key and endpoint to your environment variables.
let subscriptionKey = process.env['1bed1a2a467947e2ad81cc6807288c28']
let endpoint = process.env['https://cryptopi.cognitiveservices.azure.com'] + '/face/v1.0/detect'
let imageUrl = 'https://raw.githubusercontent.com/PhilbertLou/cryptopipi/main/IMG_2876.JPG?token=AP3TC5WYZVODCEOW6VSMYWS7YG2X2'

router.post('/createTransaction', function(req, res) { // http://localhost:8080/transactions/createTransaction
    const tag = req.body.tag; // Get user ID
    //const password = req.body.pass; add back password
    const reader = req.body.reader; //use this code after pi integration
    // const username = req.body.username; // Get user ID
    // const counterparty = req.body.counterparty;
    const amount = req.body.money;
    const note = req.body.note;
    const facePicture = req.body.file;

    User.findOne({piTag: tag}).then( (user) => {
        User.findOne({piTag: reader}).then( (counter) => { //this will be the code to use when we integrate the pis

        if (user == null) res.status(404).send('Error fetching User details')
        
        //AZURE STUFF
        var faceId

        axios({
            method: 'post',
            url: endpoint,
            params : {
                detectionModel: 'detection_02',
                returnFaceId: true
            },
            data: {
                url: imageUrl, 
            },
            headers: { 'Ocp-Apim-Subscription-Key': subscriptionKey }
        }).then(function (response) {
            console.log('Status text: ' + response.status)
            console.log('Status text: ' + response.statusText)
            console.log()
            console.log(response.data)
            faceId = response.data.faceId
        }).catch(function (error) {
            console.log(error)
        });

        if (faceId != user.azureId) {
            res.status(401).send('Unauthorized')
            return
        }


        var balance = user.balance // This should eventually get from ethereum


        if (amount <= balance) {
            // We can send money!
            //deducting/adding amount from repsective accounts
            user.balance -= amount;
            counter.balance+=amount;

            // Create the actual transaction object to log this
            var rng = Math.floor(Math.random() * 1000000000);
            var today = new Date();

            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

            var dateTime = date+' '+time;
            
            var transaction = Transaction({uid:rng.toString(), incoming: false, counterparty: counter.username, date: dateTime.toString(), amount: amount})
            
            user.transactions.unshift(transaction);
            
            transaction.incoming = true;
            transaction.counterparty = user.username;

            counter.transactions.unshift(transaction);


            user.save(function (err) {
                if (err) {
                    res.send(err)
                    return
                };
            });
            counter.save(function (err) {
                if (err) {
                    res.send(err)
                    return
                };
            });
            // This is where you send through ethereum
            
            res.send(`Transaction Success! ${amount} ETH was successfully sent!`);
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
        }).catch((err) => {
            res.status(500).send('Error fetching details:' + err)
        })
    })
    .catch((err) => {
        res.status(500).send('Error fetching details:' + err)
    })

})

// Dont use websockets

module.exports = router
