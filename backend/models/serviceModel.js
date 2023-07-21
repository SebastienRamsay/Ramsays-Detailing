const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const answerSchema = new Schema({
  answer: {
    type: String,
    required: true,
  },
  costIncrease: {
    type: Number,
    required: true,
  },
  additionalQuestions: {
    type: [
      {
        question: {
          type: String,
          maxLength: 25,
        },
        answers: [
          {
            answer: {
              type: String,
              required: true,
            },
            costIncrease: {
              type: Number,
              required: true,
            },
          },
        ],
        required: false,
      },
    ],
    default: undefined,
    required: false,
  },
});

const questionSchema = new Schema({
  question: {
    type: String,
    required: true,
    maxLength: 25,
  },
  answers: {
    type: [answerSchema],
  },
});

const serviceSchema = new Schema(
  {
    localImageName: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    timeToComplete: {
      type: Number,
      required: true,
    },
    questions: {
      type: [questionSchema],
      required: false,
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);
const Question = mongoose.model("Question", questionSchema);

module.exports = {
  Service: Service,
  Question: Question,
};
