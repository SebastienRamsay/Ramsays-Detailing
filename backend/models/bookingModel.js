const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
    },
    possibleemployeeIds: {
      type: [String],
      required: false,
    },
    userEventId: {
      type: String,
      required: true,
    },
    employeeEventId: {
      type: String,
      required: true,
    },
    beforePictures: {
      type: [String],
      required: false,
      default: [],
    },
    afterPictures: {
      type: [String],
      required: false,
      default: [],
    },
    services: [
      {
        title: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        localImageName: {
          type: String,
          required: true,
        },
        timeToComplete: {
          type: Number,
          required: true,
        },
        answeredQuestions: [
          {
            question: {
              type: String,
              required: true,
            },
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
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    expectedTimeToComplete: {
      type: Number,
      required: true,
    },
    summary: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    cart: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
