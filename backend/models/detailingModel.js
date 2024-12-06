const mongoose = require('mongoose')
const Schema = mongoose.Schema

const detailingSchema = new Schema({
    services: {
        type: [String],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: false
    },
    time: {
        type: String,
        required: false
    },
    expectedTimeToComplete: {
        type: String,
        required: false
    },
    notes: {
        type: String,
        required: false
    }
}, { timestamps: true })

module.exports = mongoose.model('Detailing', detailingSchema)