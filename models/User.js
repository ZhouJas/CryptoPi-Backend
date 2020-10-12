const mongoose = require('mongoose');
const Transaction = require('./Transaction');

const UserSchema = new mongoose.Schema(
    {
        uid: {
            type: String,
            required: true,
            unique: true
        },
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        transactions: {
            type: [Transaction.schema],
            default: []
        },
        recentContacts: {
            type: [String],
            required: true,
            unique: false,
            default: []
        },
        balance: {
            type: Number,
            required: true,
            unique: false,
            default: 0
        },
        note: String
    },
    {strict: false}
)

module.exports = User = mongoose.model("users", UserSchema);