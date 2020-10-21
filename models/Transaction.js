const mongoose = require('mongoose');
const Web3 = require('web3');

const TransactionSchema = new mongoose.Schema(
    {
        uid: {
            type: String,
            required: true,
            unique: true
        },
        incoming: Boolean,
        counterparty: String,
        date: Date,
        amount: Number
    },
    {strict: false}
)

module.exports = UserCourse = mongoose.model("transaction", TransactionSchema);