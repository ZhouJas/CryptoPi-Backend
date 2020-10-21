const mongoose = require('mongoose');
const Transaction = require('./Transaction');

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        ethId: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true,
        },
        azureId: {
            type: String,
            required: false
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
    },
    {strict: false}
)

module.exports = User = mongoose.model("users", UserSchema);