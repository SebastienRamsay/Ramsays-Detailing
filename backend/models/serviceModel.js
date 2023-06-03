const mongoose = require('mongoose')
const Schema = mongoose.Schema

const answerSchema = new Schema({
    answer: {
        type: String,
        required: true
    },
    costIncrease: {
        type: Number
    }
})

const questionSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    answers: {
        type: [answerSchema]
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