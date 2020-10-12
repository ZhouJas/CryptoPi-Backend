const express = require('express')
const router = express.Router()
const checkIfAuthenticated = require('../auth/utils')
const { translateAliases } = require('../models/User')
const User = require('../models/User')

router.post('/createTransaction', checkIfAuthenticated, function(req, res) {
    const uid = res.locals.uid; // Get user ID
    const counterparty = req.query.counterparty;
    const amount = req.query.amount;
    const note = req.query.note;

    // Do the stuff here i guess
})

