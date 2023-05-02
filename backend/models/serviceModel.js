const mongoose = require('mongoose')
const Schema = mongoose.Schema


const questionSchema = new Schema({
    question: {
        type: String
    },
    answers: {
        type: [String]
    }
})


const serviceSchema = new Schema({
    localImageName: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    questions: {
        type: [questionSchema],
        required: false
    }
}, { timestamps: true })



const Service = mongoose.model('Service', serviceSchema);
const Question = mongoose.model('Question', questionSchema);

module.exports = {
  Service: Service,
  Question: Question
}