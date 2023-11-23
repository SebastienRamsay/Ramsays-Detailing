const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      required: true,
    },
    clientCodes: {
      type: String,
      required: false,
    },
    isEmployee: {
      type: Boolean,
      required: true,
    },
    location: {
      type: String,
      required: false,
    },
    services: {
      type: [String],
      required: false,
    },
    distance: {
      type: Number,
      required: false,
      min: 5, // Minimum value allowed
      max: 50, // Maximum value allowed
    },
    vacationTime: {
      startDate: {
        type: String,
        required: false,
      },
      endDate: {
        type: String,
        required: false,
      },
    },
    schedule: {
      sunday: {
        startTime: {
          type: String,
          required: false,
        },
        endTime: {
          type: String,
          required: false,
        },
      },
      monday: {
        startTime: {
          type: String,
          required: false,
        },
        endTime: {
          type: String,
          required: false,
        },
      },
      tuesday: {
        startTime: {
          type: String,
          required: false,
        },
        endTime: {
          type: String,
          required: false,
        },
      },
      wednesday: {
        startTime: {
          type: String,
          required: false,
        },
        endTime: {
          type: String,
          required: false,
        },
      },
      thursday: {
        startTime: {
          type: String,
          required: false,
        },
        endTime: {
          type: String,
          required: false,
        },
      },
      friday: {
        startTime: {
          type: String,
          required: false,
        },
        endTime: {
          type: String,
          required: false,
        },
      },
      saturday: {
        startTime: {
          type: String,
          required: false,
        },
        endTime: {
          type: String,
          required: false,
        },
      },
    },
    requestedLocation: {
      type: String,
      required: false,
    },
    requestedServices: {
      type: [String],
      required: false,
    },
    requestedDistance: {
      type: Number,
      required: false,
      min: 5, // Minimum value allowed
      max: 50, // Maximum value allowed
    },
    bookings: {
      type: [Schema.Types.ObjectId],
      ref: "Booking",
      required: false,
      default: [],
    },
    ClaimedBookings: {
      type: [Schema.Types.ObjectId],
      ref: "Booking",
      required: false,
      default: [],
    },
    CompleteBookings: {
      type: [Schema.Types.ObjectId],
      ref: "Booking",
      required: false,
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.statics.findOrCreate = async function findOrCreate(condition, doc) {
  const self = this;
  const result = await self.findOne(condition);

  return result || self.create(doc);
};

//static login method
userSchema.statics.login = async function (profile, clientCodes) {
  try {
    const user = await this.findOrCreate({
      email: profile.email,
      lastName: profile.displayName,
      clientCodes: clientCodes,
    });
  } catch (error) {
    console.log(error);
    return error;
  }

  return user;
};
module.exports = mongoose.model("User", userSchema);
