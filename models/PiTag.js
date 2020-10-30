const mongoose = require('mongoose');

const PiTagSchema = new mongoose.Schema(
    {
        piTag: {
            type: String,
            required: true,
            unique: true
        },
    },
    {strict: false}
)

module.exports = PiTag = mongoose.model("piTag", PiTagSchema);