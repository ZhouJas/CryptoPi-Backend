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
let subscriptionKey = 'replace with your own subscription key'
let endpoint = ['https://crypto-pi.cognitiveservices.azure.com/face/v1.0/detect','https://crypto-pi.cognitiveservices.azure.com/face/v1.0/findsimilars']

router.post('/test',function(req,res){
    // axios({
    //     method: 'post',
    //     url: endpoint[0],
    //     data: {
    //         faceId: "336617b9-86ca-4382-8f92-585cfe4a4f27", 
    //         faceListId: "crypto-pi"
    //     },
    //     headers: { 
    //         'Ocp-Apim-Subscription-Key': subscriptionKey,
    //         'Content-Type'
    //     }
    // }).then(function (response){
    //     console.log('Status text: ' + response.status)
    //     console.log('Status text: ' + response.statusText)
    //     console.log()
    //     console.log(response.data)
    //     res.send("test")
    // }).catch(function (error) {
    //     console.log(error)
    // })
    axios.post(endpoint[1], {
        faceId: '336617b9-86ca-4382-8f92-585cfe4a4f27', 
        faceListId: 'crypto-pi'
    }, {
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey
            }
    })
    .then(response => { 
        console.log(response)
    })
    .catch(error => {
        console.log(error.response)
    });
})

router.post('/createTransaction', function(req, res) { // http://localhost:8080/transactions/createTransaction
    const tag = req.body.tag; // Get user ID
    const reader = req.body.reader;
    const amount = req.body.money;
    const note = req.body.note;
    const facePicture = req.body.file;

    User.findOne({piTag: tag}).then( (user) => {
        User.findOne({piTag: reader}).then( (counter) => { //this will be the code to use when we integrate the pis

        if (user == null) res.status(404).send('Error fetching User details')
        
        //AZURE STUFF
        var ID, faceId


        axios({
            method: 'post',
            url: endpoint[0],
            params : {
                detectionModel: 'detection_02',
                returnFaceId: true,
                recognitionModel: 'recognition_03'
            },
            data: {
                url: facePicture, 
            },
            headers: { 'Ocp-Apim-Subscription-Key': subscriptionKey }
        }).then(function (response) {
            // console.log('Status text: ' + response.status)
            // console.log('Status text: ' + response.statusText)
            // console.log()
            console.log(response.data)
            ID = response.data[0].faceId
            
            // console.log(ID)
            // console.log(user.azureId)

            // axios.post(endpoint[1], {
            //     faceId: ID, 
            //     faceListId: 'crypto-pi'
            // }, {
            //         headers: {
            //             'Ocp-Apim-Subscription-Key': subscriptionKey
            //         }
            // })
            // .then(response => { 
            //     console.log(response)
            //     res.send('test');
            // })
            // .catch(error => {
            //     console.log(error.response)
            // });

            axios({
                method: 'post',
                url: endpoint[1],
                data: {
                    faceId: ID,
                    faceListId: "crypto-pi",
                    maxNumOfCandidatesReturned:1
                },
                headers: { 'Ocp-Apim-Subscription-Key': subscriptionKey }
            }).then(function (response) {

                console.log(response.data)
                faceId = response.data[0].persistedFaceId
                if (faceId != user.azureId && response.data[0].confidence > 0.7) {
                    res.status(401).send(`Facial recognition failed`)
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
            }).catch(function (error) {
                console.log(error)
            })


        }).catch(function (error) {
            console.log(error)
        })

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
