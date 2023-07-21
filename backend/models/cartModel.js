const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    price: {
      type: Number,
      required: true,
      default: 0,
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
  },
  { timestamps: true }
);

cartSchema.statics.addToCart = async function (user_id, service) {
  try {
    let cart = await this.findOne({ user_id });

    if (!cart) {
      cart = new this({
        user_id,
        price: service.price,
        services: [
          {
            title: service.title,
            price: service.price,
            answeredQuestions: service.answeredQuestions,
          },
        ],
      });
    } else {
      cart.price += service.price;
      cart.services.push({
        title: service.title,
        price: service.price,
        answeredQuestions: service.answeredQuestions,
      });
    }

    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(error);
  }
};

cartSchema.statics.removeFromCart = async function (user_id, service_id) {
  try {
    const cart = await this.findOne({ user_id });

    if (!cart) {
      throw new Error("No active cart found");
    }

    const service = cart.services.find((s) => s._id.toString() === service_id);
    if (!service) {
      throw new Error("Service not found in cart");
    }

    cart.price -= service.price;
    cart.services = cart.services.filter(
      (s) => s._id.toString() !== service_id
    );

    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = mongoose.model("Cart", cartSchema);
