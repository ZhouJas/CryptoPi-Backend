const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
    {
        uid: {
            type: String,
            required: false,
            unique: false
        },
        incoming: Boolean, // If receiving, this is true, if sending, this is false
        counterparty: String, // Other person
        date: Date, 
        amount: Number
    },
    {strict: false}
)

module.exports = UserCourse = mongoose.model("transaction", TransactionSchema);